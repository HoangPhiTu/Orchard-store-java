package com.orchard.orchard_store_backend.exception;

/**
 * Exception được ném ra khi không tìm thấy resource trong database.
 * 
 * Sử dụng cho các trường hợp như:
 * - Product không tồn tại
 * - Brand không tồn tại
 * - Category không tồn tại
 * 
 * HTTP Status: 404 NOT FOUND
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s không tồn tại với ID: %d", resourceName, id));
    }
    
    public ResourceNotFoundException(String resourceName, String identifier) {
        super(String.format("%s không tồn tại với identifier: %s", resourceName, identifier));
    }
}

