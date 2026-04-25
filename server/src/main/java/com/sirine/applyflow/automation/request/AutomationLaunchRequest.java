package com.sirine.applyflow.automation.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AutomationLaunchRequest(
        @NotEmpty(message = "VALIDATION.AUTOMATION.JOB_IDS.NOT_EMPTY")
        @Size(max = ValidationConstants.AUTOMATION_JOB_IDS_MAX, message = "VALIDATION.AUTOMATION.JOB_IDS.SIZE")
        List<@jakarta.validation.constraints.NotBlank(message = "VALIDATION.AUTOMATION.JOB_ID.NOT_BLANK") String> jobIds
) {}
