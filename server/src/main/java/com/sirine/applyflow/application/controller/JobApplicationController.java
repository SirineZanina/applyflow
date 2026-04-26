package com.sirine.applyflow.application.controller;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.request.CreateJobApplicationRequest;
import com.sirine.applyflow.application.request.GenerateDocumentsRequest;
import com.sirine.applyflow.application.request.UpdateJobApplicationRequest;
import com.sirine.applyflow.application.response.GenerateDocumentsResponse;
import com.sirine.applyflow.application.response.JobApplicationResponse;
import com.sirine.applyflow.application.service.JobApplicationService;
import com.sirine.applyflow.common.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('USER')")
@Tag(name = "JobApplication", description = "Job application tracking API")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @GetMapping
    public ResponseEntity<Page<JobApplicationResponse>> list(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20) final Pageable pageable,
            final Authentication principal) {
        final String userId = SecurityUtils.extractUserId(principal);
        return ResponseEntity.ok(applicationService.list(userId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> get(
            @PathVariable final String id,
            final Authentication principal) {
        return ResponseEntity.ok(applicationService.get(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(
            @Valid @RequestBody final CreateJobApplicationRequest request,
            final Authentication principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.create(SecurityUtils.extractUserId(principal), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> update(
            @PathVariable final String id,
            @Valid @RequestBody final UpdateJobApplicationRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(applicationService.update(id, SecurityUtils.extractUserId(principal), request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponse> patchStatus(
            @PathVariable final String id,
            @RequestParam final ApplicationStatus status,
            final Authentication principal) {
        return ResponseEntity.ok(applicationService.patchStatus(id, SecurityUtils.extractUserId(principal), status));
    }

    @PostMapping("/{id}/generate-documents")
    public ResponseEntity<GenerateDocumentsResponse> generateDocuments(
            @PathVariable final String id,
            @Valid @RequestBody(required = false) final GenerateDocumentsRequest request,
            final Authentication principal) {
        final String tone = request != null ? request.tone() : "FORMAL";
        return ResponseEntity.ok(applicationService.generateDocuments(id, SecurityUtils.extractUserId(principal), tone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable final String id,
            final Authentication principal) {
        applicationService.delete(id, SecurityUtils.extractUserId(principal));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(
            @RequestParam(required = false) ApplicationStatus status,
            final Authentication principal) {
        final String userId = SecurityUtils.extractUserId(principal);
        final long total = (status != null)
                ? applicationService.countByUserIdAndStatus(userId, status)
                : applicationService.countByUserId(userId);
        return ResponseEntity.ok(total);
    }
}
