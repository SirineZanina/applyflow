package com.sirine.applyflow.dashboard.response;

import com.sirine.applyflow.application.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardSummaryResponse(
        SummaryStats stats,
        List<TopMatch> topMatches,
        List<UpcomingItem> upcomingItems,
        QuickActions quickActions
) {

    public record SummaryStats(
            long totalApplications,
            long appliedCount,
            long interviewingCount,
            long offerCount,
            long resumeCount,
            long documentCount
    ) {}

    public record TopMatch(
            String jobId,
            String companyName,
            String title,
            Integer matchScore,
            String location,
            boolean saved
    ) {}

    public record UpcomingItem(
            String applicationId,
            String companyName,
            String jobTitle,
            ApplicationStatus status,
            String nextStep,
            LocalDateTime nextStepAt
    ) {}

    public record QuickActions(
            boolean profileReady,
            boolean hasPrimaryResume,
            boolean hasGeneratedDocuments,
            String nextRecommendedRoute
    ) {}
}
