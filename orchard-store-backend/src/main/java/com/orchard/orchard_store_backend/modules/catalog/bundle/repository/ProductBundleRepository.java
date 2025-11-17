package com.orchard.orchard_store_backend.modules.catalog.bundle.repository;

import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBundleRepository extends JpaRepository<ProductBundle, Long> {

    Optional<ProductBundle> findBySlug(String slug);

    Page<ProductBundle> findByStatusOrderByDisplayOrderAsc(ProductBundle.Status status, Pageable pageable);

    List<ProductBundle> findByStatusAndBundleTypeOrderByDisplayOrderAsc(
            ProductBundle.Status status, ProductBundle.BundleType bundleType);

    @Query("SELECT b FROM ProductBundle b WHERE b.status = :status " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<ProductBundle> findActiveBundles(@Param("status") ProductBundle.Status status, @Param("now") LocalDateTime now);

    @Query("SELECT b FROM ProductBundle b WHERE b.status = :status " +
           "AND b.bundleType = :bundleType " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<ProductBundle> findActiveBundlesByType(
            @Param("status") ProductBundle.Status status,
            @Param("bundleType") ProductBundle.BundleType bundleType,
            @Param("now") LocalDateTime now);

    @Query("SELECT b FROM ProductBundle b WHERE b.status = 'ACTIVE' " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.discountPercentage DESC, b.displayOrder ASC")
    Page<ProductBundle> findTopDiscountBundles(@Param("now") LocalDateTime now, Pageable pageable);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}

