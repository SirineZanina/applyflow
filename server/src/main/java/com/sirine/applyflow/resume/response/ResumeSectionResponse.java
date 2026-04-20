package com.sirine.applyflow.resume.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.sirine.applyflow.resume.SectionType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResumeSectionResponse {

    private String id;
    private SectionType type;
    private JsonNode rawJson;
    private Integer orderIndex;
}
