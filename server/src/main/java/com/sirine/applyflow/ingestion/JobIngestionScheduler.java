package com.sirine.applyflow.ingestion;

import com.sirine.applyflow.profile.CandidateProfile;
import com.sirine.applyflow.profile.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobIngestionScheduler {

    private final CandidateProfileRepository profileRepository;
    private final JobIngestionService ingestionService;
    private final AdzunaProperties props;

    /**
     * Runs once on startup (initialDelay=0) and every 30 min thereafter.
     * Uses JOIN FETCH so collections are already in memory — no lazy-load, no open session needed.
     * Each ingestForProfile call opens its own @Transactional write transaction.
     */
    @Scheduled(initialDelay = 0, fixedDelay = Long.MAX_VALUE, timeUnit = TimeUnit.MILLISECONDS)
    @Scheduled(cron = "0 */30 * * * *")
    public void run() {
        if (!props.isEnabled()) return;

        log.info("Job ingestion run started");
        final List<CandidateProfile> profiles = profileRepository.findAllWithCollections();

        for (final CandidateProfile profile : profiles) {
            final List<String> roles = List.copyOf(profile.getDesiredRoles());
            final List<String> locations = List.copyOf(profile.getDesiredLocations());
            if (roles.isEmpty()) continue;

            final List<String> effectiveLocations = locations.isEmpty() ? List.of("remote") : locations;
            ingestionService.ingestForProfile(roles, effectiveLocations);
        }

        log.info("Job ingestion run complete");
    }
}
