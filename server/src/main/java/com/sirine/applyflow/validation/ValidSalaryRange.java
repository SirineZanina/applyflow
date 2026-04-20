package com.sirine.applyflow.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CandidateProfileSalaryRangeValidator.class)
public @interface ValidSalaryRange {

    String message() default "VALIDATION.PROFILE.SALARY_RANGE.INVALID";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
