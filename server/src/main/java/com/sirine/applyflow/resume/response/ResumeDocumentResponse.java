package com.sirine.applyflow.resume.response;

import com.sirine.applyflow.resume.ResumeParseStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeDocumentResponse(
        String id,
        String userId,
        String label,
        String mimeType,
        Long sizeBytes,
        boolean primary,
        ResumeParseStatus parseStatus,
        String parseError,
        LocalDateTime parsedAt,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate,
        List<ResumeSectionResponse> sections
) {}
