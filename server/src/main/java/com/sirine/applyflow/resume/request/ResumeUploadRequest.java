package com.sirine.applyflow.resume.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public record ResumeUploadRequest(

        @NotNull(message = "VALIDATION.RESUME.FILE.REQUIRED")
        MultipartFile file,

        @Size(max = 120, message = "VALIDATION.RESUME.LABEL.SIZE")
        @Pattern(regexp = "^[\\p{L}\\p{N} ._\\-]{0,120}$", message = "VALIDATION.RESUME.LABEL.FORMAT")
        String label

) {}
