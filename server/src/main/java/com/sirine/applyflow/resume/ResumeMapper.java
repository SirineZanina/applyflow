package com.sirine.applyflow.resume;

import com.sirine.applyflow.resume.response.ResumeDocumentResponse;
import com.sirine.applyflow.resume.response.ResumeSectionResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        uses = ResumeJsonMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResumeMapper {

    @Mapping(source = "user.id", target = "userId")
    ResumeDocumentResponse toResponse(ResumeDocument document);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(target = "sections", ignore = true)
    ResumeDocumentResponse toSummary(ResumeDocument document);

    @Mapping(source = "rawJson", target = "rawJson", qualifiedByName = "toJsonNode")
    ResumeSectionResponse toSectionResponse(ResumeSection section);
}
