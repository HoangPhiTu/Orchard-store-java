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
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
    private String name;

    @NotNull(message = "Brand ID không được để trống")
    @Positive(message = "Brand ID phải là số dương")
    private Long brandId;

    private String brandName;

    @Pattern(regexp = "^(DRAFT|UNDER_REVIEW|ACTIVE|INACTIVE|ARCHIVED)$",
            message = "Status phải là DRAFT, UNDER_REVIEW, ACTIVE, INACTIVE hoặc ARCHIVED")
    private String status;

    private LocalDateTime publishedAt;
    private LocalDateTime archivedAt;

    private Long createdById;
    private Long updatedById;

    /**
     * Primary/thumbnail image URL for listing display
     * Mapped from first primary image or first image in the list
     */
    private String thumbnailUrl;

    /**
     * Primary image URL (full size)
     */
    private String primaryImageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

