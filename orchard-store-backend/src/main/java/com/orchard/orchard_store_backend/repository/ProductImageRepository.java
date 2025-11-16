package com.orchard.orchard_store_backend.repository;

import com.orchard.orchard_store_backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
    
    @Query("SELECT i FROM ProductImage i WHERE i.product.id = :productId AND i.isPrimary = true")
    Optional<ProductImage> findPrimaryImageByProductId(@Param("productId") Long productId);
    
    @Query("SELECT i FROM ProductImage i WHERE i.product.id = :productId ORDER BY i.isPrimary DESC, i.displayOrder ASC")
    List<ProductImage> findAllByProductIdOrdered(@Param("productId") Long productId);
    
    void deleteByProductId(Long productId);
}

