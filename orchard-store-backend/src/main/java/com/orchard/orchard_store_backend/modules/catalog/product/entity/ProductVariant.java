package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import jakarta.persistence.*;
import jakarta.persistence.Index;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_variants_cached_attributes_gin", columnList = "cached_attributes")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"product", "category", "concentration", "createdBy", "updatedBy", "images"})
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "variant_name", nullable = false, length = 255)
    private String variantName;

    @Column(nullable = false, length = 255, unique = true)
    private String slug;

    @Column(name = "concentration_code", length = 20)
    private String concentrationCode;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concentration_id")
    private Concentration concentration;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "cost_price", precision = 15, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "currency_code", length = 3)
    @Builder.Default
    private String currencyCode = "VND";

    @Column(name = "tax_class_id")
    private Long taxClassId;

    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(name = "manage_inventory")
    @Builder.Default
    private Boolean manageInventory = Boolean.TRUE;

    @Column(name = "allow_backorder")
    @Builder.Default
    private Boolean allowBackorder = Boolean.FALSE;

    @Column(name = "allow_out_of_stock_purchase")
    @Builder.Default
    private Boolean allowOutOfStockPurchase = Boolean.FALSE;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", length = 20)
    @Builder.Default
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    @Column(name = "volume_ml")
    private Integer volumeMl;

    @Column(name = "volume_unit", length = 10)
    @Builder.Default
    private String volumeUnit = "ml";

    @Column(name = "weight_grams", precision = 8, scale = 2)
    private BigDecimal weightGrams;

    @Column(name = "weight_unit", length = 10)
    @Builder.Default
    private String weightUnit = "g";

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "available_from")
    @Builder.Default
    private LocalDateTime availableFrom = LocalDateTime.now();

    @Column(name = "available_to")
    private LocalDateTime availableTo;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = Boolean.FALSE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    /**
     * Cached JSONB representation of product attributes for fast filtering.
     * Structure: { "attribute_key": { "value": "...", "display": "...", "type": "...", "dataType": "...", "numericValue": ... } }
     * Auto-synced from product_attributes table via database trigger.
     * 
     * Using Hypersistence Utils JsonType for better JSONB support in Hibernate 6.3
     */
    @Type(JsonType.class)
    @Column(name = "cached_attributes", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> cachedAttributes = new HashMap<>();

    public enum StockStatus {
        IN_STOCK,
        OUT_OF_STOCK,
        LOW_STOCK,
        BACKORDER
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        DISCONTINUED
    }

    @Transient
    public int getAvailableQuantity() {
        int stock = stockQuantity != null ? stockQuantity : 0;
        int reserved = reservedQuantity != null ? reservedQuantity : 0;
        return stock - reserved;
    }

    public void recalculateStockStatus() {
        int available = getAvailableQuantity();
        if (available <= 0) {
            if (Boolean.TRUE.equals(allowBackorder) || Boolean.TRUE.equals(allowOutOfStockPurchase)) {
                this.stockStatus = StockStatus.BACKORDER;
            } else {
                this.stockStatus = StockStatus.OUT_OF_STOCK;
            }
        } else if (available <= (lowStockThreshold != null ? lowStockThreshold : 0)) {
            this.stockStatus = StockStatus.LOW_STOCK;
        } else {
            this.stockStatus = StockStatus.IN_STOCK;
        }
    }
}




