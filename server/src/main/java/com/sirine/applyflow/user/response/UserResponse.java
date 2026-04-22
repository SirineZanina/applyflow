package com.sirine.applyflow.user.response;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName
) {}
