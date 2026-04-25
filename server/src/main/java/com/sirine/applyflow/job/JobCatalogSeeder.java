package com.sirine.applyflow.job;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JobCatalogSeeder implements ApplicationRunner {

    private final JobListingRepository jobListingRepository;

    @Override
    @Transactional
    public void run(final ApplicationArguments args) {
        if (jobListingRepository.count() > 0) {
            return;
        }

        final List<JobListing> listings = List.of(
                job("Northstar Labs", "NL", "#0D9488", "Senior Frontend Engineer", "Berlin, DE", true, 85000, 105000, "EUR", "Build and ship a design-system-driven customer onboarding surface across React and TypeScript.", List.of("react", "typescript", "design systems", "testing"), "Frontend Engineer", "https://applyflow.dev/jobs/northstar-frontend", 2),
                job("Atlas Cloud", "AC", "#2563EB", "Platform Engineer", "Remote, EU", true, 90000, 120000, "EUR", "Own CI pipelines, developer experience, and infrastructure hardening for a growing SaaS platform.", List.of("kubernetes", "terraform", "aws", "ci/cd"), "DevOps / Platform", "https://applyflow.dev/jobs/atlas-platform", 1),
                job("Signal Desk", "SD", "#F97316", "Product Designer", "Paris, FR", true, 70000, 95000, "EUR", "Design dense workflow tooling for recruiters and operators with strong information architecture.", List.of("figma", "design systems", "ux research"), "Product Designer", "https://applyflow.dev/jobs/signal-designer", 4),
                job("Helio Systems", "HS", "#7C3AED", "Backend Engineer", "Tunis, TN", false, 50000, 70000, "EUR", "Ship Java services, durable APIs, and operational tooling for logistics workflows.", List.of("java", "spring", "postgresql", "api design"), "Backend Engineer", "https://applyflow.dev/jobs/helio-backend", 5),
                job("Canvas Metrics", "CM", "#DC2626", "Full Stack Engineer", "Remote, US", true, 120000, 150000, "USD", "Work across React, Node, and analytics-heavy product surfaces with experimentation loops.", List.of("react", "node", "sql", "analytics"), "Full Stack Engineer", "https://applyflow.dev/jobs/canvas-fullstack", 3),
                job("Fjord AI", "FA", "#14B8A6", "Staff / Lead Engineer", "Amsterdam, NL", true, 115000, 145000, "EUR", "Guide architecture and mentor product squads building AI-assisted productivity features.", List.of("architecture", "mentoring", "java", "typescript"), "Staff / Lead Engineer", "https://applyflow.dev/jobs/fjord-staff", 6),
                job("Relay Commerce", "RC", "#EA580C", "Data Engineer", "Madrid, ES", true, 80000, 110000, "EUR", "Model high-volume commerce events and improve freshness of downstream analytics products.", List.of("python", "sql", "dbt", "airflow"), "Data Engineer", "https://applyflow.dev/jobs/relay-data", 2),
                job("Bloomstack", "BS", "#0F766E", "Product Manager", "Remote, UK", true, 85000, 115000, "GBP", "Drive roadmap and execution for a candidate workflow product used by lean recruiting teams.", List.of("roadmapping", "experimentation", "stakeholder management"), "Product Manager", "https://applyflow.dev/jobs/bloomstack-pm", 7)
        );

        jobListingRepository.saveAll(listings);
    }

    private JobListing job(
            final String companyName,
            final String companyLogoText,
            final String companyColor,
            final String title,
            final String location,
            final boolean remoteEligible,
            final Integer salaryMin,
            final Integer salaryMax,
            final String currency,
            final String description,
            final List<String> requiredSkills,
            final String roleType,
            final String sourceUrl,
            final int daysAgo) {
        return JobListing.builder()
                .companyName(companyName)
                .companyLogoText(companyLogoText)
                .companyColor(companyColor)
                .title(title)
                .location(location)
                .remoteEligible(remoteEligible)
                .salaryMin(salaryMin)
                .salaryMax(salaryMax)
                .currency(currency)
                .description(description)
                .requiredSkills(requiredSkills)
                .roleType(roleType)
                .sourceUrl(sourceUrl)
                .postedAt(LocalDate.now().minusDays(daysAgo))
                .active(true)
                .build();
    }
}
