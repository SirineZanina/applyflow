package com.sirine.applyflow.dashboard.impl;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.repository.JobApplicationRepository;
import com.sirine.applyflow.dashboard.DashboardService;
import com.sirine.applyflow.dashboard.response.DashboardSummaryResponse;
import com.sirine.applyflow.document.GeneratedDocumentRepository;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobListingRepository;
import com.sirine.applyflow.job.JobMatchService;
import com.sirine.applyflow.profile.CandidateProfileRepository;
import com.sirine.applyflow.resume.ResumeDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final JobApplicationRepository applicationRepository;
    private final ResumeDocumentRepository resumeRepository;
    private final GeneratedDocumentRepository documentRepository;
    private final CandidateProfileRepository profileRepository;
    private final JobListingRepository jobListingRepository;
    private final JobMatchService jobMatchService;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(final String userId) {
        final long totalApplications = applicationRepository.countByUserId(userId);
        final long appliedCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);
        final long interviewingCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEWING);
        final long offerCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER);
        final long resumeCount = resumeRepository.findByUser_IdOrderByCreatedDateDesc(userId).size();
        final long documentCount = documentRepository.findByUserIdOrderByCreatedDateDesc(userId).size();

        final var topMatches = jobListingRepository.findByActiveTrueOrderByPostedAtDesc().stream()
                .limit(5)
                .map(job -> new ScoredJob(job, jobMatchService.score(userId, job).score()))
                .sorted((left, right) -> Integer.compare(right.score(), left.score()))
                .limit(3)
                .map(scored -> new DashboardSummaryResponse.TopMatch(
                        scored.job().getId(),
                        scored.job().getCompanyName(),
                        scored.job().getTitle(),
                        scored.score(),
                        scored.job().getLocation(),
                        applicationRepository.findByUserIdAndJobListingId(userId, scored.job().getId()).isPresent()))
                .toList();

        final var upcoming = applicationRepository.findTop5ByUserIdAndNextStepAtAfterOrderByNextStepAtAsc(userId, LocalDateTime.now())
                .stream()
                .map(application -> new DashboardSummaryResponse.UpcomingItem(
                        application.getId(),
                        application.getCompanyName(),
                        application.getJobTitle(),
                        application.getStatus(),
                        application.getNextStep(),
                        application.getNextStepAt()))
                .toList();

        final boolean profileReady = profileRepository.existsByUser_Id(userId);
        final boolean hasPrimaryResume = resumeRepository.findByUser_IdAndPrimaryTrue(userId).isPresent();
        final boolean hasGeneratedDocuments = documentCount > 0;
        final String nextRoute = !profileReady
                ? "/profile"
                : !hasPrimaryResume
                ? "/documents"
                : totalApplications == 0
                ? "/jobs"
                : "/tracker";

        return new DashboardSummaryResponse(
                new DashboardSummaryResponse.SummaryStats(
                        totalApplications,
                        appliedCount,
                        interviewingCount,
                        offerCount,
                        resumeCount,
                        documentCount),
                topMatches,
                upcoming,
                new DashboardSummaryResponse.QuickActions(
                        profileReady,
                        hasPrimaryResume,
                        hasGeneratedDocuments,
                        nextRoute)
        );
    }

    private record ScoredJob(JobListing job, int score) {}
}
