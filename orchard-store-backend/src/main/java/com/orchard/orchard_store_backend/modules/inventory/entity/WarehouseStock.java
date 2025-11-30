package com.orchard.orchard_store_backend.modules.inventory.entity;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_stock", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_variant_id", "warehouse_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;

    // Generated column: available_quantity = quantity - reserved_quantity
    // Note: Hibernate doesn't support GENERATED ALWAYS AS STORED directly,
    // so we use @Formula or calculate in service layer
    @Formula("quantity - reserved_quantity")
    private Integer availableQuantity;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

