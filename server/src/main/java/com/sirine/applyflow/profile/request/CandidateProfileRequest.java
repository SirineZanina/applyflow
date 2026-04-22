package com.sirine.applyflow.profile.request;

import com.sirine.applyflow.profile.RemotePreference;
import com.sirine.applyflow.validation.ValidSalaryRange;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

@ValidSalaryRange
public record CandidateProfileRequest(

        @Size(max = 255, message = "VALIDATION.PROFILE.HEADLINE.SIZE")
        String headline,

        String summary,

        @Min(value = 0, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MIN")
        @Max(value = 50, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MAX")
        Integer yearsExperience,

        List<String> desiredRoles,

        List<String> desiredLocations,

        RemotePreference remotePreference,

        @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MIN.MIN")
        Integer salaryMin,

        @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MAX.MIN")
        Integer salaryMax,

        @Size(min = 3, max = 3, message = "VALIDATION.PROFILE.CURRENCY.SIZE")
        String currency

) {}
