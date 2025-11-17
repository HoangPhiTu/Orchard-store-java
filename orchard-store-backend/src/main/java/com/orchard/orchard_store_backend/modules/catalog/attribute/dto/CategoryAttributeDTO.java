package com.orchard.orchard_store_backend.modules.catalog.attribute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAttributeDTO {
    private Long id;
    private Long categoryId;
    private Long attributeId;
    private String attributeName;
    private String attributeKey;
    private Boolean required;
    private Integer displayOrder;
}

