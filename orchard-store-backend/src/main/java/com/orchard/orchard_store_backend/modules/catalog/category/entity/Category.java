package com.orchard.orchard_store_backend.modules.catalog.category.entity;

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
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    // Hierarchy fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(name = "parent_id", insertable = false, updatable = false)
    private Long parentId;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 0;

    @Column(length = 500)
    private String path; // e.g., "1/5/10" for easy querying

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        ACTIVE, INACTIVE
    }
}
