package com.sirine.applyflow.resume.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.sirine.applyflow.resume.SectionType;

public record ResumeSectionResponse(
        String id,
        SectionType type,
        JsonNode rawJson,
        Integer orderIndex
) {}
