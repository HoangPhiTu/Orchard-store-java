package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageDTO {

    private Long id;
    private Long productId;
    private Long productVariantId;

    @NotBlank(message = "URL hình ảnh không được để trống")
    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|/.*)$",
            message = "URL hình ảnh phải là URL hợp lệ (http://, https://) hoặc đường dẫn tương đối")
    private String imageUrl;

    @Size(max = 500, message = "URL thumbnail không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|/.*|)$",
            message = "URL thumbnail phải là URL hợp lệ hoặc để trống")
    private String thumbnailUrl;

    @Size(max = 255, message = "Alt text không được vượt quá 255 ký tự")
    private String altText;

    @Size(max = 50, message = "Loại hình ảnh không được vượt quá 50 ký tự")
    private String imageType;

    private Long fileSizeBytes;
    private Integer width;
    private Integer height;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;

    private Boolean isPrimary;
    private LocalDateTime createdAt;
}

