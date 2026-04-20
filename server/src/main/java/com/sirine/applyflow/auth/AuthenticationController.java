package com.sirine.applyflow.auth;

import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.request.RefreshRequest;
import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.auth.response.AuthenticationResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid
            @RequestBody
            final AuthenticationRequest request
    ) {
        return ResponseEntity.ok(this.authenticationService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid
            @RequestBody
            final RegistrationRequest request
    ) {
        this.authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(
            @Valid
            @RequestBody
            final RefreshRequest request
    ) {
        return ResponseEntity.ok(this.authenticationService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Valid
            @RequestBody
            final RefreshRequest request
    ) {
        this.authenticationService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
