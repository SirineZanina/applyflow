package com.sirine.applyflow.profile;

import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.profile.request.CandidateProfileRequest;
import com.sirine.applyflow.profile.response.CandidateProfileResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "Candidate Profile", description = "Candidate profile API")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    @GetMapping
    public ResponseEntity<CandidateProfileResponse> getProfile(final Authentication principal) {
        return ResponseEntity.ok(profileService.getByUserId(SecurityUtils.extractUserId(principal)));

    }

    @PutMapping
    public ResponseEntity<CandidateProfileResponse> upsertProfile(
            @RequestBody @Valid final CandidateProfileRequest request,
            final Authentication principal) {
        return ResponseEntity.ok(profileService.upsert(request, SecurityUtils.extractUserId(principal)));
    }
}
