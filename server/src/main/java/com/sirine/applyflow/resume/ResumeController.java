package com.sirine.applyflow.resume;

import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.resume.request.ResumeReplaceFileRequest;
import com.sirine.applyflow.resume.request.ResumeUpdateLabelRequest;
import com.sirine.applyflow.resume.request.ResumeUploadRequest;
import com.sirine.applyflow.resume.response.ResumeDocumentResponse;
import com.sirine.applyflow.resume.response.ResumeViewUrlResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('USER')")
@Tag(name = "Resume", description = "Resume document API")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResumeDocumentResponse> upload(
            @Valid @ModelAttribute final ResumeUploadRequest request,
            final Authentication principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.upload(request, SecurityUtils.extractUserId(principal)));
    }

    @GetMapping
    public ResponseEntity<List<ResumeDocumentResponse>> list(final Authentication principal) {
        return ResponseEntity.ok(resumeService.list(SecurityUtils.extractUserId(principal)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDocumentResponse> get(
            @PathVariable final String id,
            final Authentication principal) {
        return ResponseEntity.ok(resumeService.get(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping("/{id}/primary")
    public ResponseEntity<ResumeDocumentResponse> setPrimary(
            @PathVariable final String id,
            final Authentication principal) {
        return ResponseEntity.ok(resumeService.setPrimary(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping("/{id}/reparse")
    public ResponseEntity<ResumeDocumentResponse> reparse(
            @PathVariable final String id,
            final Authentication principal) {
        return ResponseEntity.ok(resumeService.reparse(id, SecurityUtils.extractUserId(principal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable final String id,
            final Authentication principal) {
        resumeService.delete(id, SecurityUtils.extractUserId(principal));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/view-url")
    public ResponseEntity<ResumeViewUrlResponse> getViewUrl(
            @PathVariable final String id,
            final Authentication principal){
        final String url = resumeService.getViewUrl(id,
                SecurityUtils.extractUserId(principal));
        return ResponseEntity.ok(new ResumeViewUrlResponse(url));
    }

    @PatchMapping("/{id}/label")
    public ResponseEntity<ResumeDocumentResponse> updateLabel(
            @PathVariable final String id,
            @Valid @RequestBody final ResumeUpdateLabelRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(resumeService.updateLabel(id, request,
                SecurityUtils.extractUserId(principal)));
    }

    @PutMapping(value = "/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResumeDocumentResponse> replaceFile(
            @PathVariable final String id,
            @Valid @ModelAttribute final ResumeReplaceFileRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(resumeService.replaceFile(id, request,
                SecurityUtils.extractUserId(principal)));
    }

}
