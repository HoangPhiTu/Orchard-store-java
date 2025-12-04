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
 * DTO cho request cập nhật Product từ Admin Panel.
 * 
 * Tương tự ProductCreateRequestDTO nhưng có thể có một số fields optional hơn.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequestDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
    private String name;

    @NotNull(message = "Brand ID không được để trống")
    @Positive(message = "Brand ID phải là số dương")
    private Long brandId;

    private String status;

    @Valid
    @Builder.Default
    private List<ProductVariantUpdateDTO> variants = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantUpdateDTO {
        
        private Long id; // ID của variant nếu đang update variant cũ

        @NotBlank(message = "SKU không được để trống")
        @Size(min = 3, max = 100, message = "SKU phải từ 3 đến 100 ký tự")
        private String sku;

        @NotBlank(message = "Tên variant không được để trống")
        @Size(max = 255, message = "Tên variant không được vượt quá 255 ký tự")
        private String variantName;

        @NotNull(message = "Giá không được để trống")
        private java.math.BigDecimal price;

        private java.math.BigDecimal salePrice;

        @Builder.Default
        private Integer stockQuantity = 0;

        private Long categoryId;
        private Long concentrationId;

        @Valid
        @Builder.Default
        private List<ProductAttributeValueDTO> attributeValues = new ArrayList<>();

        private String barcode;
        private String currencyCode;
        private Integer lowStockThreshold;
        private Boolean isDefault;
        private String status;
        private Integer displayOrder;
        private String imageUrl;
    }
}

