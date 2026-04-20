package com.sirine.applyflow.resume;

import java.util.List;

public record ResumeExtraction(
        String summary,
        List<ExperienceEntry> experience,
        List<EducationEntry> education,
        List<String> skills,
        List<ProjectEntry> projects,
        List<CertificationEntry> certifications
) {

    public record ExperienceEntry(
            String title,
            String company,
            String startDate,
            String endDate,
            List<String> bullets
    ) {}

    public record EducationEntry(
            String institution,
            String degree,
            String field,
            String startDate,
            String endDate
    ) {}

    public record ProjectEntry(
            String name,
            String description
    ) {}

    public record CertificationEntry(
            String name,
            String issuer,
            String date
    ) {}
}
