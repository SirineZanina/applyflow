package com.sirine.applyflow.user;

import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.user.request.ProfileUpdateRequest;
import org.apache.commons.lang3.StringUtils;

public final class UserMapper {

    private UserMapper() {}

    public static void mergeUserInfo(final User user, final ProfileUpdateRequest request) {
        if (StringUtils.isNotBlank(request.getFirstName())
                && !user.getFirstName().equals(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }

        if (StringUtils.isNotBlank(request.getLastName())
                && !user.getLastName().equals(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getDateOfBirth() != null
                && !request.getDateOfBirth().equals(user.getDateOfBirth())) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

    }

    public static User toUser(final RegistrationRequest request) {
        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                // password set by called after hashing
                .enabled(true)
                .locked(false)
                .expired(false)
                .credentialsExpired(false)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }
}
