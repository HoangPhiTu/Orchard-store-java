package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDTO {

    private Long id;
    private Long productId;

    @NotBlank(message = "SKU không được để trống")
    @Size(min = 3, max = 100, message = "SKU phải từ 3 đến 100 ký tự")
    @Pattern(regexp = "^[A-Z0-9-]+$",
            message = "SKU chỉ được chứa chữ in hoa, số và dấu gạch ngang")
    private String sku;

    @NotBlank(message = "Tên biến thể không được để trống")
    @Size(max = 255, message = "Tên biến thể không được vượt quá 255 ký tự")
    private String variantName;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    private String slug;

    @Size(max = 20, message = "Mã nồng độ không được vượt quá 20 ký tự")
    private String concentrationCode;

    private Long concentrationId;
    private String concentrationName;

    private Long categoryId;
    private String categoryName;

    @Size(max = 100, message = "Barcode không được vượt quá 100 ký tự")
    private String barcode;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải > 0")
    @Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ (tối đa 13 chữ số, 2 chữ số thập phân)")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá khuyến mãi phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá khuyến mãi không hợp lệ")
    private BigDecimal salePrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá vốn phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá vốn không hợp lệ")
    private BigDecimal costPrice;

    @Size(max = 3, message = "Mã tiền tệ không được vượt quá 3 ký tự")
    private String currencyCode;

    private Long taxClassId;

    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity;

    @Min(value = 0, message = "Số lượng đã đặt phải >= 0")
    private Integer reservedQuantity;

    @Min(value = 0, message = "Ngưỡng tồn kho thấp phải >= 0")
    @Max(value = 10000, message = "Ngưỡng tồn kho thấp phải <= 10000")
    private Integer lowStockThreshold;

    private String stockStatus;

    private Boolean manageInventory;
    private Boolean allowBackorder;
    private Boolean allowOutOfStockPurchase;

    private Integer volumeMl;

    @Size(max = 10, message = "Đơn vị thể tích không được vượt quá 10 ký tự")
    private String volumeUnit;

    @Digits(integer = 8, fraction = 2, message = "Khối lượng không hợp lệ")
    private BigDecimal weightGrams;

    @Size(max = 10, message = "Đơn vị khối lượng không được vượt quá 10 ký tự")
    private String weightUnit;

    @Size(max = 2000, message = "Mô tả ngắn không được vượt quá 2000 ký tự")
    private String shortDescription;

    @Size(max = 50000, message = "Mô tả chi tiết không được vượt quá 50000 ký tự")
    private String fullDescription;

    @Size(max = 255, message = "Meta title không được vượt quá 255 ký tự")
    private String metaTitle;

    @Size(max = 500, message = "Meta description không được vượt quá 500 ký tự")
    private String metaDescription;

    private LocalDateTime availableFrom;
    private LocalDateTime availableTo;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;

    private Boolean isDefault;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|DISCONTINUED)$",
            message = "Status phải là ACTIVE, INACTIVE hoặc DISCONTINUED")
    private String status;

    private Integer viewCount;
    private Integer soldCount;

    /**
     * Cached JSONB attributes for fast filtering
     * Structure: { "attribute_key": { "value": "...", "display": "...", "type": "...", "dataType": "...", "numericValue": ... } }
     * Note: This field does NOT contain ProductDTO to avoid circular reference
     */
    private java.util.Map<String, Object> cachedAttributes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Ảnh riêng cho từng variant (dùng cho Mỹ phẩm / Swatch màu).
     * Nếu null, FE có thể fallback về ảnh chính của Product.
     */
    @Size(max = 500, message = "URL ảnh biến thể không được vượt quá 500 ký tự")
    private String imageUrl;
}

