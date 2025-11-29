package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductFilterDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service cho Public Product Store API.
 * 
 * Tập trung vào hiệu năng tìm kiếm với:
 * - JPA Specification cho filter cơ bản (Brand, Category, Price)
 * - Native Query JSONB cho filter Attributes
 * - Kết hợp cả hai nếu filter hỗn hợp
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductStoreService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductMapper productMapper;
    private final ObjectMapper objectMapper;

    /**
     * Tìm kiếm sản phẩm với bộ lọc mạnh mẽ.
     * 
     * Logic:
     * 1. Nếu có filter Attributes -> Sử dụng Native Query JSONB
     * 2. Nếu chỉ có filter cơ bản -> Sử dụng JPA Specification
     * 3. Nếu có cả hai -> Kết hợp (Intersect ID list)
     * 
     * @param filter Filter parameters
     * @param pageable Pagination
     * @return Page<ProductDTO> - Lightweight DTO cho listing
     */
    public Page<ProductDTO> searchProducts(ProductFilterDTO filter, Pageable pageable) {
        log.debug("Searching products with filter: {}", filter);

        // Case 1: Có filter Attributes -> Sử dụng Native Query JSONB
        if (filter.getAttributes() != null && !filter.getAttributes().isEmpty()) {
            return searchWithAttributes(filter, pageable);
        }

        // Case 2: Chỉ có filter cơ bản -> Sử dụng JPA Specification
        return searchWithSpecification(filter, pageable);
    }

    /**
     * Tìm kiếm với Attributes filter (sử dụng Native Query JSONB).
     * 
     * Strategy:
     * 1. Tìm variants matching attributes bằng Native Query
     * 2. Lấy product IDs từ variants
     * 3. Nếu có filter cơ bản khác -> Kết hợp với Specification
     * 4. Load products và map sang DTO
     */
    private Page<ProductDTO> searchWithAttributes(ProductFilterDTO filter, Pageable pageable) {
        log.debug("Searching with attributes filter: {}", filter.getAttributes());

        // 1. Build JSONB query string từ attributes
        String attributesJson = buildAttributesJson(filter.getAttributes());
        log.debug("Attributes JSON: {}", attributesJson);

        // 2. Tìm variants matching attributes (Native Query với GIN index)
        Page<ProductVariant> variants = variantRepository.findByMultipleAttributes(
                attributesJson,
                Pageable.unpaged() // Get all matching variants first
        );

        // 3. Extract product IDs từ variants
        Set<Long> productIds = variants.getContent().stream()
                .map(v -> v.getProduct().getId())
                .collect(Collectors.toSet());

        if (productIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 4. Filter by price range nếu có
        if (filter.getMinPrice() != null || filter.getMaxPrice() != null) {
            Set<Long> productIdsFromPrice = filterByPriceRange(filter.getMinPrice(), filter.getMaxPrice());
            productIds.retainAll(productIdsFromPrice); // Intersect
            if (productIds.isEmpty()) {
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        // 5. Nếu có filter cơ bản khác -> Kết hợp với Specification
        if (hasBasicFilters(filter)) {
            return searchWithCombinedFilters(filter, productIds, pageable);
        }

        // 6. Load products by IDs và map sang DTO
        List<Product> products = productRepository.findAllById(productIds);
        
        // Filter by status
        products = products.stream()
                .filter(p -> p.getStatus() == Product.Status.valueOf(filter.getStatus()))
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), products.size());
        List<Product> pagedProducts = start < products.size() 
                ? products.subList(start, end) 
                : Collections.emptyList();

        return new PageImpl<>(
                pagedProducts.stream()
                        .map(productMapper::toDTO)
                        .collect(Collectors.toList()),
                pageable,
                products.size()
        );
    }

    /**
     * Tìm kiếm với Specification (filter cơ bản).
     */
    private Page<ProductDTO> searchWithSpecification(ProductFilterDTO filter, Pageable pageable) {
        log.debug("Searching with specification filter");

        // Build Specification
        Specification<Product> spec = buildSpecification(filter);

        // Query với Specification
        Page<Product> products = productRepository.findAll(spec, pageable);

        // Map sang DTO
        return products.map(productMapper::toDTO);
    }

    /**
     * Tìm kiếm với filter hỗn hợp (Attributes + Basic filters).
     * 
     * Strategy:
     * 1. Filter products by IDs từ attributes query
     * 2. Apply basic filters bằng Specification
     * 3. Intersect results
     */
    private Page<ProductDTO> searchWithCombinedFilters(
            ProductFilterDTO filter,
            Set<Long> productIdsFromAttributes,
            Pageable pageable
    ) {
        log.debug("Searching with combined filters (attributes + basic)");

        // Build Specification cho basic filters
        Specification<Product> spec = buildSpecification(filter);

        // Add product IDs filter
        spec = spec.and((root, query, cb) -> root.get("id").in(productIdsFromAttributes));

        // Query
        Page<Product> products = productRepository.findAll(spec, pageable);

        return products.map(productMapper::toDTO);
    }

    /**
     * Build JPA Specification từ filter.
     */
    private Specification<Product> buildSpecification(ProductFilterDTO filter) {
        ProductSpecification.Builder builder = ProductSpecification.builder();

        // Filter by Brand IDs - supports multiple brands with OR condition
        if (filter.getBrandIds() != null && !filter.getBrandIds().isEmpty()) {
            if (filter.getBrandIds().size() == 1) {
                // Single brand: use brandId for backward compatibility
                builder.brandId(filter.getBrandIds().get(0));
            } else {
                // Multiple brands: use brandIds for OR condition
                builder.brandIds(filter.getBrandIds());
            }
        }

        // Filter by Category
        if (filter.getCategoryId() != null) {
            builder.categoryId(filter.getCategoryId());
        }

        // Filter by Status
        if (filter.getStatus() != null) {
            builder.status(Product.Status.valueOf(filter.getStatus()));
        } else {
            builder.status(Product.Status.ACTIVE); // Default: only active products
        }

        // Filter by has active variants
        builder.hasActiveVariants(true);

        return builder.build();
    }

    /**
     * Build JSONB query string từ attributes map.
     * 
     * Format: {"color": {"value": "Red"}, "gender": {"value": "MALE"}}
     */
    private String buildAttributesJson(Map<String, String> attributes) {
        Map<String, Map<String, String>> jsonbStructure = new HashMap<>();
        
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            Map<String, String> attributeValue = new HashMap<>();
            attributeValue.put("value", entry.getValue());
            jsonbStructure.put(entry.getKey(), attributeValue);
        }

        try {
            return objectMapper.writeValueAsString(jsonbStructure);
        } catch (Exception e) {
            log.error("Error building attributes JSON", e);
            throw new RuntimeException("Invalid attributes format", e);
        }
    }

    /**
     * Kiểm tra xem có filter cơ bản không (Brand, Category).
     * Note: Price filter được xử lý riêng ở variant level.
     */
    private boolean hasBasicFilters(ProductFilterDTO filter) {
        return (filter.getBrandIds() != null && !filter.getBrandIds().isEmpty())
                || filter.getCategoryId() != null;
    }

    /**
     * Lấy chi tiết sản phẩm theo slug (SEO friendly).
     * 
     * @param slug Slug của variant (vì Product không có slug, dùng variant slug)
     * @return ProductDetailDTO
     */
    public ProductDetailDTO getProductBySlug(String slug) {
        log.debug("Getting product by slug: {}", slug);

        // Tìm product theo variant slug (sử dụng query với JOIN)
        Product product = productRepository.findByVariantSlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", slug));

        return productMapper.toDetailDTO(product);
    }

    /**
     * Full-text search theo tên sản phẩm.
     * 
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Pagination
     * @return Page<ProductDTO>
     */
    public Page<ProductDTO> searchProductsByName(String keyword, Pageable pageable) {
        log.debug("Full-text search with keyword: {}", keyword);

        // Build Specification với LIKE query
        Specification<Product> spec = (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return cb.conjunction(); // No filter
            }

            String searchPattern = "%" + keyword.toLowerCase() + "%";
            return cb.and(
                    cb.equal(root.get("status"), Product.Status.ACTIVE),
                    cb.like(cb.lower(root.get("name")), searchPattern)
            );
        };

        // Add has active variants filter
        spec = spec.and(ProductSpecification.builder()
                .hasActiveVariants(true)
                .build());

        Page<Product> products = productRepository.findAll(spec, pageable);

        return products.map(productMapper::toDTO);
    }

    /**
     * Filter by price range (helper method).
     * 
     * Note: Price filter được áp dụng ở variant level, không phải product level.
     * Cần filter variants trước, sau đó lấy products.
     */
    private Set<Long> filterByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        // Query variants trong price range
        List<ProductVariant> variants = variantRepository.findAll().stream()
                .filter(v -> v.getStatus() == ProductVariant.Status.ACTIVE)
                .filter(v -> {
                    BigDecimal price = v.getSalePrice() != null && v.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                            ? v.getSalePrice()
                            : v.getPrice();
                    
                    if (minPrice != null && price.compareTo(minPrice) < 0) {
                        return false;
                    }
                    if (maxPrice != null && price.compareTo(maxPrice) > 0) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        return variants.stream()
                .map(v -> v.getProduct().getId())
                .collect(Collectors.toSet());
    }
}

