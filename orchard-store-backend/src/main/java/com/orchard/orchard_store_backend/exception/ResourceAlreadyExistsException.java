package com.orchard.orchard_store_backend.exception;

/**
 * Exception được ném ra khi resource đã tồn tại trong database.
 * 
 * Sử dụng cho các trường hợp như:
 * - SKU đã tồn tại
 * - Slug đã tồn tại
 * - Email đã tồn tại
 * 
 * HTTP Status: 409 CONFLICT
 */
public class ResourceAlreadyExistsException extends RuntimeException {
    
    public ResourceAlreadyExistsException(String message) {
        super(message);
    }
    
    public ResourceAlreadyExistsException(String resourceName, String field, String value) {
        super(String.format("%s đã tồn tại với %s: %s", resourceName, field, value));
    }
}

