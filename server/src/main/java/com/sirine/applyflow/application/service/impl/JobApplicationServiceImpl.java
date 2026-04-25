package com.sirine.applyflow.application.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.entity.JobApplication;
import com.sirine.applyflow.application.repository.JobApplicationRepository;
import com.sirine.applyflow.application.request.CreateJobApplicationRequest;
import com.sirine.applyflow.application.request.UpdateJobApplicationRequest;
import com.sirine.applyflow.application.response.GenerateDocumentsResponse;
import com.sirine.applyflow.application.response.JobApplicationResponse;
import com.sirine.applyflow.application.response.PrepareJobApplicationResponse;
import com.sirine.applyflow.application.service.JobApplicationService;
import com.sirine.applyflow.document.DocumentType;
import com.sirine.applyflow.document.GeneratedDocument;
import com.sirine.applyflow.document.GeneratedDocumentRepository;
import com.sirine.applyflow.document.response.GeneratedDocumentResponse;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobListingRepository;
import com.sirine.applyflow.job.JobMatchResult;
import com.sirine.applyflow.job.JobMatchService;
import com.sirine.applyflow.profile.CandidateProfile;
import com.sirine.applyflow.profile.CandidateProfileRepository;
import com.sirine.applyflow.resume.*;
import com.sirine.applyflow.resume.response.ResumeDocumentResponse;
import com.sirine.applyflow.user.User;
import com.sirine.applyflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ResumeDocumentRepository resumeRepository;
    private final ResumeMapper resumeMapper;
    private final JobListingRepository jobListingRepository;
    private final JobMatchService jobMatchService;
    private final CandidateProfileRepository profileRepository;
    private final GeneratedDocumentRepository generatedDocumentRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> list(final String userId, final ApplicationStatus filter, final Pageable pageable) {
        final Page<JobApplication> page = filter != null
                ? applicationRepository.findByUserIdAndStatus(userId, filter, pageable)
                : applicationRepository.findByUserId(userId, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse get(final String id, final String userId) {
        return toResponse(findOwnedApplication(id, userId));
    }

    @Override
    @Transactional
    public JobApplicationResponse create(final String userId, final CreateJobApplicationRequest request) {
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));

        final JobListing listing = resolveListing(request.jobListingId());
        final ResumeDocument resume = resolveResume(request.resumeId(), userId);

        final JobApplication application = JobApplication.builder()
                .user(user)
                .jobListing(listing)
                .resume(resume)
                .companyName(firstNonBlank(request.companyName(), listing != null ? listing.getCompanyName() : null))
                .jobTitle(firstNonBlank(request.jobTitle(), listing != null ? listing.getTitle() : null))
                .jobUrl(firstNonBlank(request.jobUrl(), listing != null ? listing.getSourceUrl() : null))
                .notes(request.notes())
                .status(ApplicationStatus.SAVED)
                .matchScore(listing != null ? jobMatchService.score(userId, listing).score() : null)
                .build();

        final JobApplication saved = applicationRepository.save(application);
        log.info("Created job application {} for user {}", saved.getId(), userId);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationResponse update(final String id, final String userId, final UpdateJobApplicationRequest request) {
        final JobApplication application = findOwnedApplication(id, userId);

        if (request.companyName() != null) {
            application.setCompanyName(request.companyName());
        }
        if (request.jobTitle() != null) {
            application.setJobTitle(request.jobTitle());
        }
        if (request.jobUrl() != null) {
            application.setJobUrl(request.jobUrl());
        }
        if (request.resumeId() != null) {
            application.setResume(resolveResume(request.resumeId(), userId));
        }
        if (request.status() != null) {
            applyStatusTransition(application, request.status());
        }
        if (request.nextStep() != null) {
            application.setNextStep(request.nextStep());
        }
        if (request.nextStepAt() != null || request.nextStep() != null) {
            application.setNextStepAt(request.nextStepAt());
        }
        if (request.notes() != null) {
            application.setNotes(request.notes());
        }
        if (request.coverLetter() != null) {
            application.setCoverLetter(request.coverLetter());
        }
        if (request.aiPrepared() != null) {
            application.setAiPrepared(request.aiPrepared());
        }

        return toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public JobApplicationResponse patchStatus(final String id, final String userId, final ApplicationStatus newStatus) {
        final JobApplication application = findOwnedApplication(id, userId);
        applyStatusTransition(application, newStatus);
        return toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public JobApplicationResponse saveForListing(final String listingId, final String userId) {
        return toResponse(upsertListingApplication(listingId, userId, false));
    }

    @Override
    @Transactional
    public PrepareJobApplicationResponse prepareForListing(final String listingId, final String userId) {
        final boolean existed = applicationRepository.findByUserIdAndJobListingId(userId, listingId).isPresent();
        final JobApplication application = upsertListingApplication(listingId, userId, true);
        return new PrepareJobApplicationResponse(application.getId(), !existed);
    }

    @Override
    @Transactional
    public GenerateDocumentsResponse generateDocuments(final String applicationId, final String userId) {
        final JobApplication application = findOwnedApplication(applicationId, userId);
        final JobListing listing = application.getJobListing();
        final CandidateProfile profile = profileRepository.findByUser_Id(userId).orElse(null);
        final ResumeDocument resume = application.getResume() != null
                ? application.getResume()
                : resumeRepository.findByUser_IdAndPrimaryTrue(userId).orElse(null);

        final List<String> suggestions = buildSuggestions(application, listing, profile, resume);
        final String tailoredResumeContent = buildTailoredResume(application, listing, profile, resume, suggestions);
        final String coverLetterContent = buildCoverLetter(application, listing, profile, suggestions);

        final GeneratedDocument tailoredResume = saveGeneratedDocument(
                userId,
                application,
                DocumentType.TAILORED_RESUME,
                "%s - Tailored Resume".formatted(application.getCompanyName()),
                tailoredResumeContent
        );
        final GeneratedDocument coverLetter = saveGeneratedDocument(
                userId,
                application,
                DocumentType.COVER_LETTER,
                "%s - Cover Letter".formatted(application.getCompanyName()),
                coverLetterContent
        );

        application.setCoverLetter(coverLetterContent);
        application.setAiPrepared(true);
        applicationRepository.save(application);

        return new GenerateDocumentsResponse(
                suggestions,
                toGeneratedResponse(tailoredResume),
                toGeneratedResponse(coverLetter),
                LocalDateTime.now()
        );
    }

    @Override
    @Transactional
    public void delete(final String id, final String userId) {
        final JobApplication application = findOwnedApplication(id, userId);
        applicationRepository.delete(application);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByUserId(final String userId) {
        return applicationRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByUserIdAndStatus(final String userId, final ApplicationStatus status) {
        return applicationRepository.countByUserIdAndStatus(userId, status);
    }

    private JobApplication upsertListingApplication(final String listingId, final String userId, final boolean refreshMatch) {
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        final JobListing listing = jobListingRepository.findByIdAndActiveTrue(listingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.JOB_LISTING_NOT_FOUND, listingId));
        final JobMatchResult match = jobMatchService.score(userId, listing);

        final JobApplication application = applicationRepository.findByUserIdAndJobListingId(userId, listingId)
                .orElseGet(() -> JobApplication.builder()
                        .user(user)
                        .jobListing(listing)
                        .status(ApplicationStatus.SAVED)
                        .build());

        application.setJobListing(listing);
        application.setCompanyName(listing.getCompanyName());
        application.setJobTitle(listing.getTitle());
        application.setJobUrl(listing.getSourceUrl());
        if (refreshMatch || application.getMatchScore() == null) {
            application.setMatchScore(match.score());
        }

        return applicationRepository.save(application);
    }

    private GeneratedDocument saveGeneratedDocument(
            final String userId,
            final JobApplication application,
            final DocumentType type,
            final String title,
            final String content) {
        final GeneratedDocument document = generatedDocumentRepository
                .findByUserIdAndApplicationIdAndType(userId, application.getId(), type)
                .orElseGet(() -> GeneratedDocument.builder()
                        .user(application.getUser())
                        .application(application)
                        .type(type)
                        .build());

        document.setTitle(title);
        document.setContent(content);
        document.setMimeType("text/markdown");
        document.setSizeBytes((long) content.length());
        document.setStorageKey(null);

        return generatedDocumentRepository.save(document);
    }

    private List<String> buildSuggestions(
            final JobApplication application,
            final JobListing listing,
            final CandidateProfile profile,
            final ResumeDocument resume) {
        final List<String> suggestions = new ArrayList<>();
        if (listing != null && !listing.getRequiredSkills().isEmpty()) {
            suggestions.add("Emphasize %s in both your resume summary and recent experience.".formatted(
                    String.join(", ", listing.getRequiredSkills().stream().limit(3).toList())));
        }
        if (profile != null && profile.getHeadline() != null && !profile.getHeadline().isBlank()) {
            suggestions.add("Use your '%s' headline to frame why this role is a direct fit.".formatted(profile.getHeadline()));
        }
        if (resume != null) {
            suggestions.add("Keep your strongest quantified bullets near the top of the tailored resume.");
        }
        if (application.getMatchScore() != null) {
            suggestions.add("Current deterministic match score: %s%%. Tighten gaps before final submission.".formatted(application.getMatchScore()));
        }
        return suggestions.stream().distinct().toList();
    }

    private String buildTailoredResume(
            final JobApplication application,
            final JobListing listing,
            final CandidateProfile profile,
            final ResumeDocument resume,
            final List<String> suggestions) {
        final String summary = firstNonBlank(
                profile != null ? profile.getSummary() : null,
                extractSectionText(resume),
                "Results-oriented candidate aligned to %s.".formatted(application.getJobTitle()));

        final String skills = listing != null && listing.getRequiredSkills() != null && !listing.getRequiredSkills().isEmpty()
                ? String.join(", ", listing.getRequiredSkills())
                : String.join(", ", Optional.ofNullable(profile).map(CandidateProfile::getSkills).orElse(List.of()));

        return """
                # %s

                ## Target Role
                %s at %s

                ## Professional Summary
                %s

                ## Priority Skills
                %s

                ## Experience Highlights
                %s

                ## Preparation Notes
                - %s
                """.formatted(
                firstNonBlank(profile != null ? profile.getHeadline() : null, application.getJobTitle()),
                application.getJobTitle(),
                application.getCompanyName(),
                summary,
                firstNonBlank(skills, "Adapt your top skills to this job before export."),
                extractExperienceHighlights(resume),
                String.join("\n- ", suggestions));
    }

    private String buildCoverLetter(
            final JobApplication application,
            final JobListing listing,
            final CandidateProfile profile,
            final List<String> suggestions) {
        final String intro = firstNonBlank(
                profile != null ? profile.getHeadline() : null,
                application.getJobTitle());
        final String company = application.getCompanyName();
        final String hook = listing != null ? listing.getDescription() : "the scope of this role";

        return """
                Dear %s hiring team,

                I’m applying for the %s role because it aligns closely with my background as %s and the kind of work I want to keep doing.

                What stands out to me about this opportunity is %s. I’m strongest when translating product goals into reliable execution, collaborating across functions, and keeping momentum high without losing quality.

                In preparing this application, I focused on:
                - %s

                I’d welcome the chance to discuss how I can contribute quickly and thoughtfully.

                Best,
                %s
                """.formatted(
                company,
                application.getJobTitle(),
                intro,
                hook,
                String.join("\n- ", suggestions),
                firstNonBlank(profile != null ? profile.getHeadline() : null, "ApplyFlow Candidate"));
    }

    private String extractSectionText(final ResumeDocument resume) {
        if (resume == null || resume.getSections() == null) {
            return "";
        }
        return resume.getSections().stream()
                .filter(section -> section.getType() == SectionType.SUMMARY)
                .findFirst()
                .map(ResumeSection::getRawJson)
                .map(raw -> {
                    try {
                        final JsonNode node = objectMapper.readTree(raw);
                        if (node.isTextual()) {
                            return node.asText();
                        }
                        return node.toPrettyString();
                    } catch (Exception ignored) {
                        return "";
                    }
                })
                .orElse("");
    }

    private String extractExperienceHighlights(final ResumeDocument resume) {
        if (resume == null || resume.getSections() == null) {
            return "Bring in two or three quantified bullets from your most recent role.";
        }

        return resume.getSections().stream()
                .filter(section -> section.getType() == SectionType.EXPERIENCE)
                .findFirst()
                .map(ResumeSection::getRawJson)
                .map(raw -> {
                    try {
                        final JsonNode node = objectMapper.readTree(raw);
                        if (!node.isArray() || node.isEmpty()) {
                            return "Bring in two or three quantified bullets from your most recent role.";
                        }
                        final List<String> lines = new ArrayList<>();
                        node.elements().forEachRemaining(item -> {
                            final String title = item.path("title").asText("");
                            final String company = item.path("company").asText("");
                            final String bullets = item.path("bullets").isArray()
                                    ? String.join("; ", item.path("bullets").findValuesAsText(""))
                                    : "";
                            lines.add("%s at %s: %s".formatted(title, company, bullets));
                        });
                        return String.join("\n", lines.stream().limit(3).toList());
                    } catch (Exception ignored) {
                        return "Bring in two or three quantified bullets from your most recent role.";
                    }
                })
                .orElse("Bring in two or three quantified bullets from your most recent role.");
    }

    private GeneratedDocumentResponse toGeneratedResponse(final GeneratedDocument document) {
        return new GeneratedDocumentResponse(
                document.getId(),
                document.getApplication() != null ? document.getApplication().getId() : null,
                document.getType(),
                document.getTitle(),
                document.getContent(),
                document.getMimeType(),
                document.getSizeBytes(),
                null,
                document.getCreatedDate(),
                document.getLastModifiedDate()
        );
    }

    private JobListing resolveListing(final String listingId) {
        if (listingId == null || listingId.isBlank()) {
            return null;
        }
        return jobListingRepository.findByIdAndActiveTrue(listingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.JOB_LISTING_NOT_FOUND, listingId));
    }

    private void applyStatusTransition(final JobApplication application, final ApplicationStatus newStatus) {
        final ApplicationStatus current = application.getStatus();
        application.setStatus(newStatus);

        if (newStatus == ApplicationStatus.APPLIED && current != ApplicationStatus.APPLIED && application.getAppliedAt() == null) {
            application.setAppliedAt(LocalDate.now());
        }

        if (newStatus == ApplicationStatus.WITHDRAWN || newStatus == ApplicationStatus.SAVED) {
            application.setAppliedAt(null);
        }
    }

    private ResumeDocument resolveResume(final String resumeId, final String userId) {
        if (resumeId == null) {
            return null;
        }
        if (resumeId.isBlank()) {
            return null;
        }
        return resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
    }

    private JobApplication findOwnedApplication(final String id, final String userId) {
        return applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPLICATION_NOT_FOUND, id));
    }

    private JobApplicationResponse toResponse(final JobApplication application) {
        final ResumeDocumentResponse resumeDto = Optional.ofNullable(application.getResume())
                .map(resumeMapper::toSummary)
                .orElse(null);

        return new JobApplicationResponse(
                application.getId(),
                application.getCompanyName(),
                application.getJobTitle(),
                application.getJobUrl(),
                application.getJobListing() != null ? application.getJobListing().getId() : null,
                application.getStatus(),
                application.getAppliedAt(),
                application.getMatchScore(),
                application.getNextStep(),
                application.getNextStepAt(),
                application.getNotes(),
                application.getCoverLetter(),
                application.isAiPrepared(),
                resumeDto,
                application.getCreatedDate(),
                application.getLastModifiedDate()
        );
    }

    private String firstNonBlank(final String... values) {
        for (final String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
