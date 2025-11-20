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
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "member_pricing_tiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberPricingTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_name", nullable = false, unique = true, length = 100)
    private String tierName;

    @Column(name = "tier_display_name", length = 255)
    private String tierDisplayName;

    @Column(name = "tier_level", nullable = false)
    private Integer tierLevel;

    @Column(name = "min_purchase_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "min_points_required")
    @Builder.Default
    private Integer minPointsRequired = 0;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "card_color_code", length = 7)
    private String cardColorCode;

    @Column(name = "card_image_url", length = 500)
    private String cardImageUrl;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "benefits_description", columnDefinition = "TEXT")
    private String benefitsDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "benefits_json", columnDefinition = "jsonb")
    private Map<String, Object> benefitsJson;

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

