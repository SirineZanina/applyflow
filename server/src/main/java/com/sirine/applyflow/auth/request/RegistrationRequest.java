package com.sirine.applyflow.auth.request;

import com.sirine.applyflow.validation.NonDisposableEmail;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationRequest {

    @NotBlank(message = "VALIDATION.REGISTRATION.FIRSTNAME.NOT_BLANK")
    @Size(
            min = 2,
            max = 50,
            message = "VALIDATION.REGISTRATION.FIRSTNAME.SIZE"
    )
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "VALIDATION.REGISTRATION.FIRSTNAME.PATTERN"
    )
    @Schema(description = "The first name of the user", example = "Sirine")
    private String firstName;

    @NotBlank(message = "VALIDATION.REGISTRATION.LASTNAME.NOT_BLANK")
    @Size(
            min = 2,
            max = 50,
            message = "VALIDATION.REGISTRATION.LASTNAME.SIZE"
    )
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "VALIDATION.REGISTRATION.LASTNAME.PATTERN"
    )
    @Schema(description = "The last name of the user", example = "Zanina")
    private String lastName;

    @NotBlank(message = "VALIDATION.REGISTRATION.EMAIL.NOT_BLANK")
    @Email(message = "VALIDATION.REGISTRATION.EMAIL.FORMAT")
    @NonDisposableEmail(message = "VALIDATION.REGISTRATION.EMAIL.DISPOSABLE")
    @Schema(description = "The email address of the user", example = "sirine@mail.com")
    private String email;

    @NotBlank(message = "VALIDATION.REGISTRATION.PHONE_NUMBER.NOT_BLANK")
    @Pattern(
            regexp = "^\\+?[1-9]\\d{8,13}$",
            message = "VALIDATION.REGISTRATION.PHONE_NUMBER.FORMAT"
    )
    @Schema(description = "The phone number of the user", example = "+21612345678")
    private String phoneNumber;

    @NotBlank(message = "VALIDATION.REGISTRATION.PASSWORD.NOT_BLANK")
    @Size(
            min = 8,
            max = 100,
            message = "VALIDATION.REGISTRATION.PASSWORD.SIZE"
    )
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).*$",
            message = "VALIDATION.REGISTRATION.PASSWORD.WEAK"
    )
    @Schema(description = "The password of the user", example = "P@ssw0rd")
    private String password;

    @NotBlank(message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.NOT_BLANK")
    @Size(
            min = 8,
            max = 100,
            message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.SIZE"
    )
    @Schema(description = "The confirmation password of the user", example = "P@ssw0rd")
    private String confirmPassword;
}
