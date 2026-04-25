package com.sirine.applyflow.user.request;

import com.sirine.applyflow.validation.ValidationConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.CURRENT_PASSWORD.NOT_BLANK")
        @Schema(description = "The current password of the user", example = "P@ssw0rd")
        String currentPassword,

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.NOT_BLANK")
        @Size(min = ValidationConstants.PASSWORD_MIN, max = ValidationConstants.PASSWORD_MAX, message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.SIZE")
        @Pattern(regexp = ValidationConstants.PASSWORD_PATTERN, message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.WEAK")
        @Schema(description = "The new password of the user", example = "P@ssw0rd")
        String newPassword,

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD.NOT_BLANK")
        @Size(min = ValidationConstants.PASSWORD_MIN, max = ValidationConstants.PASSWORD_MAX, message = "VALIDATION.CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD.SIZE")
        @Pattern(regexp = ValidationConstants.PASSWORD_PATTERN, message = "VALIDATION.CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD.WEAK")
        @Schema(description = "The confirmation of the new password", example = "P@ssw0rd")
        String confirmNewPassword

) {}
