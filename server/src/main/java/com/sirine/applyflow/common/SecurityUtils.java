package com.sirine.applyflow.common;

import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.user.User;
import org.springframework.security.core.Authentication;

public final class SecurityUtils {

    private SecurityUtils(){}

    public static String extractUserId(final Authentication principal){
        if (principal == null || principal.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        final Object rawPrincipal = principal.getPrincipal();
        if (!(rawPrincipal instanceof User user)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        if (user.getId() == null || user.getId().isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return user.getId();
    }
}
