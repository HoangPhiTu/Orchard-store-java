package com.orchard.orchard_store_backend.modules.inventory.entity;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pre_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "customer_name", nullable = false, length = 255)
    private String customerName;

    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "expected_restock_date")
    private LocalDate expectedRestockDate;

    @Column(name = "notification_sent")
    @Builder.Default
    private Boolean notificationSent = Boolean.FALSE;

    @Column(name = "notification_sent_at")
    private LocalDateTime notificationSentAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private PreOrderStatus status = PreOrderStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "converted_order_id")
    private Long convertedOrderId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PreOrderStatus {
        PENDING,
        NOTIFIED,
        CONVERTED,
        CANCELLED
    }
}

