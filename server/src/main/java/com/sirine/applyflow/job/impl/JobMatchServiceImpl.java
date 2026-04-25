package com.sirine.applyflow.job.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobMatchResult;
import com.sirine.applyflow.job.JobMatchService;
import com.sirine.applyflow.profile.CandidateProfile;
import com.sirine.applyflow.profile.CandidateProfileRepository;
import com.sirine.applyflow.profile.RemotePreference;
import com.sirine.applyflow.resume.ResumeDocumentRepository;
import com.sirine.applyflow.resume.ResumeSection;
import com.sirine.applyflow.resume.SectionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobMatchServiceImpl implements JobMatchService {

    private static final double SKILLS_WEIGHT = 50.0;
    private static final double ROLE_WEIGHT = 20.0;
    private static final double LOCATION_WEIGHT = 15.0;
    private static final double EXPERIENCE_WEIGHT = 10.0;
    private static final double SALARY_WEIGHT = 5.0;

    private final CandidateProfileRepository profileRepository;
    private final ResumeDocumentRepository resumeRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public JobMatchResult score(final String userId, final JobListing listing) {
        final CandidateProfile profile = profileRepository.findByUser_Id(userId).orElse(null);
        final Set<String> candidateSkills = collectCandidateSkills(userId, profile);
        final Set<String> requiredSkills = normalizeAll(listing.getRequiredSkills());

        final List<String> matchedSkills = requiredSkills.stream()
                .filter(candidateSkills::contains)
                .toList();

        final double skillsScore = requiredSkills.isEmpty()
                ? SKILLS_WEIGHT * 0.5
                : SKILLS_WEIGHT * ((double) matchedSkills.size() / requiredSkills.size());

        final double roleScore = computeRoleScore(profile, listing);
        final double locationScore = computeLocationScore(profile, listing);
        final double experienceScore = computeExperienceScore(profile, listing);
        final double salaryScore = computeSalaryScore(profile, listing);

        final int score = (int) Math.round(skillsScore + roleScore + locationScore + experienceScore + salaryScore);

        return new JobMatchResult(
                score,
                matchedSkills,
                round(skillsScore),
                round(roleScore),
                round(locationScore),
                round(experienceScore),
                round(salaryScore)
        );
    }

    private Set<String> collectCandidateSkills(final String userId, final CandidateProfile profile) {
        final Set<String> skills = new LinkedHashSet<>();
        if (profile != null && profile.getSkills() != null) {
            skills.addAll(normalizeAll(profile.getSkills()));
        }

        resumeRepository.findByUser_IdAndPrimaryTrue(userId).ifPresent(resume ->
                resume.getSections().stream()
                        .filter(section -> section.getType() == SectionType.SKILL)
                        .map(ResumeSection::getRawJson)
                        .forEach(rawJson -> skills.addAll(extractStringArray(rawJson)))
        );

        return skills;
    }

    private List<String> extractStringArray(final String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            return List.of();
        }
        try {
            final JsonNode node = objectMapper.readTree(rawJson);
            if (!node.isArray()) {
                return List.of();
            }
            return normalizeList(node.findValuesAsText(""));
        } catch (Exception _) {
            return List.of();
        }
    }

    private double computeRoleScore(final CandidateProfile profile, final JobListing listing) {
        if (profile == null || profile.getDesiredRoles() == null || profile.getDesiredRoles().isEmpty()) {
            return ROLE_WEIGHT * 0.4;
        }

        final String haystack = normalize(listing.getTitle() + " " + listing.getRoleType());
        return profile.getDesiredRoles().stream()
                .map(this::normalize)
                .mapToDouble(role -> haystack.contains(role) || role.contains(haystack) ? ROLE_WEIGHT : sharedTokenRatio(role, haystack) * ROLE_WEIGHT)
                .max()
                .orElse(0.0);
    }

    private double computeLocationScore(final CandidateProfile profile, final JobListing listing) {
        if (profile == null) {
            return listing.isRemoteEligible() ? LOCATION_WEIGHT * 0.5 : LOCATION_WEIGHT * 0.25;
        }

        if (listing.isRemoteEligible() && (
                profile.getRemotePreference() == RemotePreference.REMOTE
                        || profile.getRemotePreference() == RemotePreference.HYBRID
                        || profile.getRemotePreference() == RemotePreference.FLEXIBLE)) {
            return LOCATION_WEIGHT;
        }

        final Set<String> desiredLocations = normalizeAll(profile.getDesiredLocations());
        if (desiredLocations.isEmpty()) {
            return listing.isRemoteEligible() ? LOCATION_WEIGHT * 0.65 : LOCATION_WEIGHT * 0.5;
        }

        final String location = normalize(listing.getLocation());
        if (desiredLocations.stream().anyMatch(location::contains)) {
            return LOCATION_WEIGHT;
        }

        return 0.0;
    }

    private double computeExperienceScore(final CandidateProfile profile, final JobListing listing) {
        if (profile == null || profile.getYearsExperience() == null) {
            return EXPERIENCE_WEIGHT * 0.5;
        }

        final int targetYears = inferTargetExperience(listing.getTitle());
        if (targetYears <= 0) {
            return EXPERIENCE_WEIGHT;
        }

        return EXPERIENCE_WEIGHT * Math.min(1.0, (double) profile.getYearsExperience() / targetYears);
    }

    private double computeSalaryScore(final CandidateProfile profile, final JobListing listing) {
        if (listing.getSalaryMin() == null || listing.getSalaryMax() == null) {
            return SALARY_WEIGHT * 0.5;
        }
        if (profile == null || profile.getSalaryMin() == null || profile.getSalaryMax() == null) {
            return SALARY_WEIGHT * 0.6;
        }

        final boolean overlaps = profile.getSalaryMin() <= listing.getSalaryMax()
                && profile.getSalaryMax() >= listing.getSalaryMin();
        return overlaps ? SALARY_WEIGHT : 0.0;
    }

    private int inferTargetExperience(final String title) {
        final String normalized = normalize(title);
        if (normalized.contains("staff") || normalized.contains("principal")) {
            return 9;
        }
        if (normalized.contains("lead") || normalized.contains("senior")) {
            return 6;
        }
        if (normalized.contains("mid")) {
            return 3;
        }
        if (normalized.contains("junior") || normalized.contains("associate")) {
            return 1;
        }
        return 4;
    }

    private double sharedTokenRatio(final String left, final String right) {
        final Set<String> leftTokens = normalizeAll(List.of(left.split("\\s+")));
        final Set<String> rightTokens = normalizeAll(List.of(right.split("\\s+")));
        if (leftTokens.isEmpty() || rightTokens.isEmpty()) {
            return 0.0;
        }
        final long matches = leftTokens.stream().filter(rightTokens::contains).count();
        return (double) matches / Math.max(leftTokens.size(), rightTokens.size());
    }

    private Set<String> normalizeAll(final List<String> values) {
        final Set<String> normalized = new LinkedHashSet<>();
        if (values == null) {
            return normalized;
        }
        values.stream()
                .map(this::normalize)
                .filter(value -> !value.isBlank())
                .forEach(normalized::add);
        return normalized;
    }

    private List<String> normalizeList(final java.util.Collection<String> values) {
        return values == null ? List.of() : values.stream()
                .map(this::normalize)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private String normalize(final String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private double round(final double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
