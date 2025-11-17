package com.orchard.orchard_store_backend.modules.catalog.pricing.repository;

import com.orchard.orchard_store_backend.modules.catalog.pricing.entity.ProductPriceHistory;
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
public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {

    // Tìm lịch sử giá theo product variant
    @Query("SELECT pph FROM ProductPriceHistory pph WHERE pph.productVariant.id = :variantId ORDER BY pph.createdAt DESC")
    Page<ProductPriceHistory> findByProductVariantIdOrderByCreatedAtDesc(@Param("variantId") Long productVariantId, Pageable pageable);

    @Query("SELECT pph FROM ProductPriceHistory pph WHERE pph.productVariant.id = :variantId ORDER BY pph.createdAt DESC")
    List<ProductPriceHistory> findByProductVariantIdOrderByCreatedAtDesc(@Param("variantId") Long productVariantId);

    // Tìm giá hiện tại (effective_from <= now và (effective_to IS NULL hoặc effective_to >= now))
    @Query("SELECT pph FROM ProductPriceHistory pph " +
           "WHERE pph.productVariant.id = :variantId " +
           "AND pph.effectiveFrom <= :now " +
           "AND (pph.effectiveTo IS NULL OR pph.effectiveTo >= :now) " +
           "ORDER BY pph.effectiveFrom DESC")
    Optional<ProductPriceHistory> findCurrentPrice(@Param("variantId") Long variantId, @Param("now") LocalDateTime now);

    // Tìm giá trong khoảng thời gian
    @Query("SELECT pph FROM ProductPriceHistory pph " +
           "WHERE pph.productVariant.id = :variantId " +
           "AND pph.effectiveFrom <= :endDate " +
           "AND (pph.effectiveTo IS NULL OR pph.effectiveTo >= :startDate) " +
           "ORDER BY pph.effectiveFrom DESC")
    List<ProductPriceHistory> findPricesInRange(
            @Param("variantId") Long variantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tìm giá theo promotion
    List<ProductPriceHistory> findByPromotionIdOrderByCreatedAtDesc(Long promotionId);

    // Tìm giá theo loại thay đổi
    List<ProductPriceHistory> findByPriceChangeTypeOrderByCreatedAtDesc(
            ProductPriceHistory.PriceChangeType priceChangeType);

    // Đếm số lần thay đổi giá của variant
    long countByProductVariantId(Long productVariantId);
}

