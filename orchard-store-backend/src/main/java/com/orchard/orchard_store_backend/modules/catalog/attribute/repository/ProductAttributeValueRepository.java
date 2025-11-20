package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByProductId(Long productId);

    List<ProductAttributeValue> findByProductVariantId(Long productVariantId);

    List<ProductAttributeValue> findByProductIdAndScope(Long productId, ProductAttributeValue.Scope scope);

    List<ProductAttributeValue> findByProductVariantIdAndScope(Long productVariantId, ProductAttributeValue.Scope scope);

    @Modifying
    @Query("DELETE FROM ProductAttributeValue pav WHERE pav.product.id = :productId")
    void deleteByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM ProductAttributeValue pav WHERE pav.productVariant.id = :variantId")
    void deleteByProductVariantId(@Param("variantId") Long variantId);
}

