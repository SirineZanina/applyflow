package com.sirine.applyflow.job.response;

import java.time.LocalDate;
import java.util.List;

public record JobDetailResponse(
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
        String description,
        List<String> requiredSkills,
        String roleType,
        String sourceUrl,
        LocalDate postedAt,
        Integer matchScore,
        boolean saved,
        boolean applied,
        List<String> matchedSkills,
        String salaryInsight,
        String interviewTip
) {}
