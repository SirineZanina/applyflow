package com.sirine.applyflow.user.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.CURRENT_PASSWORD.NOT_BLANK")
        @Schema(description = "The current password of the user", example = "P@ssw0rd")
        String currentPassword,

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.NOT_BLANK")
        @Size(min = 8, max = 100, message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.SIZE")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).*$", message = "VALIDATION.CHANGE_PASSWORD.NEW_PASSWORD.WEAK")
        @Schema(description = "The new password of the user", example = "P@ssw0rd")
        String newPassword,

        @NotBlank(message = "VALIDATION.CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD.NOT_BLANK")
        @Size(min = 8, max = 100, message = "VALIDATION.CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD.SIZE")
        @Schema(description = "The confirmation of the new password", example = "P@ssw0rd")
        String confirmNewPassword

) {}
