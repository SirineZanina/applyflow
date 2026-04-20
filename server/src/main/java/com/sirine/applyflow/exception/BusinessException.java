package com.sirine.applyflow.exception;

import lombok.Getter;

import java.io.Serializable;

@Getter
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final ErrorCode errorCode;
    private final Serializable[] args;

    public BusinessException(final ErrorCode errorCode, final Serializable... args){
        super(getFormattedMessage(errorCode, args));
        this.errorCode = errorCode;
        this.args = args;
    }

    private static String getFormattedMessage(final ErrorCode errorCode, final Serializable[] args){
        if (args != null && args.length > 0) {
            return String.format(errorCode.getDefaultMessage(), (Object[]) args);
        }
        return errorCode.getDefaultMessage();
    }
}
