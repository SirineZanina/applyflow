package com.sirine.applyflow.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.ArrayList;
import java.util.List;

import static com.sirine.applyflow.exception.ErrorCode.*;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class ApplicationExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleException(final BusinessException ex) {
        final ErrorResponse body = ErrorResponse.builder()
                .code(ex.getErrorCode().getCode())
                .message(ex.getMessage())
                .build();

        log.info("Business exception: {}", ex.getMessage());
        log.debug(ex.getMessage(), ex);

        return ResponseEntity.status(ex.getErrorCode()
                        .getStatus() != null ? ex.getErrorCode()
                        .getStatus() : BAD_REQUEST)
                .body(body);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleException(final DisabledException ex) {
        log.debug(ex.getMessage(), ex);
        final ErrorResponse body = ErrorResponse.builder()
                .code(ERR_USER_DISABLED.getCode())
                .message(ERR_USER_DISABLED.getDefaultMessage())
                .build();
        return ResponseEntity.status(ERR_USER_DISABLED.getStatus())
                .body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleException(final BadCredentialsException ex) {
        log.debug(ex.getMessage(), ex);
        final ErrorResponse response = ErrorResponse.builder()
                .code(BAD_CREDENTIALS.getCode())
                .message(BAD_CREDENTIALS.getDefaultMessage())
                .build();

        return ResponseEntity.status(BAD_CREDENTIALS.getStatus())
                .body(response);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(UsernameNotFoundException ex) {
        log.debug(ex.getMessage(), ex);
        final ErrorResponse response = ErrorResponse.builder()
                .code(USERNAME_NOT_FOUND.getCode())
                .message(USERNAME_NOT_FOUND.getDefaultMessage())
                .build();

        return new ResponseEntity<>(response, NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleException(MethodArgumentNotValidException ex) {
        final List<ErrorResponse.ValidationError> errors = new ArrayList<>();
        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {
                    final String fieldName = error instanceof FieldError fieldError
                            ? fieldError.getField()
                            : error.getObjectName();
                    final String errorCode = error.getDefaultMessage();
                    errors.add(ErrorResponse.ValidationError.builder()
                            .field(fieldName)
                            .code(errorCode)
                            .message(errorCode)
                            .build());
                });
        final ErrorResponse errorResponse = ErrorResponse.builder()
                .code(VALIDATION_ERROR.getCode())
                .message(VALIDATION_ERROR.getDefaultMessage())
                .validationErrors(errors)
                .build();
        return ResponseEntity.status(BAD_REQUEST)
                .body(errorResponse);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleException(final ConstraintViolationException ex) {
        final List<ErrorResponse.ValidationError> errors = ex.getConstraintViolations().stream()
                .map(v -> ErrorResponse.ValidationError.builder()
                        .field(v.getPropertyPath().toString())
                        .code(v.getMessage())
                        .message(v.getMessage())
                        .build())
                .toList();
        return ResponseEntity.status(BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .code(VALIDATION_ERROR.getCode())
                        .message(VALIDATION_ERROR.getDefaultMessage())
                        .validationErrors(errors)
                        .build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleException(final MaxUploadSizeExceededException ex) {
        log.debug(ex.getMessage(), ex);
        return ResponseEntity.status(RESUME_FILE_TOO_LARGE.getStatus())
                .body(ErrorResponse.builder()
                        .code(RESUME_FILE_TOO_LARGE.getCode())
                        .message(RESUME_FILE_TOO_LARGE.getDefaultMessage())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error(ex.getMessage(), ex);
        final ErrorResponse response = ErrorResponse.builder()
                .code(INTERNAL_EXCEPTION.getCode())
                .message(INTERNAL_EXCEPTION.getDefaultMessage())
                .build();
        return ResponseEntity.status(INTERNAL_EXCEPTION.getStatus())
                .body(response);
    }
}
