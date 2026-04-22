package com.sirine.applyflow.auth.impl;

import com.sirine.applyflow.auth.AuthTokenPair;
import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.token.RefreshToken;
import com.sirine.applyflow.auth.token.RefreshTokenRepository;
import com.sirine.applyflow.security.JwtService;
import com.sirine.applyflow.user.User;
import com.sirine.applyflow.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.sirine.applyflow.role.RoleRepository roleRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationServiceImpl service;

    @Test
    void loginPersistsRefreshTokenAndReturnsTokens() {
        final User user = User.builder()
                .id("user-1")
                .email("john.doe@example.com")
                .roles(List.of())
                .build();
        final Authentication authentication =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(jwtService.generateAccessToken("john.doe@example.com")).thenReturn("access-token");
        when(jwtService.generateRefreshToken(eq("john.doe@example.com"), anyString())).thenReturn("refresh-token");
        when(jwtService.extractRefreshTokenPayload("refresh-token"))
                .thenReturn(new JwtService.RefreshTokenPayload(
                        "john.doe@example.com",
                        "token-id-1",
                        Instant.now().plusSeconds(3600)
                ));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final AuthTokenPair pair = service.login(new AuthenticationRequest("john.doe@example.com", "P@ssw0rd!"));

        assertThat(pair.accessToken()).isEqualTo("access-token");
        assertThat(pair.refreshToken()).isEqualTo("refresh-token");

        verify(refreshTokenRepository).save(ArgumentMatchers.argThat(token ->
                token.getTokenId().equals("token-id-1") && !token.isRevoked()));
    }

    @Test
    void refreshRotatesRefreshTokenAndRevokesCurrentToken() {
        final User user = User.builder()
                .id("user-1")
                .email("john.doe@example.com")
                .roles(List.of())
                .build();

        final RefreshToken existingToken = RefreshToken.builder()
                .user(user)
                .tokenId("old-token-id")
                .expiresAt(LocalDateTime.now(ZoneOffset.UTC).plusMinutes(30))
                .revoked(false)
                .build();

        when(jwtService.extractRefreshTokenPayload("old-refresh-token"))
                .thenReturn(new JwtService.RefreshTokenPayload(
                        "john.doe@example.com",
                        "old-token-id",
                        Instant.now().plusSeconds(1800)
                ));
        when(userRepository.findByEmailIgnoreCase("john.doe@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByTokenId("old-token-id")).thenReturn(Optional.of(existingToken));
        when(jwtService.generateRefreshToken(eq("john.doe@example.com"), anyString())).thenReturn("new-refresh-token");
        when(jwtService.extractRefreshTokenPayload("new-refresh-token"))
                .thenReturn(new JwtService.RefreshTokenPayload(
                        "john.doe@example.com",
                        "new-token-id",
                        Instant.now().plusSeconds(3600)
                ));
        when(jwtService.generateAccessToken("john.doe@example.com")).thenReturn("new-access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final AuthTokenPair pair = service.refreshToken("old-refresh-token");

        assertThat(pair.accessToken()).isEqualTo("new-access-token");
        assertThat(pair.refreshToken()).isEqualTo("new-refresh-token");

        assertThat(existingToken.isRevoked()).isTrue();
        assertThat(existingToken.getReplacedByTokenId()).isEqualTo("new-token-id");
    }

    @Test
    void logoutRevokesExistingRefreshToken() {
        final User user = User.builder()
                .id("user-1")
                .email("john.doe@example.com")
                .roles(List.of())
                .build();

        final RefreshToken existingToken = RefreshToken.builder()
                .user(user)
                .tokenId("token-id-1")
                .expiresAt(LocalDateTime.now(ZoneOffset.UTC).plusMinutes(10))
                .revoked(false)
                .build();

        when(jwtService.extractRefreshTokenPayload("refresh-token"))
                .thenReturn(new JwtService.RefreshTokenPayload(
                        "john.doe@example.com",
                        "token-id-1",
                        Instant.now().plusSeconds(600)
                ));
        when(refreshTokenRepository.findByTokenId("token-id-1")).thenReturn(Optional.of(existingToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.logout("refresh-token");

        assertThat(existingToken.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(existingToken);
    }
}
