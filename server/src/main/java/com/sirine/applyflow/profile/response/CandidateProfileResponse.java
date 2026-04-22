package com.sirine.applyflow.profile.response;

import com.sirine.applyflow.profile.RemotePreference;

import java.time.LocalDateTime;
import java.util.List;

public record CandidateProfileResponse(
        String id,
        String userId,
        String headline,
        String summary,
        Integer yearsExperience,
        List<String> desiredRoles,
        List<String> desiredLocations,
        RemotePreference remotePreference,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate
) {}
