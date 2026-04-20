package com.sirine.applyflow.security;

import com.sirine.applyflow.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.http.server.PathContainer;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private static final PathPatternParser PATH_PATTERN_PARSER = new PathPatternParser();

    @Value("${app.security.public-paths}")
    private List<String> publicPaths;

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private List<PathPattern> compiledPublicPaths = List.of();

    @PostConstruct
    void initPublicPaths() {
        this.compiledPublicPaths = publicPaths.stream()
                .map(String::trim)
                .filter(pattern -> !pattern.isBlank())
                .map(PATH_PATTERN_PARSER::parse)
                .toList();
    }

    @Override
    protected void doFilterInternal(
            @NonNull final HttpServletRequest request,
            @NonNull final HttpServletResponse response,
            @NonNull final FilterChain filterChain) throws ServletException, IOException {

        final PathContainer requestPath = PathContainer.parsePath(request.getServletPath());
        if (compiledPublicPaths.stream().anyMatch(pattern -> pattern.matches(requestPath))) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        // Validate the token completely (signature + expiry + token type) BEFORE touching the DB.
        // A bad token must never trigger a database lookup — that would be both a waste and a
        // timing-based user-enumeration vector.
        final String username;
        try {
            username = jwtService.extractUsernameFromAccessToken(jwt);
        } catch (BusinessException _) {
            // Token is invalid, expired, or the wrong type. Don't set an Authentication — Spring
            // Security's AuthenticationEntryPoint will return 401.
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        final UserDetails userDetails;
        try {
            userDetails = userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException _) {
            // Valid JWT but the user was deleted after it was issued. Log at WARN — this is unusual.
            log.warn("JWT references unknown user '{}'; rejecting", username);
            filterChain.doFilter(request, response);
            return;
        }

        if (userDetails.isEnabled() && userDetails.isAccountNonLocked() && userDetails.isCredentialsNonExpired()) {
            final UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
