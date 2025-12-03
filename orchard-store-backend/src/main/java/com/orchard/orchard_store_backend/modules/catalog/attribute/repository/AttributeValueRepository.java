package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {
    List<AttributeValue> findByAttributeId(Long attributeId);
    boolean existsByAttributeIdAndValue(Long attributeId, String value);
    
    /**
     * Kiểm tra xem AttributeValue có đang được sử dụng bởi ProductAttributeValue không
     */
    @Query("SELECT COUNT(pav) > 0 FROM ProductAttributeValue pav WHERE pav.attributeValue.id = :valueId")
    boolean isUsedByProductAttributeValues(@Param("valueId") Long valueId);
}

