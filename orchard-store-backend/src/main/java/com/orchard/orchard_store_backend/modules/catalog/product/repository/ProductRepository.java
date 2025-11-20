package com.orchard.orchard_store_backend.modules.catalog.product.repository;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findAllByStatus(Product.Status status, Pageable pageable);

    /**
     * Find Product by ID with all related entities fetched in a single query.
     * 
     * ⚠️ CRITICAL: Sử dụng @EntityGraph để tránh LazyInitializationException
     * 
     * Vấn đề LazyInitializationException:
     * - Khi Product được load, các relationships (variants, images, seoUrls) là LAZY
     * - Nếu access các relationships này sau khi session đã đóng → LazyInitializationException
     * - Entity Graph fetch tất cả trong 1 query → Tránh N+1 problem và Lazy Exception
     * 
     * Performance:
     * - 1 query với JOIN thay vì N+1 queries
     * - Fetch variants, images, seoUrls cùng lúc
     * - Brand cũng được fetch (nếu cần)
     * 
     * Usage:
     * Product product = productRepository.findByIdWithDetails(productId)
     *     .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
     * // Access variants, images, seoUrls safely - không cần transaction
     * product.getVariants().forEach(v -> ...);
     */
    @EntityGraph(attributePaths = {
        "variants",
        "images",
        "seoUrls",
        "brand"
    })
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);

    /**
     * Find all Products with details (variants, images, seoUrls) - for listing
     * 
     * ⚠️ WARNING: Chỉ dùng khi thực sự cần tất cả data
     * Nếu chỉ cần basic info, dùng findAll() hoặc findAllByStatus()
     * 
     * Note: This overrides the default findAll() method with Entity Graph
     */
    @Override
    @EntityGraph(attributePaths = {
        "variants",
        "images",
        "seoUrls",
        "brand"
    })
    org.springframework.data.domain.Page<Product> findAll(org.springframework.data.domain.Pageable pageable);

    /**
     * Tìm Product theo variant slug (SEO friendly).
     * 
     * Vì Product không có slug, chúng ta tìm qua variant slug.
     * Sử dụng JOIN để tìm product có variant với slug này.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "JOIN p.variants v " +
           "WHERE v.slug = :slug " +
           "AND p.status = 'ACTIVE' " +
           "AND v.status = 'ACTIVE'")
    @EntityGraph(attributePaths = {"variants", "images", "seoUrls", "brand"})
    Optional<Product> findByVariantSlug(@Param("slug") String slug);
}

