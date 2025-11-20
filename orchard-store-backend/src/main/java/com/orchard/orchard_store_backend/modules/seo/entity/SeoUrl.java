package com.orchard.orchard_store_backend.modules.seo.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "seo_urls", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"old_url"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeoUrl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // URL mapping
    @Column(name = "old_url", nullable = false, length = 500)
    private String oldUrl; // URL cũ (cần redirect)

    @Column(name = "new_url", nullable = false, length = 500)
    private String newUrl; // URL mới

    @Column(name = "canonical_url", length = 500)
    private String canonicalUrl; // Canonical URL

    // Redirect type
    @Column(name = "redirect_type", length = 20)
    @Builder.Default
    private String redirectType = "301"; // 301 (Permanent), 302 (Temporary)

    // Entity reference
    @Column(name = "entity_type", length = 50)
    private String entityType; // PRODUCT, CATEGORY, BRAND, PAGE

    @Column(name = "entity_id")
    private Long entityId; // ID của product, category, etc.

    // Status
    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "redirect_count", nullable = false)
    @Builder.Default
    private Integer redirectCount = 0; // Số lần redirect

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

