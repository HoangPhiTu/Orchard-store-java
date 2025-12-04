package com.orchard.orchard_store_backend.modules.catalog.attribute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeDTO {
    private Long id;
    private String attributeKey;
    private String attributeName;
    private String attributeNameEn;
    private String attributeType;
    private String dataType;
    private Boolean filterable;
    private Boolean searchable;
    private Boolean required;
    private Boolean variantSpecific;
    private Integer displayOrder;
    private String iconClass;
    private String colorCode;
    private String validationRules;
    private String description;
    private String helpText;
    private String unit;
    /**
     * Phạm vi sử dụng của thuộc tính (PERFUME, COSMETICS, COMMON, ...)
     */
    private String domain;
    private String status;
    private List<AttributeValueDTO> values;
    /**
     * Tên nhóm để group attributes khi hiển thị trong Product Form
     * Nếu NULL, sẽ group theo domain
     */
    private String groupName;
}

