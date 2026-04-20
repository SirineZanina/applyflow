package com.sirine.applyflow.profile.request;


import com.sirine.applyflow.profile.RemotePreference;
import com.sirine.applyflow.validation.ValidSalaryRange;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@ValidSalaryRange
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateProfileRequest {

    @Size(max = 255, message = "VALIDATION.PROFILE.HEADLINE.SIZE")
    private String headline;

    private String summary;

    @Min(value = 0, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MIN")
    @Max(value = 50, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MAX")
    private Integer yearsExperience;

    private List<String> desiredRoles;

    private List<String> desiredLocations;

    private RemotePreference remotePreference;

    @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MIN.MIN")
    private Integer salaryMin;

    @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MAX.MIN")
    private Integer salaryMax;

    @Size(min = 3, max = 3, message = "VALIDATION.PROFILE.CURRENCY.SIZE")
    private String currency;

}
