package com.sirine.applyflow.document;

import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.document.request.UpdateGeneratedDocumentRequest;
import com.sirine.applyflow.document.response.GeneratedDocumentResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "Documents", description = "Generated and uploaded document API")
public class GeneratedDocumentController {

    private final GeneratedDocumentService documentService;

    @GetMapping
    public ResponseEntity<List<GeneratedDocumentResponse>> list(final Authentication principal) {
        return ResponseEntity.ok(documentService.list(SecurityUtils.extractUserId(principal)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneratedDocumentResponse> get(@PathVariable final String id, final Authentication principal) {
        return ResponseEntity.ok(documentService.get(id, SecurityUtils.extractUserId(principal)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeneratedDocumentResponse> upload(
            @RequestPart("file") final MultipartFile file,
            @RequestParam(required = false) final String title,
            final Authentication principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadPortfolio(SecurityUtils.extractUserId(principal), title, file));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GeneratedDocumentResponse> update(
            @PathVariable final String id,
            @Valid @org.springframework.web.bind.annotation.RequestBody final UpdateGeneratedDocumentRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(documentService.update(id, SecurityUtils.extractUserId(principal), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable final String id, final Authentication principal) {
        documentService.delete(id, SecurityUtils.extractUserId(principal));
        return ResponseEntity.noContent().build();
    }
}
