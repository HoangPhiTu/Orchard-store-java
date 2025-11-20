package com.orchard.orchard_store_backend.modules.order.entity;

import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.entity.MemberPricingTier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    // Customer link
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "customer_id", insertable = false, updatable = false)
    private Long customerId;

    // Customer info (kept for historical data)
    @Column(name = "customer_name", nullable = false, length = 255)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    // Email Verification (Enhanced với Rate Limiting)
    // Note: verification_code không unique (có thể trùng nếu nhiều đơn hàng cùng lúc)
    // Tìm kiếm bằng verification_code + customer_email
    @Column(name = "verification_code", nullable = false, length = 10)
    private String verificationCode;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "verification_attempts")
    @Builder.Default
    private Integer verificationAttempts = 0;

    // Rate Limiting cho Verification Code
    @Column(name = "verification_sent_count")
    @Builder.Default
    private Integer verificationSentCount = 0;

    @Column(name = "verification_last_sent_at")
    private LocalDateTime verificationLastSentAt;

    @Column(name = "verification_sent_limit")
    @Builder.Default
    private Integer verificationSentLimit = 5;

    @Column(name = "verification_blocked_until")
    private LocalDateTime verificationBlockedUntil;

    // Shipping address
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "shipping_city", length = 100)
    private String shippingCity;

    @Column(name = "shipping_district", length = 100)
    private String shippingDistrict;

    @Column(name = "shipping_ward", length = 100)
    private String shippingWard;

    @Column(name = "shipping_postal_code", length = 20)
    private String shippingPostalCode;

    // Pricing
    @Column(name = "subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_fee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "vip_discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal vipDiscountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    // VIP Tier at time of order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_vip_tier_id")
    private MemberPricingTier customerVipTier;

    @Column(name = "customer_vip_tier_id", insertable = false, updatable = false)
    private Long customerVipTierId;

    @Column(name = "customer_vip_tier_name", length = 100)
    private String customerVipTierName;

    @Column(name = "vip_discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal vipDiscountPercentage = BigDecimal.ZERO;

    // Payment
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private String paymentStatus = "PENDING";

    @Column(name = "payment_transaction_id", length = 255)
    private String paymentTransactionId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Shipping
    @Column(name = "shipping_method", length = 100)
    private String shippingMethod;

    @Column(name = "shipping_status", length = 20)
    @Builder.Default
    private String shippingStatus = "PENDING";

    @Column(name = "tracking_number", length = 255)
    private String trackingNumber;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    // Order status
    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Promotion
    @Column(name = "promotion_code", length = 50)
    private String promotionCode;

    @Column(name = "promotion_id")
    private Long promotionId;

    // Lifetime value impact
    @Column(name = "counted_towards_lifetime_value")
    @Builder.Default
    private Boolean countedTowardsLifetimeValue = false;

    @Column(name = "counted_at")
    private LocalDateTime countedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
}

