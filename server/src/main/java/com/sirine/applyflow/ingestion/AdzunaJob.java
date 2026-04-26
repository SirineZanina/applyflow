package com.sirine.applyflow.ingestion;

public record AdzunaJob(
        String id,
        String title,
        String company,
        String location,
        String description,
        Integer salaryMin,
        Integer salaryMax,
        String contractType,
        String redirectUrl,
        String created
) {}
