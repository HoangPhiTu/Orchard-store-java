package com.orchard.orchard_store_backend.modules.catalog.attribute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeValueDTO {
    private Long id;
    private Long productId;
    private Long productVariantId;
    private Long attributeId;
    private String attributeKey;
    private String attributeName;
    private Long attributeValueId;
    private String attributeValueDisplay;
    private String customValue;
    private Boolean primary;
    private Integer displayOrder;
}

