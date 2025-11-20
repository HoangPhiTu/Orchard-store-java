package com.orchard.orchard_store_backend.modules.seo.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "url_slugs_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlSlugHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // PRODUCT, CATEGORY, BRAND

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "old_slug", nullable = false, length = 255)
    private String oldSlug;

    @Column(name = "new_slug", nullable = false, length = 255)
    private String newSlug;

    @Column(name = "changed_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime changedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;
}

