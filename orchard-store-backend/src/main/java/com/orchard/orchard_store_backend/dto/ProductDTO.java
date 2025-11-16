package com.orchard.orchard_store_backend.dto;

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
public class ProductDTO {
    
    private Long id;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
    private String name;
    
    @NotBlank(message = "Slug không được để trống")
    @Size(min = 2, max = 255, message = "Slug phải từ 2 đến 255 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", 
             message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String slug;
    
    @Size(max = 10000, message = "Mô tả không được vượt quá 10000 ký tự")
    private String description;
    
    @Size(max = 500, message = "Mô tả ngắn không được vượt quá 500 ký tự")
    private String shortDescription;
    
    @Size(max = 50000, message = "Nội dung không được vượt quá 50000 ký tự")
    private String content;
    
    // Brand & Category
    @NotNull(message = "Brand ID không được để trống")
    @Positive(message = "Brand ID phải là số dương")
    private Long brandId;
    
    private String brandName;
    
    @NotNull(message = "Category ID không được để trống")
    @Positive(message = "Category ID phải là số dương")
    private Long categoryId;
    
    private String categoryName;
    
    // Pricing
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá gốc phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá gốc không hợp lệ (tối đa 13 chữ số, 2 chữ số thập phân)")
    private BigDecimal basePrice;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá khuyến mãi phải >= 0")
    @Digits(integer = 13, fraction = 2, message = "Giá khuyến mãi không hợp lệ (tối đa 13 chữ số, 2 chữ số thập phân)")
    private BigDecimal salePrice;
    
    // SEO
    @Size(max = 255, message = "Meta title không được vượt quá 255 ký tự")
    private String metaTitle;
    
    @Size(max = 500, message = "Meta description không được vượt quá 500 ký tự")
    private String metaDescription;
    
    @Size(max = 500, message = "Meta keywords không được vượt quá 500 ký tự")
    private String metaKeywords;
    
    // Statistics (read-only, không validate khi tạo mới)
    private Integer viewCount;
    private Integer soldCount;
    private BigDecimal ratingAverage;
    private Integer ratingCount;
    
    // Display flags
    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;
    
    private Boolean isFeatured;
    private Boolean isNew;
    private Boolean isBestseller;
    
    // Status
    @Pattern(regexp = "^(ACTIVE|INACTIVE|DRAFT|ARCHIVED)$", 
             message = "Status phải là ACTIVE, INACTIVE, DRAFT hoặc ARCHIVED")
    private String status;
    
    // Images & Variants
    @Valid
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();
    
    @Valid
    @Builder.Default
    private List<ProductVariantDTO> variants = new ArrayList<>();
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

