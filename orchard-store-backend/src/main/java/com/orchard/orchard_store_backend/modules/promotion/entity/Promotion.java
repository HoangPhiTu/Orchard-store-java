package com.orchard.orchard_store_backend.modules.promotion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Discount type
    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y

    @Column(name = "discount_value", precision = 15, scale = 2)
    private BigDecimal discountValue;

    // Conditions
    @Column(name = "min_purchase_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision = 15, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "applicable_to", length = 50)
    private String applicableTo; // ALL, SPECIFIC_PRODUCTS, SPECIFIC_CATEGORIES, SPECIFIC_BRANDS

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "applicable_products", columnDefinition = "jsonb")
    private List<Long> applicableProducts; // Array of product IDs

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "applicable_categories", columnDefinition = "jsonb")
    private List<Long> applicableCategories; // Array of category IDs

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "applicable_brands", columnDefinition = "jsonb")
    private List<Long> applicableBrands; // Array of brand IDs

    // Time
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    // Usage
    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    @Column(name = "usage_limit_per_user", nullable = false)
    @Builder.Default
    private Integer usageLimitPerUser = 1;

    // Status
    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

