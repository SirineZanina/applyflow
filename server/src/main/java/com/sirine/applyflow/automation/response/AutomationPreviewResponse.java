package com.sirine.applyflow.automation.response;

import java.util.List;

public record AutomationPreviewResponse(
        List<EligibleJob> eligibleJobs
) {
    public record EligibleJob(
            String jobId,
            String companyName,
            String title,
            Integer matchScore,
            String confidenceLabel,
            ConfidenceBreakdown breakdown
    ) {}

    public record ConfidenceBreakdown(
            double skills,
            double desiredRoles,
            double location,
            double experience,
            double salary
    ) {}
}
