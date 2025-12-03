package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long>, JpaSpecificationExecutor<ProductAttribute> {
    Optional<ProductAttribute> findByAttributeKey(String attributeKey);
    boolean existsByAttributeKey(String attributeKey);
    
    /**
     * Kiểm tra xem ProductAttribute có đang được sử dụng bởi ProductAttributeValue không
     */
    @Query("SELECT COUNT(pav) > 0 FROM ProductAttributeValue pav WHERE pav.attribute.id = :attributeId")
    boolean isUsedByProductAttributeValues(@Param("attributeId") Long attributeId);
}

