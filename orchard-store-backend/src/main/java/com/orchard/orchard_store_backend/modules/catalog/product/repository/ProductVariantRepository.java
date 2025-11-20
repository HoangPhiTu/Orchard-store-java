package com.orchard.orchard_store_backend.modules.catalog.product.repository;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
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
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    Optional<ProductVariant> findBySku(String sku);

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdOrderByIsDefaultDescDisplayOrderAsc(Long productId);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    /**
     * Kiểm tra xem slug đã tồn tại chưa (cho ProductVariant)
     */
    boolean existsBySlug(String slug);

    /**
     * Tìm ProductVariant theo slug
     */
    Optional<ProductVariant> findBySlug(String slug);

    // =============================================================================
    // JSONB QUERIES - Fast attribute filtering using cached_attributes
    // =============================================================================

    /**
     * Filter variants by a single attribute value (exact match)
     * Example: Find all variants with gender = "MALE"
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.cached_attributes @> :attributeJson::jsonb
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributeValue(
        @Param("attributeJson") String attributeJson,
        Pageable pageable
    );

    /**
     * Filter variants by multiple attribute values (AND condition)
     * Example: Find variants with gender = "MALE" AND fragrance_group = "woody"
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.cached_attributes @> :attributesJson::jsonb
        """, nativeQuery = true)
    Page<ProductVariant> findByMultipleAttributes(
        @Param("attributesJson") String attributesJson,
        Pageable pageable
    );

    /**
     * Filter variants by attribute key-value pair (exact match) - OPTIMIZED with @> operator
     * Example: Find variants where cached_attributes contains {"color": {"value": "Red"}}
     * 
     * ⚠️ IMPORTANT: Uses @> (containment) operator to leverage GIN index efficiently
     * This is MUCH faster than using ->> operator which requires table scan
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.cached_attributes @> CAST(:attributeJson AS jsonb)
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributeKeyValue(
        @Param("attributeJson") String attributeJson, // e.g., "{\"color\": {\"value\": \"Red\"}}"
        Pageable pageable
    );

    /**
     * Filter variants where attribute value is in a list (IN clause) - OPTIMIZED
     * Example: Find variants with color IN ('Red', 'Blue', 'Green')
     * 
     * ⚠️ NOTE: This uses OR with multiple @> operators for better index usage
     * Alternative: Use multiple separate queries and combine results if needed
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND (
            pv.cached_attributes @> CAST(:attributeJson1 AS jsonb)
            OR pv.cached_attributes @> CAST(:attributeJson2 AS jsonb)
            OR pv.cached_attributes @> CAST(:attributeJson3 AS jsonb)
          )
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributeValueIn(
        @Param("attributeJson1") String attributeJson1, // e.g., "{\"color\": {\"value\": \"Red\"}}"
        @Param("attributeJson2") String attributeJson2, // e.g., "{\"color\": {\"value\": \"Blue\"}}"
        @Param("attributeJson3") String attributeJson3, // e.g., "{\"color\": {\"value\": \"Green\"}}"
        Pageable pageable
    );

    /**
     * Filter variants where attribute value is in a list - Alternative approach using ANY
     * ⚠️ WARNING: This uses ->> operator which may not use GIN index efficiently
     * Use only if you have expression index for specific attribute key
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.cached_attributes->:attributeKey->>'value' = ANY(STRING_TO_ARRAY(:attributeValues, ','))
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributeValueInLegacy(
        @Param("attributeKey") String attributeKey,
        @Param("attributeValues") String attributeValues, // Comma-separated values
        Pageable pageable
    );

    /**
     * Filter variants by numeric attribute range
     * Example: Find variants with longevity BETWEEN 6 AND 12
     * 
     * ⚠️ WARNING: This uses ->> operator which may not use GIN index efficiently
     * Consider creating expression index for numeric attributes if this query is used frequently:
     * CREATE INDEX idx_variants_longevity ON product_variants 
     *   ((cached_attributes->'longevity'->>'numericValue')::numeric) 
     *   WHERE status = 'ACTIVE';
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND (pv.cached_attributes->:attributeKey->>'numericValue')::numeric BETWEEN :minValue AND :maxValue
        """, nativeQuery = true)
    Page<ProductVariant> findByNumericAttributeRange(
        @Param("attributeKey") String attributeKey,
        @Param("minValue") BigDecimal minValue,
        @Param("maxValue") BigDecimal maxValue,
        Pageable pageable
    );

    /**
     * Filter variants by attribute value with LIKE pattern (text search)
     * Example: Find variants where fragrance_group contains "woody"
     * 
     * ⚠️ WARNING: This uses ->> operator which may not use GIN index efficiently
     * Consider using full-text search or creating expression index for better performance
     * For exact match, prefer findByAttributeKeyValue with @> operator
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND LOWER(pv.cached_attributes->:attributeKey->>'value') LIKE LOWER(CONCAT('%', :pattern, '%'))
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributeValueLike(
        @Param("attributeKey") String attributeKey,
        @Param("pattern") String pattern,
        Pageable pageable
    );

    /**
     * Filter variants by multiple attributes with price range
     * Example: Find variants with gender='MALE', price BETWEEN 1000000 AND 5000000
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.cached_attributes @> :attributesJson::jsonb
          AND pv.price BETWEEN :minPrice AND :maxPrice
        """, nativeQuery = true)
    Page<ProductVariant> findByAttributesAndPriceRange(
        @Param("attributesJson") String attributesJson,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    /**
     * Filter variants by category and attributes
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND pv.category_id = :categoryId
          AND pv.cached_attributes @> :attributesJson::jsonb
        """, nativeQuery = true)
    Page<ProductVariant> findByCategoryAndAttributes(
        @Param("categoryId") Long categoryId,
        @Param("attributesJson") String attributesJson,
        Pageable pageable
    );

    /**
     * Search variants by attribute display value (full-text search in JSONB)
     * Example: Search for variants where any attribute display value contains "woody"
     */
    @Query(value = """
        SELECT * FROM product_variants pv
        WHERE pv.status = 'ACTIVE'
          AND EXISTS (
              SELECT 1 FROM jsonb_each(pv.cached_attributes) AS attr
              WHERE LOWER(attr.value->>'display') LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                 OR LOWER(attr.value->>'value') LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          )
        """, nativeQuery = true)
    Page<ProductVariant> searchByAttributeDisplayValue(
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );

    /**
     * Check if variant has specific attribute key
     */
    @Query(value = """
        SELECT COUNT(*) > 0 FROM product_variants pv
        WHERE pv.id = :variantId
          AND pv.cached_attributes -> :attributeKey IS NOT NULL
        """, nativeQuery = true)
    boolean hasAttributeKey(@Param("variantId") Long variantId, @Param("attributeKey") String attributeKey);

    /**
     * Get attribute value for a variant
     */
    @Query(value = """
        SELECT pv.cached_attributes->:attributeKey->>'value'
        FROM product_variants pv
        WHERE pv.id = :variantId
        """, nativeQuery = true)
    String getAttributeValue(@Param("variantId") Long variantId, @Param("attributeKey") String attributeKey);
}

