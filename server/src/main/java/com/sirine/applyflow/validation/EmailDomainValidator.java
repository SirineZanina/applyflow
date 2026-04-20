package com.sirine.applyflow.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;


import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public class EmailDomainValidator implements ConstraintValidator<NonDisposableEmail, String> {

    private final Set<String> blockedEmails;

    public EmailDomainValidator(
            @Value("${app.security.disposable-emails}")
            final List<String> domains
            ) {
        this.blockedEmails = domains.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext constraintValidatorContext) {
        if (email == null || !email.contains("@")) {
            return true; // Let @Email handle this case
        }

        final int atIndex = email.lastIndexOf('@');
        if (atIndex <= 0 || atIndex == email.length() - 1) {
            return true; // Let @Email handle malformed addresses
        }

        final String domain = email.substring(atIndex + 1)
                .trim()
                .toLowerCase(Locale.ROOT);
        if (domain.isBlank()) {
            return true;
        }

        final Set<String> labels = Arrays.stream(domain.split("\\."))
                .filter(label -> !label.isBlank())
                .collect(Collectors.toSet());

        return labels.stream().noneMatch(this.blockedEmails::contains);
    }
}
