package com.sirine.applyflow.automation;

import com.sirine.applyflow.automation.request.AutomationLaunchRequest;
import com.sirine.applyflow.automation.request.AutomationPreviewRequest;
import com.sirine.applyflow.automation.response.AutomationLaunchResponse;
import com.sirine.applyflow.automation.response.AutomationPreviewResponse;
import com.sirine.applyflow.common.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/automation")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "Automation", description = "Guided auto-apply preparation API")
public class AutomationController {

    private final AutomationService automationService;

    @PostMapping("/preview")
    public ResponseEntity<AutomationPreviewResponse> preview(
            @Valid @RequestBody final AutomationPreviewRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(automationService.preview(SecurityUtils.extractUserId(principal), request));
    }

    @PostMapping("/launch")
    public ResponseEntity<AutomationLaunchResponse> launch(
            @Valid @RequestBody final AutomationLaunchRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(automationService.launch(SecurityUtils.extractUserId(principal), request));
    }
}
