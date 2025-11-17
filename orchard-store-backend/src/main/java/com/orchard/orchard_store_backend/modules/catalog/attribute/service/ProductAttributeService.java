package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;

import java.util.List;

public interface ProductAttributeService {
    List<ProductAttributeDTO> getAllAttributes();
    ProductAttributeDTO getAttribute(Long id);
    ProductAttributeDTO createAttribute(ProductAttributeDTO dto);
    ProductAttributeDTO updateAttribute(Long id, ProductAttributeDTO dto);
    void deleteAttribute(Long id);
    List<AttributeValueDTO> getAttributeValues(Long attributeId);
    AttributeValueDTO createAttributeValue(Long attributeId, AttributeValueDTO dto);
    AttributeValueDTO updateAttributeValue(Long attributeId, Long valueId, AttributeValueDTO dto);
    void deleteAttributeValue(Long attributeId, Long valueId);
}

