package com.sirine.applyflow.user.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProfileUpdateRequest(

        @Size(min = 2, max = 50, message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.SIZE")
        @Pattern(regexp = "^[\\p{L} '-]+$", message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.PATTERN")
        @Schema(description = "The first name of the user", example = "Sirine")
        String firstName,

        @Size(min = 2, max = 50, message = "VALIDATION.PROFILE_UPDATE.LASTNAME.SIZE")
        @Pattern(regexp = "^[\\p{L} '-]+$", message = "VALIDATION.PROFILE_UPDATE.LASTNAME.PATTERN")
        @Schema(description = "The last name of the user", example = "Zanina")
        String lastName,

        @Past(message = "VALIDATION.PROFILE_UPDATE.DATE_OF_BIRTH.PAST")
        @Schema(description = "The date of birth of the user", example = "1998-04-12")
        LocalDate dateOfBirth

) {}
