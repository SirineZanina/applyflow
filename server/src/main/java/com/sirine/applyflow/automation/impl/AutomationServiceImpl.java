package com.sirine.applyflow.automation.impl;

import com.sirine.applyflow.application.repository.JobApplicationRepository;
import com.sirine.applyflow.application.service.JobApplicationService;
import com.sirine.applyflow.automation.AutomationService;
import com.sirine.applyflow.automation.request.AutomationLaunchRequest;
import com.sirine.applyflow.automation.request.AutomationPreviewRequest;
import com.sirine.applyflow.automation.response.AutomationLaunchResponse;
import com.sirine.applyflow.automation.response.AutomationPreviewResponse;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobListingRepository;
import com.sirine.applyflow.job.JobMatchResult;
import com.sirine.applyflow.job.JobMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AutomationServiceImpl implements AutomationService {

    private final JobListingRepository jobListingRepository;
    private final JobMatchService jobMatchService;
    private final JobApplicationService applicationService;
    private final JobApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public AutomationPreviewResponse preview(final String userId, final AutomationPreviewRequest request) {
        final int limit = request.limit() == null || request.limit() <= 0 ? 8 : request.limit();
        final List<AutomationPreviewResponse.EligibleJob> eligibleJobs = jobListingRepository.findByActiveTrueOrderByPostedAtDesc().stream()
                .filter(job -> request.remoteOnly() == null || !request.remoteOnly() || job.isRemoteEligible())
                .filter(job -> request.roleTypes() == null || request.roleTypes().isEmpty() || request.roleTypes().stream().anyMatch(type -> type.equalsIgnoreCase(job.getRoleType())))
                .filter(job -> matchesQuery(job, request.query()))
                .map(job -> toEligibleJob(job, jobMatchService.score(userId, job)))
                .filter(job -> request.minMatch() == null || job.matchScore() >= request.minMatch())
                .sorted((left, right) -> Integer.compare(right.matchScore(), left.matchScore()))
                .limit(limit)
                .toList();
        return new AutomationPreviewResponse(eligibleJobs);
    }

    @Override
    @Transactional
    public AutomationLaunchResponse launch(final String userId, final AutomationLaunchRequest request) {
        final List<AutomationLaunchResponse.PreparedApplication> prepared = request.jobIds().stream()
                .map(jobId -> {
                    final JobListing job = jobListingRepository.findByIdAndActiveTrue(jobId).orElseThrow();
                    final var preparedApp = applicationService.prepareForListing(jobId, userId);
                    applicationService.generateDocuments(preparedApp.applicationId(), userId, "FORMAL");
                    final var entity = applicationRepository.findByIdAndUserId(preparedApp.applicationId(), userId).orElseThrow();
                    entity.setAiPrepared(true);
                    entity.setNextStep("Review before submit");
                    if (entity.getNextStepAt() == null) {
                        entity.setNextStepAt(java.time.LocalDateTime.now().plusDays(2));
                    }
                    applicationRepository.save(entity);
                    return new AutomationLaunchResponse.PreparedApplication(
                            entity.getId(),
                            jobId,
                            job.getCompanyName(),
                            job.getTitle());
                })
                .toList();
        return new AutomationLaunchResponse(prepared.size(), prepared);
    }

    private AutomationPreviewResponse.EligibleJob toEligibleJob(final JobListing job, final JobMatchResult match) {
        return new AutomationPreviewResponse.EligibleJob(
                job.getId(),
                job.getCompanyName(),
                job.getTitle(),
                match.score(),
                confidenceLabel(match.score()),
                new AutomationPreviewResponse.ConfidenceBreakdown(
                        match.skillsWeight(),
                        match.desiredRoleWeight(),
                        match.locationWeight(),
                        match.experienceWeight(),
                        match.salaryWeight())
        );
    }

    private boolean matchesQuery(final JobListing job, final String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        final String needle = query.toLowerCase(Locale.ROOT);
        return job.getCompanyName().toLowerCase(Locale.ROOT).contains(needle)
                || job.getTitle().toLowerCase(Locale.ROOT).contains(needle)
                || job.getDescription().toLowerCase(Locale.ROOT).contains(needle);
    }

    private String confidenceLabel(final int score) {
        if (score >= 80) {
            return "High";
        }
        if (score >= 60) {
            return "Medium";
        }
        return "Low";
    }
}
