package com.orchard.orchard_store_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(length = 100, unique = true)
    private String sku;
    
    @Column(name = "variant_name", length = 255)
    private String variantName;
    
    // Pricing
    @Column(name = "price", precision = 15, scale = 2, nullable = false)
    private BigDecimal price;
    
    @Column(name = "sale_price", precision = 15, scale = 2)
    private BigDecimal salePrice;
    
    @Column(name = "cost_price", precision = 15, scale = 2)
    private BigDecimal costPrice;
    
    // Inventory
    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;
    
    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;
    
    @Column(name = "available_quantity")
    @Builder.Default
    private Integer availableQuantity = 0;
    
    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;
    
    // Weight & Dimensions
    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;
    
    @Column(name = "length", precision = 10, scale = 2)
    private BigDecimal length;
    
    @Column(name = "width", precision = 10, scale = 2)
    private BigDecimal width;
    
    @Column(name = "height", precision = 10, scale = 2)
    private BigDecimal height;
    
    // Display
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum Status {
        ACTIVE, INACTIVE, OUT_OF_STOCK
    }
    
    // Helper method to calculate available quantity
    @PrePersist
    @PreUpdate
    public void calculateAvailableQuantity() {
        this.availableQuantity = Math.max(0, this.stockQuantity - this.reservedQuantity);
    }
}

