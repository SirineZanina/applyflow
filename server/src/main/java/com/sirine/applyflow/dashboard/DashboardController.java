package com.sirine.applyflow.dashboard;

import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.dashboard.response.DashboardSummaryResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "Dashboard", description = "Dashboard summary API")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(final Authentication principal) {
        return ResponseEntity.ok(dashboardService.getSummary(SecurityUtils.extractUserId(principal)));
    }
}
