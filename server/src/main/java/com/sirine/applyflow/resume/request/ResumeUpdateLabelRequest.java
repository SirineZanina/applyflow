package com.sirine.applyflow.resume.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResumeUpdateLabelRequest(
        @Size(max = ValidationConstants.LABEL_MAX, message = "VALIDATION.RESUME.LABEL.SIZE")
        @Pattern(regexp = ValidationConstants.LABEL_PATTERN, message = "VALIDATION.RESUME.LABEL.FORMAT")
        String label
) {}
