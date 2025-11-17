package com.orchard.orchard_store_backend.modules.catalog.bundle.repository;

import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.BundleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BundleItemRepository extends JpaRepository<BundleItem, Long> {

    List<BundleItem> findByBundleIdOrderByDisplayOrderAsc(Long bundleId);

    @Query("SELECT bi FROM BundleItem bi WHERE bi.bundle.id = :bundleId AND bi.isRequired = true ORDER BY bi.displayOrder ASC")
    List<BundleItem> findRequiredItemsByBundleId(@Param("bundleId") Long bundleId);

    @Query("SELECT bi FROM BundleItem bi WHERE bi.bundle.id = :bundleId AND bi.isRequired = false ORDER BY bi.displayOrder ASC")
    List<BundleItem> findOptionalItemsByBundleId(@Param("bundleId") Long bundleId);

    List<BundleItem> findByProductId(Long productId);

    List<BundleItem> findByProductVariantId(Long productVariantId);

    @Query("SELECT bi FROM BundleItem bi WHERE bi.bundle.id = :bundleId " +
           "AND bi.product.id = :productId " +
           "AND (:variantId IS NULL OR bi.productVariant.id = :variantId)")
    Optional<BundleItem> findByBundleAndProduct(
            @Param("bundleId") Long bundleId,
            @Param("productId") Long productId,
            @Param("variantId") Long variantId);

    void deleteByBundleId(Long bundleId);
}

