package com.orchard.orchard_store_backend.repository;

import com.orchard.orchard_store_backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    Optional<ProductVariant> findBySku(String sku);
    
    List<ProductVariant> findByProductIdOrderByDisplayOrderAsc(Long productId);
    
    List<ProductVariant> findByProductIdAndStatus(Long productId, ProductVariant.Status status);
    
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.isDefault = true")
    Optional<ProductVariant> findDefaultVariantByProductId(@Param("productId") Long productId);
    
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.status = 'ACTIVE' ORDER BY v.isDefault DESC, v.displayOrder ASC")
    List<ProductVariant> findActiveVariantsByProductId(@Param("productId") Long productId);
    
    @Query("SELECT v FROM ProductVariant v WHERE v.availableQuantity <= v.lowStockThreshold AND v.status = 'ACTIVE'")
    List<ProductVariant> findLowStockVariants();
    
    @Query("SELECT v FROM ProductVariant v WHERE v.availableQuantity = 0 AND v.status = 'ACTIVE'")
    List<ProductVariant> findOutOfStockVariants();
    
    boolean existsBySku(String sku);
    
    boolean existsBySkuAndIdNot(String sku, Long id);
}

