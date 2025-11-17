package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long> {
    Optional<ProductAttribute> findByAttributeKey(String attributeKey);
    boolean existsByAttributeKey(String attributeKey);
}

