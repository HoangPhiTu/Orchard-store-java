package com.orchard.orchard_store_backend.exception;

/**
 * Exception thrown when credentials are invalid
 */
public class InvalidCredentialsException extends RuntimeException {
    private final int remainingAttempts;
    
    public InvalidCredentialsException(String message) {
        super(message);
        this.remainingAttempts = -1; // Unknown
    }
    
    public InvalidCredentialsException(String message, int remainingAttempts) {
        super(message);
        this.remainingAttempts = remainingAttempts;
    }
    
    public int getRemainingAttempts() {
        return remainingAttempts;
    }
    
    public boolean hasRemainingAttempts() {
        return remainingAttempts >= 0;
    }
}

