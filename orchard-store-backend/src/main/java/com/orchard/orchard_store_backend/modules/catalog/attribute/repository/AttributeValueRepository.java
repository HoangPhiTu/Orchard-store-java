package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {
    List<AttributeValue> findByAttributeId(Long attributeId);
    boolean existsByAttributeIdAndValue(Long attributeId, String value);
}

