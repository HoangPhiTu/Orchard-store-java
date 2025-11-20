package com.orchard.orchard_store_backend.modules.shopping.exception;

public class CartRateLimitException extends RuntimeException {
    public CartRateLimitException(String message) {
        super(message);
    }
}

