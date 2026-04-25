package com.sirine.applyflow.profile.request;

import com.sirine.applyflow.profile.RemotePreference;
import com.sirine.applyflow.validation.ValidSalaryRange;
import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

@ValidSalaryRange
public record CandidateProfileRequest(

        @Size(max = ValidationConstants.HEADLINE_MAX, message = "VALIDATION.PROFILE.HEADLINE.SIZE")
        String headline,

        String summary,

        @Min(value = ValidationConstants.YEARS_EXPERIENCE_MIN, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MIN")
        @Max(value = ValidationConstants.YEARS_EXPERIENCE_MAX, message = "VALIDATION.PROFILE.YEARS_EXPERIENCE.MAX")
        Integer yearsExperience,

        List<String> desiredRoles,

        List<String> desiredLocations,

        List<String> skills,

        List<String> companySizes,

        RemotePreference remotePreference,

        @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MIN.MIN")
        Integer salaryMin,

        @Min(value = 0, message = "VALIDATION.PROFILE.SALARY_MAX.MIN")
        Integer salaryMax,

        @Size(min = ValidationConstants.CURRENCY_LEN, max = ValidationConstants.CURRENCY_LEN, message = "VALIDATION.PROFILE.CURRENCY.SIZE")
        String currency

) {}
