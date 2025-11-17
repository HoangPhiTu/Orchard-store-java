package com.orchard.orchard_store_backend.modules.catalog.pricing.dto;

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
public class ProductPriceHistoryDTO {

    private Long id;

    @NotNull(message = "Product Variant ID không được để trống")
    @Positive(message = "Product Variant ID phải là số dương")
    private Long productVariantId;

    private String productVariantName;
    private String productVariantSku;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải > 0")
    @Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá khuyến mãi phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá khuyến mãi không hợp lệ")
    private BigDecimal salePrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thành viên phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá thành viên không hợp lệ")
    private BigDecimal memberPrice;

    @Pattern(regexp = "^(INCREASE|DECREASE|PROMOTION|REGULAR)$",
            message = "Loại thay đổi giá phải là INCREASE, DECREASE, PROMOTION hoặc REGULAR")
    private String priceChangeType;

    @Digits(integer = 13, fraction = 2, message = "Giá trước đó không hợp lệ")
    private BigDecimal previousPrice;

    @Digits(integer = 13, fraction = 2, message = "Số tiền thay đổi không hợp lệ")
    private BigDecimal changeAmount;

    @Digits(integer = 5, fraction = 2, message = "Phần trăm thay đổi không hợp lệ")
    private BigDecimal changePercentage;

    private Long promotionId;
    private String promotionName;

    @NotNull(message = "Ngày hiệu lực từ không được để trống")
    private LocalDateTime effectiveFrom;

    private LocalDateTime effectiveTo;

    private Long changedById;
    private String changedByName;

    private LocalDateTime createdAt;
}

