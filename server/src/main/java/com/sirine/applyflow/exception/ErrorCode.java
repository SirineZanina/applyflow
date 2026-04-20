package com.sirine.applyflow.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    USER_NOT_FOUND("USER_NOT_FOUND", "User not found with id %s", HttpStatus.NOT_FOUND),
    CHANGE_PASSWORD_MISMATCH("CHANGE_PASSWORD_MISMATCH", "Current password and new password are not the same", HttpStatus.BAD_REQUEST),
    INVALID_CURRENT_PASSWORD("INVALID_CURRENT_PASSWORD", "Current password is incorrect", HttpStatus.BAD_REQUEST),
    ACCOUNT_ALREADY_DEACTIVATED("ACCOUNT_ALREADY_DEACTIVATED", "Account is already deactivated", HttpStatus.BAD_REQUEST),
    ACCOUNT_ALREADY_ENABLED("ACCOUNT_ALREADY_ENABLED", "Account is already enabled", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email %s already exists", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_ALREADY_EXISTS("PHONE_NUMBER_ALREADY_EXISTS", "Phone number %s already exists", HttpStatus.BAD_REQUEST),
    PASSWORD_MISMATCH("PASSWORD_MISMATCH", "Password and confirm password do not match", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("VALIDATION_ERROR", "Request validation failed", HttpStatus.BAD_REQUEST),
    ERR_USER_DISABLED("ERR_USER_DISABLED", "User account is disabled", HttpStatus.UNAUTHORIZED),
    BAD_CREDENTIALS("BAD_CREDENTIALS", "Email and / or password is incorrect", HttpStatus.UNAUTHORIZED),
    USERNAME_NOT_FOUND("USERNAME_NOT_FOUND", "User not found with email %s", HttpStatus.NOT_FOUND),
    INTERNAL_EXCEPTION("INTERNAL_EXCEPTION", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED("UNAUTHORIZED", "Authentication is required to access this resource", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    STORAGE_UPLOAD_FAILED("STORAGE_UPLOAD_FAILED", "Failed to upload object %s", HttpStatus.INTERNAL_SERVER_ERROR),
    STORAGE_OBJECT_NOT_FOUND("STORAGE_OBJECT_NOT_FOUND", "Object not found with key %s", HttpStatus.NOT_FOUND),
    AI_REQUEST_FAILED("AI_REQUEST_FAILED", "AI provider request failed: %s", HttpStatus.BAD_GATEWAY),
    AI_RESPONSE_PARSE_FAILED("AI_RESPONSE_PARSE_FAILED", "Failed to parse AI response: %s", HttpStatus.INTERNAL_SERVER_ERROR),
    CANDIDATE_PROFILE_NOT_FOUND("PROFILE_NOT_FOUND", "Candidate profile not found for user %s", HttpStatus.NOT_FOUND),
    RESUME_NOT_FOUND("RESUME_NOT_FOUND", "Resume not found with id %s", HttpStatus.NOT_FOUND),
    RESUME_INVALID_FILE("RESUME_INVALID_FILE", "Unsupported resume file type %s", HttpStatus.BAD_REQUEST),
    RESUME_FILE_TOO_LARGE("RESUME_FILE_TOO_LARGE", "Resume file exceeds max size of %s bytes", HttpStatus.CONTENT_TOO_LARGE),
    RESUME_FILE_EMPTY("RESUME_FILE_EMPTY", "Resume file is empty", HttpStatus.BAD_REQUEST),
    RESUME_FILE_READ_FAILED("RESUME_FILE_READ_FAILED", "Failed to read resume file", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_JWT_TOKEN("INVALID_JWT_TOKEN", "Invalid JWT token", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", "Invalid refresh token", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN_TYPE("INVALID_TOKEN_TYPE", "Invalid token type", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED("REFRESH_TOKEN_EXPIRED", "Refresh token has expired", HttpStatus.UNAUTHORIZED);

    private final String code;
    private final String defaultMessage; // i18n / l10n
    private final HttpStatus status;

    ErrorCode(
            final String code,
            final String defaultMessage,
            final HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }

}
