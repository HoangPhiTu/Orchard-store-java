package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Quan hệ giữa các sản phẩm để phục vụ cross-sell / up-sell.
 *
 * Một số kiểu quan hệ khuyến nghị cho domain Nước hoa & Mỹ phẩm:
 * - SAME_BRAND: Cùng thương hiệu
 * - SIMILAR_FRAGRANCE: Cùng nhóm hương / phong cách mùi
 * - FREQUENTLY_BOUGHT_TOGETHER: Hay được mua cùng nhau
 * - DECANT: Sản phẩm Chiết của chai gốc (hoặc ngược lại)
 *
 * Lưu ý:
 * - relationType hiện là String tự do, FE/BE nên chuẩn hoá theo các giá trị trên.
 * - Bảng này có thể dùng để link chai fullsize với các SKU chiết (DECANT) theo plan Perfume/Cosmetics.
 */
@Entity
@Table(name = "related_products", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "related_product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelatedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "related_product_id", nullable = false)
    private Product relatedProduct;

    @Column(name = "relation_type", length = 50)
    private String relationType; // SAME_BRAND, SIMILAR_FRAGRANCE, FREQUENTLY_BOUGHT_TOGETHER, DECANT

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

