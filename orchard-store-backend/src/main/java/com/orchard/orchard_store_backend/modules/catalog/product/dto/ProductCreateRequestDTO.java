package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO cho request tạo mới Product từ Admin Panel.
 * 
 * Bao gồm:
 * - Thông tin Product cơ bản
 * - Danh sách Variants (có thể có nhiều variants)
 * - Danh sách AttributeValues (cho từng variant)
 * - Danh sách Images
 * 
 * Note: Slug sẽ được tự động generate từ tên sản phẩm.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequestDTO {

    /**
     * Tên sản phẩm (bắt buộc)
     * Slug sẽ được tự động generate từ tên này
     */
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
    private String name;

    /**
     * Brand ID (bắt buộc)
     */
    @NotNull(message = "Brand ID không được để trống")
    @Positive(message = "Brand ID phải là số dương")
    private Long brandId;

    /**
     * Status mặc định: DRAFT
     */
    @Builder.Default
    private String status = "DRAFT";

    /**
     * Danh sách Variants (bắt buộc phải có ít nhất 1 variant)
     * Mỗi variant có thể có:
     * - SKU (bắt buộc, phải unique)
     * - Variant name
     * - Price, salePrice
     * - Stock quantity
     * - Category, Concentration
     * - AttributeValues (để sync vào JSONB)
     */
    @Valid
    @NotNull(message = "Danh sách variants không được để trống")
    @Size(min = 1, message = "Phải có ít nhất 1 variant")
    @Builder.Default
    private List<ProductVariantCreateDTO> variants = new ArrayList<>();

    /**
     * Danh sách Images (optional)
     */
    @Valid
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();

    /**
     * DTO cho Variant trong Create Request
     * Bao gồm thông tin variant và attribute values
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantCreateDTO {
        
        /**
         * SKU (bắt buộc, phải unique)
         */
        @NotBlank(message = "SKU không được để trống")
        @Size(min = 3, max = 100, message = "SKU phải từ 3 đến 100 ký tự")
        private String sku;

        /**
         * Tên variant (bắt buộc)
         * Slug sẽ được tự động generate từ tên này
         */
        @NotBlank(message = "Tên variant không được để trống")
        @Size(max = 255, message = "Tên variant không được vượt quá 255 ký tự")
        private String variantName;

        /**
         * Giá bán (bắt buộc)
         */
        @NotNull(message = "Giá không được để trống")
        private java.math.BigDecimal price;

        /**
         * Giá khuyến mãi (optional)
         */
        private java.math.BigDecimal salePrice;

        /**
         * Số lượng tồn kho
         */
        @Builder.Default
        private Integer stockQuantity = 0;

        /**
         * Category ID (optional)
         */
        private Long categoryId;

        /**
         * Concentration ID (optional)
         */
        private Long concentrationId;

        /**
         * Danh sách Attribute Values cho variant này
         * Sẽ được sync vào:
         * 1. Bảng product_attributes (EAV)
         * 2. Cột cached_attributes (JSONB) của ProductVariant
         */
        @Valid
        @Builder.Default
        private List<ProductAttributeValueDTO> attributeValues = new ArrayList<>();

        // Các fields khác từ ProductVariantDTO (optional)
        private String barcode;
        private String currencyCode;
        private Integer lowStockThreshold;
        private Boolean isDefault;
        private String status;
        private Integer displayOrder;
    }
}

