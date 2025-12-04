package com.orchard.orchard_store_backend.modules.catalog.attribute.entity;

import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "category_attributes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "attribute_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private ProductAttribute attribute;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean required = Boolean.FALSE;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "group_name", length = 100)
    private String groupName;
}

