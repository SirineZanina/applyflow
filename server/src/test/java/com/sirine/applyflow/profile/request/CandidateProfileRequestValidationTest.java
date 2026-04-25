package com.sirine.applyflow.profile.request;

import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static jakarta.validation.Validation.buildDefaultValidatorFactory;
import static org.assertj.core.api.Assertions.assertThat;

class CandidateProfileRequestValidationTest {

    private final Validator validator = buildDefaultValidatorFactory().getValidator();

    @Test
    void salaryRangeIsInvalidWhenMinGreaterThanMax() {
        final CandidateProfileRequest request =
                new CandidateProfileRequest(null, null, null, null, null, null, null, null, 5000, 3000, null);

        final var violations = validator.validate(request);

        assertThat(violations)
                .anySatisfy(v -> {
                    assertThat(v.getPropertyPath().toString()).hasToString("salaryMax");
                    assertThat(v.getMessage()).isEqualTo("VALIDATION.PROFILE.SALARY_RANGE.INVALID");
                });
    }

    @Test
    void salaryRangeIsValidWhenMinLessOrEqualToMax() {
        final CandidateProfileRequest request =
                new CandidateProfileRequest(null, null, null, null, null, null, null, null, 3000, 5000, null);

        final var violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
