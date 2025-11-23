package com.orchard.orchard_store_backend.exception;

/**
 * Exception được ném ra khi thao tác không được phép.
 * 
 * Sử dụng cho các trường hợp như:
 * - Tự khóa/xóa tài khoản của chính mình
 * - Thao tác không có quyền
 * 
 * HTTP Status: 400 BAD REQUEST hoặc 403 FORBIDDEN
 */
public class OperationNotPermittedException extends RuntimeException {
    
    public OperationNotPermittedException(String message) {
        super(message);
    }
    
    public OperationNotPermittedException(String resourceName, String operation) {
        super(String.format("Không được phép %s %s", operation, resourceName));
    }
}

