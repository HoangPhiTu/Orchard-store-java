package com.orchard.orchard_store_backend.modules.customer.entity;

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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String email;

    @Column(nullable = false, length = 20, unique = true)
    private String phone;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_vip_tier_id")
    private MemberPricingTier currentVipTier;

    @Column(name = "current_vip_tier_id", insertable = false, updatable = false)
    private Long currentVipTierId;

    @Column(name = "current_vip_tier_name", length = 100)
    private String currentVipTierName;

    @Column(name = "total_purchase_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "total_orders_count")
    @Builder.Default
    private Integer totalOrdersCount = 0;

    @Column(name = "total_orders_paid_count")
    @Builder.Default
    private Integer totalOrdersPaidCount = 0;

    @Column(name = "membership_points")
    @Builder.Default
    private Integer membershipPoints = 0;

    @Column(name = "available_points")
    @Builder.Default
    private Integer availablePoints = 0;

    @Column(name = "first_order_date")
    private LocalDateTime firstOrderDate;

    @Column(name = "last_order_date")
    private LocalDateTime lastOrderDate;

    @Column(name = "last_order_amount", precision = 15, scale = 2)
    private BigDecimal lastOrderAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> tags;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        BLOCKED
    }
}

