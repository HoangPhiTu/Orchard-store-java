package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;

import java.util.List;
import java.util.Map;

public interface CategoryAttributeService {
    List<CategoryAttributeDTO> getAttributesByCategory(Long categoryId);
    CategoryAttributeDTO assignAttributeToCategory(CategoryAttributeDTO dto);
    void removeAttributeFromCategory(Long categoryId, Long attributeId);
    CategoryAttributeDTO updateCategoryAttributeMetadata(Long categoryId, Long attributeId, CategoryAttributeDTO dto);
    
    /**
     * Lấy danh sách attributes cho Product Form
     * - Chỉ trả về Product Attributes (is_variant_specific = false)
     * - Group theo group_name (fallback to domain nếu NULL)
     * - Sort theo display_order trong mỗi group
     * - Include attribute values
     */
    Map<String, List<ProductAttributeDTO>> getAttributesForProduct(Long categoryId);

    /**
     * Lấy danh sách Variant Attributes (is_variant_specific = true)
     * để phục vụ Variant Generator.
     */
    List<ProductAttributeDTO> getVariantAttributesForCategory(Long categoryId);
}

