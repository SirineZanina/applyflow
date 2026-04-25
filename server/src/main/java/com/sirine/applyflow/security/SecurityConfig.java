package com.sirine.applyflow.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] DOCS_URLS = {
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-resources",
            "/swagger-resources/**",
            "/configuration/ui",
            "/configuration/security",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/webjars/**"
    };

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${app.security.public-paths}")
    private List<String> publicPaths;

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) {
        final List<String> permitAllPaths = new ArrayList<>(publicPaths);
        permitAllPaths.addAll(List.of(DOCS_URLS));

        try {
            return http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    // CSRF disabled: this API is stateless and authenticates via a JWT in the
                    // Authorization header — not a session cookie. CSRF only applies to
                    // ambient credentials (cookies) the browser auto-attaches; an attacker
                    // cannot read or set the Authorization header cross-origin.
                    // The refresh-token cookie is scoped to /api/v1/auth and SameSite=Strict,
                    // so it cannot be replayed cross-site either.
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth ->
                            auth.requestMatchers(permitAllPaths.toArray(String[]::new))
                                    .permitAll()
                                    .anyRequest()
                                    .authenticated()
                    )
                    .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .addFilterBefore(this.jwtFilter, UsernamePasswordAuthenticationFilter.class)
                    .build();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to build SecurityFilterChain", ex);
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        if (allowedOrigins == null || allowedOrigins.isEmpty()
                || allowedOrigins.stream().anyMatch(o -> o == null || o.isBlank() || "*".equals(o))) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins must list explicit origins (no blanks, no '*'). Got: " + allowedOrigins);
        }
        final CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Authorization header carries the JWT; Content-Type is needed for JSON + multipart bodies.
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
