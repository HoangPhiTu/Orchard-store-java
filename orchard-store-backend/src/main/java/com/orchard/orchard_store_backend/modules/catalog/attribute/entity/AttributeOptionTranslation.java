package com.orchard.orchard_store_backend.modules.catalog.attribute.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attribute_option_translations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attribute_option_id", "locale"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeOptionTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attribute_option_id", nullable = false)
    private AttributeValue attributeOption;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String locale = "vi-VN";

    @Column(name = "display_value", nullable = false, length = 255)
    private String displayValue;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

