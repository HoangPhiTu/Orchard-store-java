package com.orchard.orchard_store_backend.modules.catalog.attribute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueDTO {
    private Long id;
    private Long attributeId;
    private String value;
    private String displayValue;
    private String displayValueEn;
    private String colorCode;
    private String imageUrl;
    private String hexColor;
    private String description;
    private Integer displayOrder;
    private Boolean isDefault;
    private String searchKeywords;
}

