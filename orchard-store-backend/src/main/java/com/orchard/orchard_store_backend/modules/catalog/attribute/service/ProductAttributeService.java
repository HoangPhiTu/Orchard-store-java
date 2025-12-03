package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductAttributeService {
    /**
     * Lấy danh sách attributes có phân trang và tìm kiếm (dành cho admin)
     * @param keyword Từ khóa tìm kiếm theo tên / key (optional)
     * @param status Trạng thái (ACTIVE / INACTIVE / ALL) (optional)
     * @param domain Phạm vi sử dụng thuộc tính (PERFUME / COSMETICS / COMMON / ALL) (optional)
     */
    Page<ProductAttributeDTO> getAttributes(String keyword, String status, String domain, Pageable pageable);
    
    /**
     * Lấy tất cả attributes (không phân trang - dành cho dropdown)
     */
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

