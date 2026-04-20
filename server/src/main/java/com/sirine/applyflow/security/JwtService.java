package com.sirine.applyflow.security;

import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private static final String TOKEN_TYPE_CLAIM = "token_type";

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    @Value("${app.security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public JwtService(
            @Value("${app.security.jwt.private-key-path}") final String privateKeyPath,
            @Value("${app.security.jwt.public-key-path}") final String publicKeyPath)
            throws GeneralSecurityException, IOException {
        this.privateKey = KeyUtils.loadPrivateKey(Path.of(privateKeyPath));
        this.publicKey  = KeyUtils.loadPublicKey(Path.of(publicKeyPath));
    }

    @PostConstruct
    void validateExpirations() {
        if (accessTokenExpiration <= 0) {
            throw new IllegalStateException("app.security.jwt.access-token-expiration must be > 0");
        }
        if (refreshTokenExpiration <= 0) {
            throw new IllegalStateException("app.security.jwt.refresh-token-expiration must be > 0");
        }
        if (refreshTokenExpiration <= accessTokenExpiration) {
            throw new IllegalStateException("refresh-token-expiration must be greater than access-token-expiration");
        }
    }

    // ── Token generation ────────────────────────────────────────────────────

    public String generateAccessToken(final String email) {
        return buildToken(email, Map.of(TOKEN_TYPE_CLAIM, TokenType.ACCESS_TOKEN.name()), accessTokenExpiration, null);
    }

    public String generateRefreshToken(final String email, final String tokenId) {
        return buildToken(email, Map.of(TOKEN_TYPE_CLAIM, TokenType.REFRESH_TOKEN.name()), refreshTokenExpiration, tokenId);
    }

    // ── Validation + extraction ─────────────────────────────────────────────

    /**
     * Validates signature, expiry, and token type, then returns the subject (email).
     * Must be called BEFORE any database lookup — invalid tokens must never trigger a DB hit.
     * Throws {@link BusinessException} on any failure so the filter can catch a single type.
     */
    public String extractUsernameFromAccessToken(final String token) {
        final Claims claims = extractClaims(token); // throws on bad signature or expiry
        if (!TokenType.ACCESS_TOKEN.name().equals(claims.get(TOKEN_TYPE_CLAIM))) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN_TYPE);
        }
        return claims.getSubject();
    }

    public RefreshTokenPayload extractRefreshTokenPayload(final String refreshToken) {
        final Claims claims = extractClaims(refreshToken);
        if (!TokenType.REFRESH_TOKEN.name().equals(claims.get(TOKEN_TYPE_CLAIM))) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN_TYPE);
        }
        final String tokenId = claims.getId();
        if (tokenId == null || tokenId.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        final Date expiration = claims.getExpiration();
        if (expiration == null) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        return new RefreshTokenPayload(claims.getSubject(), tokenId, expiration.toInstant());
    }

    // ── Internal ────────────────────────────────────────────────────────────

    private String buildToken(
            final String username,
            final Map<String, Object> claims,
            final long expiration,
            final String tokenId) {
        final var builder = Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration));
        if (tokenId != null && !tokenId.isBlank()) {
            builder.id(tokenId);
        }
        return builder.signWith(this.privateKey).compact();
    }

    private Claims extractClaims(final String token) {
        try {
            return Jwts.parser()
                    .verifyWith(this.publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException _) {
            throw new BusinessException(ErrorCode.INVALID_JWT_TOKEN);
        }
    }

    public record RefreshTokenPayload(String email, String tokenId, Instant expiresAt) {}
}
