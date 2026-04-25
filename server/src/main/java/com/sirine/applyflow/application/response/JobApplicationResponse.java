package com.sirine.applyflow.application.response;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.resume.response.ResumeDocumentResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplicationResponse(
        String id,
        String companyName,
        String jobTitle,
        String jobUrl,
        String jobListingId,
        ApplicationStatus status,
        LocalDate appliedAt,
        Integer matchScore,
        String nextStep,
        LocalDateTime nextStepAt,
        String notes,
        String coverLetter,
        boolean aiPrepared,
        ResumeDocumentResponse resume,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate
) {}
