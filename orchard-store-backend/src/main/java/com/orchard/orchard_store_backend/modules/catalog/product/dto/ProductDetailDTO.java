package com.orchard.orchard_store_backend.modules.catalog.product.dto;

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

/**
 * DTO for Product Detail Page
 * Contains full product information including variants, images, and SEO info
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDTO {

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
     * List of product variants with full details including cachedAttributes
     */
    @Valid
    @Builder.Default
    private List<ProductVariantDTO> variants = new ArrayList<>();

    /**
     * List of product images
     */
    @Valid
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();

    /**
     * List of SEO URLs for redirects
     */
    @Valid
    @Builder.Default
    private List<ProductSeoUrlDTO> seoUrls = new ArrayList<>();

    /**
     * Total stock quantity across all variants
     * Calculated automatically via @AfterMapping
     */
    private Integer totalStock;

    /**
     * Price range string (e.g., "1,000,000 - 2,000,000 VND")
     * Calculated automatically via @AfterMapping
     */
    private String priceRange;

    /**
     * Minimum price across all variants
     * Calculated automatically via @AfterMapping
     */
    private BigDecimal minPrice;

    /**
     * Maximum price across all variants
     * Calculated automatically via @AfterMapping
     */
    private BigDecimal maxPrice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

