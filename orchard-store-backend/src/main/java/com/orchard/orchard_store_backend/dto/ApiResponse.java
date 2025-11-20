package com.orchard.orchard_store_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Wrapper class cho API Response chuẩn RESTful.
 * 
 * Sử dụng để chuẩn hóa format response cho tất cả các API endpoints.
 * 
 * @param <T> Type của data trong response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    /**
     * HTTP Status code (200, 201, 400, 404, etc.)
     */
    private Integer status;

    /**
     * Message mô tả kết quả
     */
    private String message;

    /**
     * Data payload (có thể là DTO, List, hoặc null)
     */
    private T data;

    /**
     * Timestamp của response
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Helper method để tạo success response với data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message("Thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper method để tạo success response với custom message
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper method để tạo created response (201)
     */
    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .status(201)
                .message("Tạo mới thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper method để tạo created response với custom message
     */
    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .status(201)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper method để tạo error response
     */
    public static <T> ApiResponse<T> error(Integer status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}

