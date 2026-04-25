package com.sirine.applyflow.application.request;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateJobApplicationRequest(
        @Size(max = ValidationConstants.COMPANY_NAME_MAX, message = "VALIDATION.APPLICATION.COMPANY_NAME.SIZE")
        String companyName,

        @Size(max = ValidationConstants.JOB_TITLE_MAX, message = "VALIDATION.APPLICATION.JOB_TITLE.SIZE")
        String jobTitle,

        @Size(max = ValidationConstants.JOB_URL_MAX, message = "VALIDATION.APPLICATION.JOB_URL.SIZE")
        String jobUrl,

        String resumeId,

        ApplicationStatus status,

        @Size(max = ValidationConstants.NEXT_STEP_MAX, message = "VALIDATION.APPLICATION.NEXT_STEP.SIZE")
        String nextStep,

        LocalDateTime nextStepAt,

        @Size(max = ValidationConstants.NOTES_MAX, message = "VALIDATION.APPLICATION.NOTES.SIZE")
        String notes,

        @Size(max = ValidationConstants.COVER_LETTER_MAX, message = "VALIDATION.APPLICATION.COVER_LETTER.SIZE")
        String coverLetter,

        Boolean aiPrepared
) {}
