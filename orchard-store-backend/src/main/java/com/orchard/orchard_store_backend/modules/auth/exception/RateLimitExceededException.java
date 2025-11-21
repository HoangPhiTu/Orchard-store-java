package com.orchard.orchard_store_backend.modules.auth.exception;

/**
 * Thrown khi vượt quá giới hạn gửi OTP.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }
}

