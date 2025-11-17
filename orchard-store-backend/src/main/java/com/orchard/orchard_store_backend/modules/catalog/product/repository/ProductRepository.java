package com.orchard.orchard_store_backend.modules.catalog.product.repository;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByStatusOrderByCreatedAtDesc(Product.Status status, Pageable pageable);

    Page<Product> findByBrandIdAndStatus(Long brandId, Product.Status status, Pageable pageable);

    Page<Product> findByCategoryIdAndStatus(Long categoryId, Product.Status status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.viewCount DESC")
    Page<Product> findTopViewedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.soldCount DESC")
    Page<Product> findTopSellingProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.isFeatured = true ORDER BY p.displayOrder ASC, p.createdAt DESC")
    List<Product> findFeaturedProducts();

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.isNew = true ORDER BY p.createdAt DESC")
    Page<Product> findNewProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.isBestseller = true ORDER BY p.soldCount DESC")
    Page<Product> findBestsellerProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "p.status = 'ACTIVE' AND " +
           "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.basePrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.basePrice <= :maxPrice) AND " +
           "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    Page<Product> searchProducts(
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}

