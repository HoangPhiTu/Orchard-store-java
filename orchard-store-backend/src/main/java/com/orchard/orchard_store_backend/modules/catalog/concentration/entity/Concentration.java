package com.orchard.orchard_store_backend.modules.catalog.concentration.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "concentrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Concentration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String acronym;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(name = "min_oil_percentage")
    private Integer minOilPercentage;

    @Column(name = "max_oil_percentage")
    private Integer maxOilPercentage;

    @Column(length = 100)
    private String longevity;

    @Column(name = "intensity_level")
    @Builder.Default
    private Integer intensityLevel = 1;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

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

    /**
     * Virtual attribute: Display name kết hợp name và acronym
     * Format: {name} ({acronym})
     * Ví dụ: "Eau de Toilette (EDT)"
     * 
     * Xử lý ngoại lệ:
     * - Nếu acronym rỗng hoặc null -> chỉ trả về name
     * - Nếu acronym giống hệt name -> chỉ trả về name (tránh "Parfum (Parfum)")
     */
    @Transient
    public String getDisplayName() {
        if (acronym == null || acronym.trim().isEmpty()) {
            return name;
        }
        
        // Kiểm tra nếu acronym giống hệt name (case-insensitive)
        if (acronym.trim().equalsIgnoreCase(name.trim())) {
            return name;
        }
        
        return name + " (" + acronym.trim() + ")";
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}

