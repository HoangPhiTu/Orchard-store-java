package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;

import java.util.List;

public interface ProductAttributeValueService {
    List<ProductAttributeValueDTO> getAttributesForProduct(Long productId);
    List<ProductAttributeValueDTO> saveAttributesForProduct(Long productId, List<ProductAttributeValueDTO> values);
}

