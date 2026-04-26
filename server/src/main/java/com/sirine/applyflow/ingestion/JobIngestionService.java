package com.sirine.applyflow.ingestion;

import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.job.JobListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobIngestionService {

    private static final String SOURCE = "adzuna";

    private final JobListingRepository jobListingRepository;
    private final AdzunaClient adzunaClient;
    private final AdzunaProperties props;

    @Transactional
    public void ingestForProfile(final List<String> desiredRoles, final List<String> desiredLocations) {
        if (!props.isEnabled()) {
            log.debug("Adzuna ingestion disabled — skipping");
            return;
        }

        int upserted = 0;
        for (final String role : desiredRoles) {
            for (final String location : desiredLocations) {
                final List<AdzunaJob> jobs = adzunaClient.search(role, location);
                for (final AdzunaJob job : jobs) {
                    if (upsert(job)) upserted++;
                }
            }
        }
        log.info("Adzuna ingestion: {} listings upserted for roles={} locations={}", upserted, desiredRoles, desiredLocations);
    }

    private boolean upsert(final AdzunaJob job) {
        try {
            final String roleType = inferRoleType(job.title());
            final var existing = jobListingRepository.findByExternalSourceAndExternalId(SOURCE, job.id());

            if (existing.isPresent()) {
                // Patch role type on existing records so stale data gets corrected.
                final JobListing listing = existing.get();
                if (!roleType.equals(listing.getRoleType())) {
                    listing.setRoleType(roleType);
                    jobListingRepository.save(listing);
                }
                return false;
            }

            final JobListing listing = JobListing.builder()
                    .companyName(job.company())
                    .title(job.title())
                    .location(job.location())
                    .description(truncate(job.description(), 5000))
                    .roleType(roleType)
                    .remoteEligible(isRemote(job.location()))
                    .salaryMin(job.salaryMin())
                    .salaryMax(job.salaryMax())
                    .currency("GBP")
                    .postedAt(parseDate(job.created()))
                    .active(true)
                    .sourceUrl(job.redirectUrl())
                    .externalSource(SOURCE)
                    .externalId(job.id())
                    .externalUrl(job.redirectUrl())
                    .build();

            jobListingRepository.save(listing);
            return true;
        } catch (Exception e) {
            log.warn("Failed to upsert Adzuna job id={}: {}", job.id(), e.getMessage());
            return false;
        }
    }

    /** Maps a job title to the role type labels used by the client UI. Order matters — most specific first. */
    private String inferRoleType(final String title) {
        if (title == null) return "Other";
        final String t = title.toLowerCase();
        if (t.contains("staff") || t.contains("lead") || t.contains("principal") || t.contains("architect")) return "Staff / Lead Engineer";
        if (t.contains("devops") || t.contains("sre") || t.contains("platform") || t.contains("infra") || t.contains("cloud engineer")) return "DevOps / Platform";
        if (t.contains("data engineer") || t.contains("data scientist") || t.contains("ml engineer") || t.contains("machine learning") || t.contains("analyst")) return "Data Engineer";
        if (t.contains("product manager") || t.contains("program manager")) return "Product Manager";
        if (t.contains("designer") || t.contains("ux ") || t.contains("ui designer")) return "Product Designer";
        if (t.contains("frontend") || t.contains("front-end") || t.contains("front end") || t.contains("react developer") || t.contains("vue") || t.contains("angular")) return "Frontend Engineer";
        if (t.contains("full stack") || t.contains("fullstack") || t.contains("full-stack")) return "Full Stack Engineer";
        if (t.contains("backend") || t.contains("back-end") || t.contains("back end")) return "Backend Engineer";
        if (t.contains("software") || t.contains("engineer") || t.contains("developer")) return "Backend Engineer";
        return "Other";
    }

    private boolean isRemote(final String location) {
        if (location == null) return false;
        final String lower = location.toLowerCase();
        return lower.contains("remote") || lower.contains("anywhere");
    }

    private LocalDate parseDate(final String created) {
        if (created == null || created.isBlank()) return LocalDate.now();
        try {
            return LocalDate.parse(created.substring(0, 10), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            return LocalDate.now();
        }
    }

    private String truncate(final String text, final int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max);
    }
}
