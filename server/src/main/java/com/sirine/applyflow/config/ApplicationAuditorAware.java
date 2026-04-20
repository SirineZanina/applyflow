package com.sirine.applyflow.config;

import com.sirine.applyflow.user.User;
import lombok.NonNull;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class ApplicationAuditorAware implements AuditorAware<String> {

    private static final String SYSTEM_AUDITOR = "system";

    @Override
    @NonNull
    public Optional<String> getCurrentAuditor() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            return Optional.of(SYSTEM_AUDITOR);
        }

        final Object rawPrincipal = authentication.getPrincipal();
        if (!(rawPrincipal instanceof User user)) {
            return Optional.of(SYSTEM_AUDITOR);
        }

        return Optional.ofNullable(user.getId()).or(() -> Optional.of(SYSTEM_AUDITOR));
    }
}
