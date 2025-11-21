package com.orchard.orchard_store_backend.modules.auth.exception;

/**
 * Thrown khi OTP sai hoặc đã hết hạn.
 */
public class InvalidOtpException extends RuntimeException {

    public InvalidOtpException(String message) {
        super(message);
    }
}

