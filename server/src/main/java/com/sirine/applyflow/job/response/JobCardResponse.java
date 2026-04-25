package com.sirine.applyflow.job.response;

import java.time.LocalDate;
import java.util.List;

public record JobCardResponse(
        String id,
        String companyName,
        String companyLogoText,
        String companyColor,
        String title,
        String location,
        boolean remoteEligible,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        String roleType,
        LocalDate postedAt,
        Integer matchScore,
        boolean saved,
        boolean applied,
        List<String> matchedSkills
) {}
