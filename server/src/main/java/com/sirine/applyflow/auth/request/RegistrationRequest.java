package com.sirine.applyflow.auth.request;

import com.sirine.applyflow.validation.NonDisposableEmail;
import com.sirine.applyflow.validation.ValidationConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(

        @NotBlank(message = "VALIDATION.REGISTRATION.FIRSTNAME.NOT_BLANK")
        @Size(min = ValidationConstants.NAME_MIN, max = ValidationConstants.NAME_MAX, message = "VALIDATION.REGISTRATION.FIRSTNAME.SIZE")
        @Pattern(regexp = ValidationConstants.NAME_PATTERN, message = "VALIDATION.REGISTRATION.FIRSTNAME.PATTERN")
        @Schema(description = "The first name of the user", example = "Sirine")
        String firstName,

        @NotBlank(message = "VALIDATION.REGISTRATION.LASTNAME.NOT_BLANK")
        @Size(min = ValidationConstants.NAME_MIN, max = ValidationConstants.NAME_MAX, message = "VALIDATION.REGISTRATION.LASTNAME.SIZE")
        @Pattern(regexp = ValidationConstants.NAME_PATTERN, message = "VALIDATION.REGISTRATION.LASTNAME.PATTERN")
        @Schema(description = "The last name of the user", example = "Zanina")
        String lastName,

        @NotBlank(message = "VALIDATION.REGISTRATION.EMAIL.NOT_BLANK")
        @Email(message = "VALIDATION.REGISTRATION.EMAIL.FORMAT")
        @NonDisposableEmail(message = "VALIDATION.REGISTRATION.EMAIL.DISPOSABLE")
        @Schema(description = "The email address of the user", example = "sirine@mail.com")
        String email,

        @NotBlank(message = "VALIDATION.REGISTRATION.PHONE_NUMBER.NOT_BLANK")
        @Pattern(regexp = ValidationConstants.PHONE_PATTERN, message = "VALIDATION.REGISTRATION.PHONE_NUMBER.FORMAT")
        @Schema(description = "The phone number of the user", example = "+21612345678")
        String phoneNumber,

        @NotBlank(message = "VALIDATION.REGISTRATION.PASSWORD.NOT_BLANK")
        @Size(min = ValidationConstants.PASSWORD_MIN, max = ValidationConstants.PASSWORD_MAX, message = "VALIDATION.REGISTRATION.PASSWORD.SIZE")
        @Pattern(regexp = ValidationConstants.PASSWORD_PATTERN, message = "VALIDATION.REGISTRATION.PASSWORD.WEAK")
        @Schema(description = "The password of the user", example = "P@ssw0rd")
        String password,

        @NotBlank(message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.NOT_BLANK")
        @Size(min = ValidationConstants.PASSWORD_MIN, max = ValidationConstants.PASSWORD_MAX, message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.SIZE")
        @Schema(description = "The confirmation password of the user", example = "P@ssw0rd")
        String confirmPassword

) {}
