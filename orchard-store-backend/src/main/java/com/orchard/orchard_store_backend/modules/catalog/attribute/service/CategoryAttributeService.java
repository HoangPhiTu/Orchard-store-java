package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;

import java.util.List;

public interface CategoryAttributeService {
    List<CategoryAttributeDTO> getAttributesByCategory(Long categoryId);
    CategoryAttributeDTO assignAttributeToCategory(CategoryAttributeDTO dto);
    void removeAttributeFromCategory(Long categoryId, Long attributeId);
}

