package com.sirine.applyflow.automation.response;

import java.util.List;

public record AutomationLaunchResponse(
        int preparedCount,
        List<PreparedApplication> applications
) {
    public record PreparedApplication(
            String applicationId,
            String jobId,
            String companyName,
            String title
    ) {}
}
