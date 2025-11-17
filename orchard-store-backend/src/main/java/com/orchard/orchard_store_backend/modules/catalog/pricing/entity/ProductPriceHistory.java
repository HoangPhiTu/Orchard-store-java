package com.orchard.orchard_store_backend.modules.catalog.pricing.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_price_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    // Price details
    @Column(name = "price", precision = 15, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "member_price", precision = 15, scale = 2)
    private BigDecimal memberPrice;

    // Change tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "price_change_type", length = 20)
    private PriceChangeType priceChangeType;

    @Column(name = "previous_price", precision = 15, scale = 2)
    private BigDecimal previousPrice;

    @Column(name = "change_amount", precision = 15, scale = 2)
    private BigDecimal changeAmount;

    @Column(name = "change_percentage", precision = 5, scale = 2)
    private BigDecimal changePercentage;

    // Promotion info
    @Column(name = "promotion_id")
    private Long promotionId;

    @Column(name = "promotion_name", length = 255)
    private String promotionName;

    // Validity
    @Column(name = "effective_from", nullable = false)
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    // Audit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum PriceChangeType {
        INCREASE, DECREASE, PROMOTION, REGULAR
    }
}

