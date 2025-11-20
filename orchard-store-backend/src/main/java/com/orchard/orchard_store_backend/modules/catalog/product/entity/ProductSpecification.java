package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ProductSpecification - Thông số kỹ thuật
 * 
 * Note: Legacy entity - có thể dùng attributes thay thế
 * Giữ lại để backward compatibility hoặc cho các trường hợp đặc biệt
 */
@Entity
@Table(name = "product_specifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "specification_key", nullable = false, length = 100)
    private String specificationKey;

    @Column(name = "specification_value", nullable = false, columnDefinition = "TEXT")
    private String specificationValue;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

