package com.sirine.applyflow.profile.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CandidateProfileRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void salaryRangeIsInvalidWhenMinGreaterThanMax() {
        final CandidateProfileRequest request = CandidateProfileRequest.builder()
                .salaryMin(5000)
                .salaryMax(3000)
                .build();

        final var violations = validator.validate(request);

        assertThat(violations)
                .anySatisfy(v -> {
                    assertThat(v.getPropertyPath().toString()).isEqualTo("salaryMax");
                    assertThat(v.getMessage()).isEqualTo("VALIDATION.PROFILE.SALARY_RANGE.INVALID");
                });
    }

    @Test
    void salaryRangeIsValidWhenMinLessOrEqualToMax() {
        final CandidateProfileRequest request = CandidateProfileRequest.builder()
                .salaryMin(3000)
                .salaryMax(5000)
                .build();

        final var violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
