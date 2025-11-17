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

    @Size(max = 255, message = "Tên biến thể không được vượt quá 255 ký tự")
    private String variantName;

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

    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity;

    @Min(value = 0, message = "Số lượng đã đặt phải >= 0")
    private Integer reservedQuantity;

    private Integer availableQuantity;

    @Min(value = 0, message = "Ngưỡng tồn kho thấp phải >= 0")
    @Max(value = 10000, message = "Ngưỡng tồn kho thấp phải <= 10000")
    private Integer lowStockThreshold;

    // Stock status calculated from availableQuantity and lowStockThreshold
    // IN_STOCK: availableQuantity > lowStockThreshold
    // LOW_STOCK: 0 < availableQuantity <= lowStockThreshold
    // OUT_OF_STOCK: availableQuantity == 0
    private String stockStatus;

    @DecimalMin(value = "0.0", inclusive = true, message = "Trọng lượng phải >= 0")
    @Digits(integer = 10, fraction = 2, message = "Trọng lượng không hợp lệ")
    private BigDecimal weight;

    @DecimalMin(value = "0.0", inclusive = true, message = "Chiều dài phải >= 0")
    @Digits(integer = 10, fraction = 2, message = "Chiều dài không hợp lệ")
    private BigDecimal length;

    @DecimalMin(value = "0.0", inclusive = true, message = "Chiều rộng phải >= 0")
    @Digits(integer = 10, fraction = 2, message = "Chiều rộng không hợp lệ")
    private BigDecimal width;

    @DecimalMin(value = "0.0", inclusive = true, message = "Chiều cao phải >= 0")
    @Digits(integer = 10, fraction = 2, message = "Chiều cao không hợp lệ")
    private BigDecimal height;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;

    private Boolean isDefault;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|OUT_OF_STOCK)$",
            message = "Status phải là ACTIVE, INACTIVE hoặc OUT_OF_STOCK")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

