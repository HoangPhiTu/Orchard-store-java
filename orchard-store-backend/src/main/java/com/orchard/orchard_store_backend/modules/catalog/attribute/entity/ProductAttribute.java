package com.orchard.orchard_store_backend.modules.catalog.attribute.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attribute_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attribute_key", nullable = false, unique = true, length = 100)
    private String attributeKey;

    @Column(name = "attribute_name", nullable = false, length = 255)
    private String attributeName;

    @Column(name = "attribute_name_en", length = 255)
    private String attributeNameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "attribute_type", nullable = false, length = 50)
    private AttributeType attributeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false, length = 50)
    @Builder.Default
    private AttributeDataType dataType = AttributeDataType.STRING;

    @Column(name = "is_filterable")
    @Builder.Default
    private Boolean filterable = Boolean.TRUE;

    @Column(name = "is_searchable")
    @Builder.Default
    private Boolean searchable = Boolean.FALSE;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean required = Boolean.FALSE;

    @Column(name = "is_variant_specific")
    @Builder.Default
    private Boolean variantSpecific = Boolean.FALSE;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "help_text", columnDefinition = "TEXT")
    private String helpText;

    @Column(name = "unit", length = 50)
    private String unit;

    /**
     * Phạm vi sử dụng của thuộc tính:
     * - PERFUME: Thuộc tính dùng cho Nước hoa
     * - COSMETICS: Thuộc tính dùng cho Mỹ phẩm
     * - COMMON: Dùng chung cho nhiều domain
     */
    @Column(name = "domain", length = 50)
    private String domain;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(
            mappedBy = "attribute",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<AttributeValue> values = new ArrayList<>();

    public enum AttributeType {
        SELECT,
        MULTISELECT,
        RANGE,
        BOOLEAN,
        TEXT
    }

    public enum AttributeDataType {
        STRING,
        NUMBER,
        DECIMAL,
        DATE,
        BOOLEAN
    }
}

