package com.orchard.orchard_store_backend.modules.catalog.analytics.entity;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_conversion_tracking", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductConversionTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Metrics (calculated daily)
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Builder.Default
    private Integer views = 0;

    @Column(name = "unique_views", nullable = false)
    @Builder.Default
    private Integer uniqueViews = 0;

    @Column(name = "add_to_carts", nullable = false)
    @Builder.Default
    private Integer addToCarts = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer purchases = 0;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    // Conversion rates
    @Column(name = "view_to_cart_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal viewToCartRate = BigDecimal.ZERO; // % views -> cart

    @Column(name = "cart_to_purchase_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cartToPurchaseRate = BigDecimal.ZERO; // % cart -> purchase

    @Column(name = "view_to_purchase_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal viewToPurchaseRate = BigDecimal.ZERO; // % views -> purchase

    // Average values
    @Column(name = "avg_view_duration", nullable = false)
    @Builder.Default
    private Integer avgViewDuration = 0; // Giây

    @Column(name = "avg_order_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal avgOrderValue = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

