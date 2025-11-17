package com.orchard.orchard_store_backend.modules.catalog.bundle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBundleDTO {

    private Long id;

    @NotBlank(message = "Tên gói sản phẩm không được để trống")
    @Size(max = 255, message = "Tên gói sản phẩm không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ (chỉ chấp nhận chữ thường, số và dấu gạch ngang)")
    private String slug;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @NotNull(message = "Giá gói không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá gói phải > 0")
    @Digits(integer = 13, fraction = 2, message = "Giá gói không hợp lệ (tối đa 13 chữ số, 2 chữ số thập phân)")
    private BigDecimal bundlePrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tổng giá gốc phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Tổng giá gốc không hợp lệ")
    private BigDecimal originalTotalPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền giảm phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Số tiền giảm không hợp lệ")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0.0", inclusive = true, message = "Phần trăm giảm giá phải >= 0")
    @DecimalMax(value = "100.0", inclusive = true, message = "Phần trăm giảm giá phải <= 100")
    @Digits(integer = 3, fraction = 2, message = "Phần trăm giảm giá không hợp lệ")
    private BigDecimal discountPercentage;

    @NotBlank(message = "Loại gói không được để trống")
    @Pattern(regexp = "^(CURATED_SET|GIFT_PACKAGE|COMBO_DEAL|SEASONAL_SET)$",
            message = "Loại gói không hợp lệ (CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET)")
    private String bundleType;

    private Boolean isCustomizable;

    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    private String imageUrl;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    private Integer displayOrder;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|EXPIRED)$",
            message = "Trạng thái không hợp lệ (ACTIVE, INACTIVE, EXPIRED)")
    private String status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Valid
    @Builder.Default
    private List<BundleItemDTO> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

