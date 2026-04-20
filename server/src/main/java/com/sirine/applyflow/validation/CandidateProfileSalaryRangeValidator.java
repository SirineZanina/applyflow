package com.sirine.applyflow.validation;

import com.sirine.applyflow.profile.request.CandidateProfileRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CandidateProfileSalaryRangeValidator implements ConstraintValidator<ValidSalaryRange, CandidateProfileRequest> {

    @Override
    public boolean isValid(
            final CandidateProfileRequest request,
            final ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        final Integer salaryMin = request.getSalaryMin();
        final Integer salaryMax = request.getSalaryMax();
        if (salaryMin == null || salaryMax == null || salaryMin <= salaryMax) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                .addPropertyNode("salaryMax")
                .addConstraintViolation();
        return false;
    }
}
