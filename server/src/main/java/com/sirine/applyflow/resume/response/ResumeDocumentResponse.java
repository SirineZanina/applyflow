package com.sirine.applyflow.resume.response;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeDocumentResponse(
        String id,
        String userId,
        String label,
        String mimeType,
        Long sizeBytes,
        boolean primary,
        LocalDateTime parsedAt,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate,
        List<ResumeSectionResponse> sections
) {}
