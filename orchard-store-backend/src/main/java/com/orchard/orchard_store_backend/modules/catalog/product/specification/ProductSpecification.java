package com.orchard.orchard_store_backend.modules.catalog.product.specification;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Dynamic Specification for filtering Products
 * 
 * Supports:
 * - Filter by Brand ID
 * - Filter by Category ID (through variants)
 * - Filter by JSONB Attributes (through variants)
 * - Filter by Status
 * 
 * Usage:
 * Specification<Product> spec = ProductSpecification.builder()
 *     .brandId(1L)
 *     .categoryId(2L)
 *     .jsonbAttributes(Map.of("color", "Red", "gender", "MALE"))
 *     .status(Product.Status.ACTIVE)
 *     .build();
 * 
 * Page<Product> products = productRepository.findAll(spec, pageable);
 */
public class ProductSpecification implements Specification<Product> {

    private Long brandId;
    private Long categoryId;
    private Map<String, String> jsonbAttributes; // attributeKey -> attributeValue
    private Product.Status status;
    private Boolean hasActiveVariants;

    private ProductSpecification() {
    }

    public static Builder builder() {
        return new Builder();
    }

    @Override
    @Nullable
    public Predicate toPredicate(@NonNull Root<Product> root, @NonNull CriteriaQuery<?> query, @NonNull CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        // Filter by Brand ID
        if (brandId != null) {
            predicates.add(cb.equal(root.get("brand").get("id"), brandId));
        }

        // Filter by Status
        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        // Filter by Category ID (through variants)
        // This requires a subquery to check if product has variant with this category
        if (categoryId != null) {
            Subquery<Long> variantSubquery = query.subquery(Long.class);
            Root<ProductVariant> variantRoot = variantSubquery.from(ProductVariant.class);
            variantSubquery.select(variantRoot.get("product").get("id"));
            variantSubquery.where(
                cb.and(
                    cb.equal(variantRoot.get("category").get("id"), categoryId),
                    cb.equal(variantRoot.get("product").get("id"), root.get("id"))
                )
            );
            predicates.add(cb.exists(variantSubquery));
        }

        // Filter by JSONB Attributes (through variants)
        // ⚠️ NOTE: JPQL/Criteria API không hỗ trợ trực tiếp JSONB operators (@>, ->>)
        // Để filter JSONB hiệu quả, nên sử dụng:
        // 1. Native query trong Repository (recommended)
        // 2. Hoặc filter ở application layer sau khi load data
        // 
        // Ở đây chúng ta chỉ check variant có cachedAttributes không null
        // Để filter chính xác theo JSONB, sử dụng ProductVariantRepository.findByMultipleAttributes()
        if (jsonbAttributes != null && !jsonbAttributes.isEmpty()) {
            // Create subquery to check if product has variant with cachedAttributes
            // For actual JSONB filtering, use ProductVariantRepository methods
            Subquery<Long> attributeSubquery = query.subquery(Long.class);
            Root<ProductVariant> variantRoot = attributeSubquery.from(ProductVariant.class);
            attributeSubquery.select(variantRoot.get("product").get("id"));
            attributeSubquery.where(
                cb.and(
                    cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                    cb.isNotNull(variantRoot.get("cachedAttributes"))
                )
            );
            predicates.add(cb.exists(attributeSubquery));
            
            // TODO: For proper JSONB filtering, create a custom repository method:
            // - Use ProductVariantRepository.findByMultipleAttributes() to get variant IDs
            // - Then filter products that have those variants
        }

        // Filter by has active variants
        if (hasActiveVariants != null && hasActiveVariants) {
            Subquery<Long> activeVariantSubquery = query.subquery(Long.class);
            Root<ProductVariant> variantRoot = activeVariantSubquery.from(ProductVariant.class);
            activeVariantSubquery.select(variantRoot.get("product").get("id"));
            activeVariantSubquery.where(
                cb.and(
                    cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                    cb.equal(variantRoot.get("status"), ProductVariant.Status.ACTIVE)
                )
            );
            predicates.add(cb.exists(activeVariantSubquery));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }

    // Builder pattern
    public static class Builder {
        private final ProductSpecification specification = new ProductSpecification();

        public Builder brandId(Long brandId) {
            specification.brandId = brandId;
            return this;
        }

        public Builder categoryId(Long categoryId) {
            specification.categoryId = categoryId;
            return this;
        }

        public Builder jsonbAttributes(Map<String, String> jsonbAttributes) {
            specification.jsonbAttributes = jsonbAttributes;
            return this;
        }

        public Builder status(Product.Status status) {
            specification.status = status;
            return this;
        }

        public Builder hasActiveVariants(Boolean hasActiveVariants) {
            specification.hasActiveVariants = hasActiveVariants;
            return this;
        }

        public ProductSpecification build() {
            return specification;
        }
    }
}

