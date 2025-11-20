package com.orchard.orchard_store_backend.modules.customer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_lifetime_value")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerLifetimeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "total_purchase_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPurchaseAmount;

    @Column(name = "total_orders_count", nullable = false)
    private Integer totalOrdersCount;

    @Column(name = "total_orders_paid_count", nullable = false)
    private Integer totalOrdersPaidCount;

    @Column(name = "vip_tier_id")
    private Long vipTierId;

    @Column(name = "vip_tier_name", length = 100)
    private String vipTierName;

    @Column(name = "calculated_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime calculatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", length = 20)
    @Builder.Default
    private PeriodType periodType = PeriodType.SNAPSHOT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum PeriodType {
        SNAPSHOT,
        DAILY,
        MONTHLY,
        YEARLY
    }
}

