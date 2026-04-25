package com.sirine.applyflow.document.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.Size;

public record UpdateGeneratedDocumentRequest(
        @Size(max = ValidationConstants.DOCUMENT_TITLE_MAX, message = "VALIDATION.DOCUMENT.TITLE.SIZE")
        String title,

        @Size(max = ValidationConstants.DOCUMENT_CONTENT_MAX, message = "VALIDATION.DOCUMENT.CONTENT.SIZE")
        String content
) {}
