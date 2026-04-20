package com.sirine.applyflow.auth.impl;

import com.sirine.applyflow.auth.AuthenticationService;
import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.request.RefreshRequest;
import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.auth.response.AuthenticationResponse;
import com.sirine.applyflow.auth.token.RefreshToken;
import com.sirine.applyflow.auth.token.RefreshTokenRepository;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.role.Role;
import com.sirine.applyflow.role.RoleRepository;
import com.sirine.applyflow.security.JwtService;
import com.sirine.applyflow.user.User;
import com.sirine.applyflow.user.UserMapper;
import com.sirine.applyflow.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthenticationResponse login(final AuthenticationRequest request) {
        final Authentication auth = this.authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        final User user = (User) auth.getPrincipal();
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        final String token = this.jwtService.generateAccessToken(user.getUsername());
        final String refreshTokenId = UUID.randomUUID().toString();
        final String refreshToken = this.jwtService.generateRefreshToken(user.getUsername(), refreshTokenId);
        final JwtService.RefreshTokenPayload refreshPayload = this.jwtService.extractRefreshTokenPayload(refreshToken);
        this.refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenId(refreshPayload.tokenId())
                .expiresAt(LocalDateTime.ofInstant(refreshPayload.expiresAt(), ZoneOffset.UTC))
                .revoked(false)
                .build());

        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType(TOKEN_TYPE)
                .build();
    }

    @Override
    @Transactional
    public void register(RegistrationRequest request) {
        checkUserEmail(request.getEmail());
        checkUserPhoneNumber(request.getPhoneNumber());
        checkPasswords(request.getPassword(), request.getConfirmPassword());

        final Role userRole = this.roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new EntityNotFoundException("Default role not found: ROLE_USER"));

        final List<Role> roles = new ArrayList<>();
        roles.add(userRole);

        final User user = UserMapper.toUser(request);
        user.setPassword(this.passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);
        log.debug("Saving user {}", user);
        this.userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthenticationResponse refreshToken(final RefreshRequest request) {
        final JwtService.RefreshTokenPayload payload = this.jwtService.extractRefreshTokenPayload(request.getRefreshToken());
        final User user = this.userRepository.findByEmailIgnoreCase(payload.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));
        final RefreshToken storedToken = this.refreshTokenRepository.findByTokenId(payload.tokenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (!storedToken.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (storedToken.isRevoked()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        final LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (!storedToken.getExpiresAt().isAfter(now)) {
            storedToken.setRevoked(true);
            storedToken.setRevokedAt(now);
            this.refreshTokenRepository.save(storedToken);
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        final String newRefreshTokenId = UUID.randomUUID().toString();
        final String rotatedRefreshToken = this.jwtService.generateRefreshToken(user.getUsername(), newRefreshTokenId);
        final JwtService.RefreshTokenPayload rotatedPayload = this.jwtService.extractRefreshTokenPayload(rotatedRefreshToken);

        storedToken.setRevoked(true);
        storedToken.setRevokedAt(now);
        storedToken.setReplacedByTokenId(rotatedPayload.tokenId());
        this.refreshTokenRepository.save(storedToken);

        this.refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenId(rotatedPayload.tokenId())
                .expiresAt(LocalDateTime.ofInstant(rotatedPayload.expiresAt(), ZoneOffset.UTC))
                .revoked(false)
                .build());

        final String newAccessToken = this.jwtService.generateAccessToken(user.getUsername());
        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(rotatedRefreshToken)
                .tokenType(TOKEN_TYPE)
                .build();
    }

    @Override
    @Transactional
    public void logout(final RefreshRequest request) {
        final JwtService.RefreshTokenPayload payload = this.jwtService.extractRefreshTokenPayload(request.getRefreshToken());
        final RefreshToken storedToken = this.refreshTokenRepository.findByTokenId(payload.tokenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));
        if (!storedToken.getUser().getEmail().equalsIgnoreCase(payload.email())) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (!storedToken.isRevoked()) {
            storedToken.setRevoked(true);
            storedToken.setRevokedAt(LocalDateTime.now(ZoneOffset.UTC));
            this.refreshTokenRepository.save(storedToken);
        }
    }

    private void checkUserEmail(final String email) {
       final boolean emailExists = this.userRepository.existsByEmailIgnoreCase(email);
       if (emailExists){
           throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
       }
    }

    private void checkUserPhoneNumber(final String phoneNumber) {
        final boolean phoneNumberExists = this.userRepository.existsByPhoneNumber(phoneNumber);
        if (phoneNumberExists){
            throw new BusinessException(ErrorCode.PHONE_NUMBER_ALREADY_EXISTS);
        }
    }

    private void checkPasswords(final String password, final String confirmPassword) {
        if (password == null || !password.equals(confirmPassword)) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }
    }
}
