package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM ProductAttributeValue pav WHERE pav.product.id = :productId")
    void deleteByProductId(Long productId);
}

