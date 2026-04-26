package com.sirine.applyflow.application.request;

import jakarta.validation.constraints.Pattern;

public record GenerateDocumentsRequest(
        @Pattern(regexp = "FORMAL|CASUAL|CONCISE", message = "tone must be FORMAL, CASUAL, or CONCISE")
        String tone
) {
    public GenerateDocumentsRequest {
        if (tone == null) tone = "FORMAL";
    }
}
