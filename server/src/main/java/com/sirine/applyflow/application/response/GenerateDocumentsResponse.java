package com.sirine.applyflow.application.response;

import com.sirine.applyflow.document.response.GeneratedDocumentResponse;

import java.time.LocalDateTime;
import java.util.List;

public record GenerateDocumentsResponse(
        List<String> suggestions,
        GeneratedDocumentResponse tailoredResume,
        GeneratedDocumentResponse coverLetter,
        LocalDateTime generatedAt
) {}
