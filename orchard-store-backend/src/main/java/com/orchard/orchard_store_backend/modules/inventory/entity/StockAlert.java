package com.orchard.orchard_store_backend.modules.inventory.entity;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 20)
    private AlertType alertType;

    @Column(name = "threshold_quantity")
    private Integer thresholdQuantity;

    @Column(name = "current_quantity")
    private Integer currentQuantity;

    @Column(name = "notified")
    @Builder.Default
    private Boolean notified = Boolean.FALSE;

    @Column(name = "resolved")
    @Builder.Default
    private Boolean resolved = Boolean.FALSE;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AlertType {
        LOW_STOCK,
        OUT_OF_STOCK,
        RESTOCKED
    }
}

