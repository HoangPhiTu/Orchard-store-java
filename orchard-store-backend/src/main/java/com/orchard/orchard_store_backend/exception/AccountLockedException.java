package com.orchard.orchard_store_backend.exception;

/**
 * Exception thrown when an account is locked
 */
public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String message) {
        super(message);
    }
    
    public AccountLockedException(String message, Throwable cause) {
        super(message, cause);
    }
}

