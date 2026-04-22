package com.sirine.applyflow.auth;

import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.auth.response.AuthenticationResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthenticationController {

    private static final String TOKEN_TYPE = "Bearer";
    private static final String REFRESH_COOKIE_NAME = "refresh_token";

    private static final String REFRESH_COOKIE_PATH = "/api/v1/auth";

    @Value("${app.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private final AuthenticationService authenticationService;

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody final AuthenticationRequest request,
            final HttpServletResponse response
    ) {
        final AuthTokenPair pair = this.authenticationService.login(request);
        setRefreshCookie(response, pair.refreshToken());
        return ResponseEntity.ok(new AuthenticationResponse(pair.accessToken(), TOKEN_TYPE));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody final RegistrationRequest request
    ) {
        this.authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) final String rawRefreshToken,
            final HttpServletResponse response
    ) {
        if (rawRefreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        final AuthTokenPair pair = this.authenticationService.refreshToken(rawRefreshToken);
        setRefreshCookie(response, pair.refreshToken());
        return ResponseEntity.ok(new AuthenticationResponse(pair.accessToken(), TOKEN_TYPE));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) final String rawRefreshToken,
            final HttpServletResponse response
    ) {
        if (rawRefreshToken != null) {
            this.authenticationService.logout(rawRefreshToken);
        }
        clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    private void setRefreshCookie(final HttpServletResponse response, final
    String token) {
        final ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME,
                        token)
                .httpOnly(true)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(refreshTokenExpiration / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(final HttpServletResponse response) {
        final ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME,
                        "")
                .httpOnly(true)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
