package com.orchard.orchard_store_backend.modules.catalog.pricing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate; // Tax rate (0-100)

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

