package com.orchard.orchard_store_backend.modules.catalog.analytics.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.order.entity.Order;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_views")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", length = 255)
    private String sessionId; // Cho guest users

    // View details
    @Column(name = "view_duration_seconds")
    private Integer viewDurationSeconds; // Thời gian xem (giây)

    @Column(name = "viewed_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime viewedAt;

    // Source tracking
    @Column(name = "referrer_url", length = 500)
    private String referrerUrl; // URL nguồn

    @Column(name = "utm_source", length = 100)
    private String utmSource; // UTM parameters

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 100)
    private String utmCampaign;

    // Device info
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    // Conversion tracking
    @Column(name = "added_to_cart")
    @Builder.Default
    private Boolean addedToCart = false;

    @Column(name = "added_to_cart_at")
    private LocalDateTime addedToCartAt;

    @Column(name = "purchased")
    @Builder.Default
    private Boolean purchased = false;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
}

