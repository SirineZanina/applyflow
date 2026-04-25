package com.sirine.applyflow.resume.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public record ResumeReplaceFileRequest(
        @NotNull(message = "VALIDATION.RESUME.FILE.REQUIRED")
        MultipartFile file,

        @Size(max = ValidationConstants.LABEL_MAX, message = "VALIDATION.RESUME.LABEL.SIZE")
        @Pattern(regexp = ValidationConstants.LABEL_PATTERN, message = "VALIDATION.RESUME.LABEL.FORMAT")
        String label
) {}
