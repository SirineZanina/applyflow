package com.sirine.applyflow.resume.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
public class ResumeDocumentResponse {

    private String id;
    private String userId;
    private String label;
    private String mimeType;
    private Long sizeBytes;
    private boolean primary;
    private LocalDateTime parsedAt;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    private List<ResumeSectionResponse> sections;
}
