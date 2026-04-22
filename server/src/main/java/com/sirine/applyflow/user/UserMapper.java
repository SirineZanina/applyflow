package com.sirine.applyflow.user;

import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.user.request.ProfileUpdateRequest;
import com.sirine.applyflow.user.response.UserResponse;
import org.apache.commons.lang3.StringUtils;

public final class UserMapper {

    private UserMapper() {}

    public static void mergeUserInfo(final User user, final ProfileUpdateRequest request) {
        if (StringUtils.isNotBlank(request.firstName())
                && !user.getFirstName().equals(request.firstName())) {
            user.setFirstName(request.firstName());
        }

        if (StringUtils.isNotBlank(request.lastName())
                && !user.getLastName().equals(request.lastName())) {
            user.setLastName(request.lastName());
        }

        if (request.dateOfBirth() != null
                && !request.dateOfBirth().equals(user.getDateOfBirth())) {
            user.setDateOfBirth(request.dateOfBirth());
        }

    }

    public static UserResponse toUserResponse(final User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public static User toUser(final RegistrationRequest request) {
        return User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
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
