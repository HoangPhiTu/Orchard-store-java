package com.orchard.orchard_store_backend.modules.catalog.bundle.dto;

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
public class BundleItemDTO {

    private Long id;
    private Long bundleId;

    @NotNull(message = "Product ID không được để trống")
    @Positive(message = "Product ID phải là số dương")
    private Long productId;
    private String productName;
    private String productSlug;

    private Long productVariantId;
    private String productVariantName;
    private String productVariantSku;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer quantity;

    private Boolean isRequired;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    private Integer displayOrder;

    private LocalDateTime createdAt;
}

