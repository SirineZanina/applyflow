package com.sirine.applyflow.profile.response;

import com.sirine.applyflow.profile.RemotePreference;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateProfileResponse {

    private String id;
    private String userId;
    private String headline;
    private String summary;
    private Integer yearsExperience;
    private List<String> desiredRoles;
    private List<String> desiredLocations;
    private RemotePreference remotePreference;
    private Integer salaryMin;
    private Integer salaryMax;
    private String currency;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
