package com.sirine.applyflow.profile;

import com.sirine.applyflow.profile.request.CandidateProfileRequest;
import com.sirine.applyflow.profile.response.CandidateProfileResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CandidateProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    CandidateProfileResponse toResponse(CandidateProfile profile);

    @Mapping(target = "user", ignore = true)
    CandidateProfile toEntity(CandidateProfileRequest request);

    @Mapping(target = "user", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(CandidateProfileRequest request, @MappingTarget CandidateProfile profile);
}
