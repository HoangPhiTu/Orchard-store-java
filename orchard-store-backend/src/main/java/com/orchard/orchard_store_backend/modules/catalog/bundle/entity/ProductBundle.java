package com.orchard.orchard_store_backend.modules.catalog.bundle.entity;

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
@Table(name = "product_bundles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "bundle_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal bundlePrice;

    @Column(name = "original_total_price", precision = 15, scale = 2)
    private BigDecimal originalTotalPrice;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "bundle_type", length = 50, nullable = false)
    private BundleType bundleType;

    @Column(name = "is_customizable")
    @Builder.Default
    private Boolean isCustomizable = false;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BundleItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BundleType {
        CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET
    }

    public enum Status {
        ACTIVE, INACTIVE, EXPIRED
    }

    public void addItem(BundleItem item) {
        items.add(item);
        item.setBundle(this);
    }

    public void removeItem(BundleItem item) {
        items.remove(item);
        item.setBundle(null);
    }
}

