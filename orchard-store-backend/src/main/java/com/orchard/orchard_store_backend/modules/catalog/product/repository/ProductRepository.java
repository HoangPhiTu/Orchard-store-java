package com.orchard.orchard_store_backend.modules.catalog.product.repository;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findAllByStatus(Product.Status status, Pageable pageable);

    /**
     * Find Product by ID with all related entities fetched efficiently.
     * 
     * ⚠️ CRITICAL: Sử dụng @EntityGraph để tránh LazyInitializationException
     * 
     * Vấn đề MultipleBagFetchException:
     * - Hibernate không cho phép fetch nhiều @OneToMany collections (bags) cùng lúc
     * - Giải pháp: Chỉ fetch variants trong EntityGraph, images và seoUrls dùng @BatchSize
     * 
     * Performance:
     * - 1 query chính với JOIN variants và brand
     * - images và seoUrls được fetch riêng bằng @BatchSize (hiệu quả, tránh N+1)
     * 
     * Usage:
     * Product product = productRepository.findByIdWithDetails(productId)
     *     .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
     * // Access variants, images, seoUrls safely - không cần transaction
     * product.getVariants().forEach(v -> ...);
     */
    @EntityGraph(attributePaths = {
        "variants",
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
     * Note: Chỉ fetch variants và brand trong EntityGraph để tránh MultipleBagFetchException.
     * images và seoUrls được fetch riêng bằng @BatchSize.
     */
    @Override
    @EntityGraph(attributePaths = {
        "variants",
        "brand"
    })
    @NonNull
    org.springframework.data.domain.Page<Product> findAll(@NonNull org.springframework.data.domain.Pageable pageable);

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
    @EntityGraph(attributePaths = {"variants", "brand"})
    Optional<Product> findByVariantSlug(@Param("slug") String slug);
}

