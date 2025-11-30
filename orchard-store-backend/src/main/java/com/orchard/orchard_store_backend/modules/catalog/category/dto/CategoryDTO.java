package com.orchard.orchard_store_backend.modules.catalog.category.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private Long id;

    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private String status;

    // Hierarchy fields
    private Long parentId;

    private String parentName; // Optional - tên của category cha

    private Integer level;

    private String path;

    /**
     * Children categories (for tree structure).
     * Ignored in JSON serialization to avoid circular reference issues.
     * Only populated when building tree structure, not in detail responses.
     * Note: Should always be null in detail responses, only populated for tree structure.
     */
    @JsonIgnore
    private List<CategoryDTO> children;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
