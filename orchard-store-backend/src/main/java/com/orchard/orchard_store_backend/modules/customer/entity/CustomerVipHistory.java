package com.orchard.orchard_store_backend.modules.customer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_vip_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerVipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "old_tier_id")
    private Long oldTierId;

    @Column(name = "old_tier_name", length = 100)
    private String oldTierName;

    @Column(name = "new_tier_id", nullable = false)
    private Long newTierId;

    @Column(name = "new_tier_name", nullable = false, length = 100)
    private String newTierName;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", length = 50, nullable = false)
    @Builder.Default
    private TriggerType triggerType = TriggerType.PURCHASE_AMOUNT;

    @Column(name = "trigger_value", precision = 15, scale = 2)
    private java.math.BigDecimal triggerValue;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "changed_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime changedAt;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    public enum TriggerType {
        PURCHASE_AMOUNT,
        MANUAL_UPGRADE,
        PROMOTION,
        ADMIN_ADJUSTMENT
    }
}

