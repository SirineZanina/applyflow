package com.sirine.applyflow.document.response;

import com.sirine.applyflow.document.DocumentType;

import java.time.LocalDateTime;

public record GeneratedDocumentResponse(
        String id,
        String applicationId,
        DocumentType type,
        String title,
        String content,
        String mimeType,
        Long sizeBytes,
        String viewUrl,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate
) {}
