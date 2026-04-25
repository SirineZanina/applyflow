package com.sirine.applyflow.job;

import java.util.List;

public record JobMatchResult(
        int score,
        List<String> matchedSkills,
        double skillsWeight,
        double desiredRoleWeight,
        double locationWeight,
        double experienceWeight,
        double salaryWeight
) {}
