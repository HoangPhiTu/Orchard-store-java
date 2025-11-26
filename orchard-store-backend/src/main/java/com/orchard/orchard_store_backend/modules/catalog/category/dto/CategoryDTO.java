package com.orchard.orchard_store_backend.modules.catalog.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Builder.Default
    private List<CategoryDTO> children = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
