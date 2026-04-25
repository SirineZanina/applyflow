package com.sirine.applyflow.user.request;

import com.sirine.applyflow.validation.ValidationConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProfileUpdateRequest(

        @Size(min = ValidationConstants.NAME_MIN, max = ValidationConstants.NAME_MAX, message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.SIZE")
        @Pattern(regexp = ValidationConstants.NAME_PATTERN, message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.PATTERN")
        @Schema(description = "The first name of the user", example = "Sirine")
        String firstName,

        @Size(min = ValidationConstants.NAME_MIN, max = ValidationConstants.NAME_MAX, message = "VALIDATION.PROFILE_UPDATE.LASTNAME.SIZE")
        @Pattern(regexp = ValidationConstants.NAME_PATTERN, message = "VALIDATION.PROFILE_UPDATE.LASTNAME.PATTERN")
        @Schema(description = "The last name of the user", example = "Zanina")
        String lastName,

        @Past(message = "VALIDATION.PROFILE_UPDATE.DATE_OF_BIRTH.PAST")
        @Schema(description = "The date of birth of the user", example = "1998-04-12")
        LocalDate dateOfBirth

) {}
