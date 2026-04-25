package com.sirine.applyflow.application.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateJobApplicationRequest(
        @NotBlank(message = "VALIDATION.APPLICATION.COMPANY_NAME.REQUIRED")
        @Size(max = ValidationConstants.COMPANY_NAME_MAX, message = "VALIDATION.APPLICATION.COMPANY_NAME.SIZE")
        String companyName,

        @NotBlank(message = "VALIDATION.APPLICATION.JOB_TITLE.REQUIRED")
        @Size(max = ValidationConstants.JOB_TITLE_MAX, message = "VALIDATION.APPLICATION.JOB_TITLE.SIZE")
        String jobTitle,

        @Size(max = ValidationConstants.JOB_URL_MAX, message = "VALIDATION.APPLICATION.JOB_URL.SIZE")
        String jobUrl,

        String jobListingId,

        String resumeId,

        @Size(max = ValidationConstants.NOTES_MAX, message = "VALIDATION.APPLICATION.NOTES.SIZE")
        String notes
) {}
