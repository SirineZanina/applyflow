package com.sirine.applyflow.application.response;

public record PrepareJobApplicationResponse(
        String applicationId,
        boolean created
) {}
