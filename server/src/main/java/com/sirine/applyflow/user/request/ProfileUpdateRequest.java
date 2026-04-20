package com.sirine.applyflow.user.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    @Size(
            min = 2,
            max = 50,
            message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.SIZE"
    )
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "VALIDATION.PROFILE_UPDATE.FIRSTNAME.PATTERN"
    )
    @Schema(description = "The first name of the user", example = "Sirine")
    private String firstName;

    @Size(
            min = 2,
            max = 50,
            message = "VALIDATION.PROFILE_UPDATE.LASTNAME.SIZE"
    )
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "VALIDATION.PROFILE_UPDATE.LASTNAME.PATTERN"
    )
    @Schema(description = "The last name of the user", example = "Zanina")
    private String lastName;

    @Past(message = "VALIDATION.PROFILE_UPDATE.DATE_OF_BIRTH.PAST")
    @Schema(description = "The date of birth of the user", example = "1998-04-12")
    private LocalDate dateOfBirth;
}
