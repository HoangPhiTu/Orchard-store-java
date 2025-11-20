package com.orchard.orchard_store_backend.modules.catalog.attribute.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attribute_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_type_id", nullable = false)
    private ProductAttribute attribute;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(name = "display_value", nullable = false, length = 255)
    private String displayValue;

    @Column(name = "display_value_en", length = 255)
    private String displayValueEn;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "hex_color", length = 7)
    private String hexColor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = Boolean.FALSE;

    @Column(name = "search_keywords", columnDefinition = "TEXT")
    private String searchKeywords;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

