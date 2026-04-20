package com.sirine.applyflow.resume.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResumeUploadRequest {

    @NotNull(message = "VALIDATION.RESUME.FILE.REQUIRED")
    private MultipartFile file;

    @Size(max = 120, message = "VALIDATION.RESUME.LABEL.SIZE")
    @Pattern(regexp = "^[\\p{L}\\p{N} ._\\-]{0,120}$",
            message = "VALIDATION.RESUME.LABEL.FORMAT")
    private String label;
}
