package com.sirine.applyflow.job.impl;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.entity.JobApplication;
import com.sirine.applyflow.application.repository.JobApplicationRepository;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobListingRepository;
import com.sirine.applyflow.job.JobMatchResult;
import com.sirine.applyflow.job.JobMatchService;
import com.sirine.applyflow.job.JobService;
import com.sirine.applyflow.job.response.JobCardResponse;
import com.sirine.applyflow.job.response.JobDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobMatchService jobMatchService;

    @Override
    @Transactional(readOnly = true)
    public Page<JobCardResponse> list(
            final String userId,
            final String query,
            final Boolean remoteOnly,
            final Integer minMatch,
            final List<String> roleTypes,
            final int page,
            final int size) {
        final List<JobListing> jobs = jobListingRepository.findByActiveTrueOrderByPostedAtDesc();
        final Map<String, JobApplication> applicationsByListingId = applicationsByListing(userId, jobs);

        final List<JobCardResponse> filtered = jobs.stream()
                .map(job -> toCard(job, applicationsByListingId.get(job.getId()), jobMatchService.score(userId, job)))
                .filter(card -> matchesQuery(card, query))
                .filter(card -> remoteOnly == null || !remoteOnly || card.remoteEligible())
                .filter(card -> minMatch == null || (card.matchScore() != null && card.matchScore() >= minMatch))
                .filter(card -> roleTypes == null || roleTypes.isEmpty() || roleTypes.stream().anyMatch(type -> type.equalsIgnoreCase(card.roleType())))
                .toList();

        final int fromIndex = Math.min(page * size, filtered.size());
        final int toIndex = Math.min(fromIndex + size, filtered.size());

        return new PageImpl<>(filtered.subList(fromIndex, toIndex), org.springframework.data.domain.PageRequest.of(page, size), filtered.size());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetailResponse get(final String id, final String userId) {
        final JobListing listing = jobListingRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.JOB_LISTING_NOT_FOUND, id));
        final JobApplication application = applicationRepository.findByUserIdAndJobListingId(userId, id).orElse(null);
        final JobMatchResult match = jobMatchService.score(userId, listing);

        return new JobDetailResponse(
                listing.getId(),
                listing.getCompanyName(),
                listing.getCompanyLogoText(),
                listing.getCompanyColor(),
                listing.getTitle(),
                listing.getLocation(),
                listing.isRemoteEligible(),
                listing.getSalaryMin(),
                listing.getSalaryMax(),
                listing.getCurrency(),
                listing.getDescription(),
                listing.getRequiredSkills(),
                listing.getRoleType(),
                listing.getSourceUrl(),
                listing.getPostedAt(),
                match.score(),
                application != null && application.getStatus() == ApplicationStatus.SAVED,
                application != null && application.getStatus() != ApplicationStatus.SAVED,
                match.matchedSkills(),
                buildSalaryInsight(listing, match.score()),
                buildInterviewTip(listing, match.matchedSkills())
        );
    }

    private Map<String, JobApplication> applicationsByListing(final String userId, final List<JobListing> jobs) {
        final List<String> listingIds = jobs.stream().map(JobListing::getId).toList();
        final Map<String, JobApplication> map = new HashMap<>();
        applicationRepository.findByUserIdAndJobListingIdIn(userId, listingIds)
                .forEach(application -> {
                    if (application.getJobListing() != null) {
                        map.put(application.getJobListing().getId(), application);
                    }
                });
        return map;
    }

    private JobCardResponse toCard(final JobListing job, final JobApplication application, final JobMatchResult match) {
        return new JobCardResponse(
                job.getId(),
                job.getCompanyName(),
                job.getCompanyLogoText(),
                job.getCompanyColor(),
                job.getTitle(),
                job.getLocation(),
                job.isRemoteEligible(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getCurrency(),
                job.getRoleType(),
                job.getPostedAt(),
                match.score(),
                application != null && application.getStatus() == ApplicationStatus.SAVED,
                application != null && application.getStatus() != ApplicationStatus.SAVED,
                match.matchedSkills()
        );
    }

    private boolean matchesQuery(final JobCardResponse card, final String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        final String needle = query.toLowerCase(Locale.ROOT);
        return card.companyName().toLowerCase(Locale.ROOT).contains(needle)
                || card.title().toLowerCase(Locale.ROOT).contains(needle)
                || card.location().toLowerCase(Locale.ROOT).contains(needle)
                || card.roleType().toLowerCase(Locale.ROOT).contains(needle)
                || card.matchedSkills().stream().anyMatch(skill -> skill.toLowerCase(Locale.ROOT).contains(needle));
    }

    private String buildSalaryInsight(final JobListing listing, final int matchScore) {
        if (listing.getSalaryMin() == null || listing.getSalaryMax() == null) {
            return "Salary range is not disclosed, so prioritize role fit and scope in your review.";
        }
        return "This role is listed at %s %s-%s and currently scores %s%% against your saved preferences."
                .formatted(
                        listing.getCurrency() == null ? "" : listing.getCurrency(),
                        listing.getSalaryMin(),
                        listing.getSalaryMax(),
                        matchScore);
    }

    private String buildInterviewTip(final JobListing listing, final List<String> matchedSkills) {
        if (!matchedSkills.isEmpty()) {
            return "Lead with %s and connect it to %s's %s scope."
                    .formatted(String.join(", ", matchedSkills.stream().limit(3).toList()), listing.getCompanyName(), listing.getRoleType());
        }
        return "Anchor your examples around measurable outcomes and why %s fits your next step.".formatted(listing.getCompanyName());
    }
}
