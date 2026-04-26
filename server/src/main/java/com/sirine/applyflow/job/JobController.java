package com.sirine.applyflow.job;

import com.sirine.applyflow.application.response.JobApplicationResponse;
import com.sirine.applyflow.application.response.PrepareJobApplicationResponse;
import com.sirine.applyflow.application.service.JobApplicationService;
import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.job.response.JobCardResponse;
import com.sirine.applyflow.job.response.JobDetailResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "Jobs", description = "Internal job catalog and matching API")
public class JobController {

    private final JobService jobService;
    private final JobApplicationService applicationService;

    @GetMapping
    public ResponseEntity<Page<JobCardResponse>> list(
            @RequestParam(required = false) final String query,
            @RequestParam(required = false) final Boolean remoteOnly,
            @RequestParam(required = false) final Integer minMatch,
            @RequestParam(required = false) final List<String> roleTypes,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "12") final int size,
            final Authentication principal) {
        return ResponseEntity.ok(jobService.list(
                SecurityUtils.extractUserId(principal),
                query,
                remoteOnly,
                minMatch,
                roleTypes,
                page,
                size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetailResponse> get(@PathVariable final String id, final Authentication principal) {
        return ResponseEntity.ok(jobService.get(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<JobApplicationResponse> save(@PathVariable final String id, final Authentication principal) {
        return ResponseEntity.ok(applicationService.saveForListing(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping("/{id}/prepare")
    public ResponseEntity<PrepareJobApplicationResponse> prepare(@PathVariable final String id, final Authentication principal) {
        return ResponseEntity.ok(applicationService.prepareForListing(id, SecurityUtils.extractUserId(principal)));
    }
}
