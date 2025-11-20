package com.orchard.orchard_store_backend.modules.catalog.product.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductFilterDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ProductStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller cho Public Product Store API.
 * 
 * Không yêu cầu authentication - Public endpoints.
 * Tập trung vào hiệu năng tìm kiếm với bộ lọc mạnh mẽ.
 */
@RestController
@RequestMapping("/api/store/products")
@RequiredArgsConstructor
@Slf4j
public class ProductStoreController {

    private final ProductStoreService productStoreService;
    private final ObjectMapper objectMapper;

    /**
     * Danh sách sản phẩm với bộ lọc mạnh mẽ.
     * 
     * Endpoint: GET /api/products
     * 
     * Query Parameters:
     * - brandId: List<Long> - Filter theo Brand IDs (có thể nhiều: ?brandId=1&brandId=2)
     * - categoryId: Long - Filter theo Category
     * - minPrice: BigDecimal - Giá tối thiểu
     * - maxPrice: BigDecimal - Giá tối đa
     * - attrs: String - Filter theo Attributes
     *   - Format 1: "color:Red,size:XL" (key:value pairs)
     *   - Format 2: JSON string: "{\"color\":\"Red\",\"size\":\"XL\"}"
     * - page: int (default: 0)
     * - size: int (default: 20)
     * - sort: String (default: "createdAt,desc")
     * 
     * Example:
     * GET /api/products?brandId=1&categoryId=2&minPrice=1000000&maxPrice=5000000&attrs=color:Red,gender:MALE
     * 
     * @param brandIds List Brand IDs
     * @param categoryId Category ID
     * @param minPrice Giá tối thiểu
     * @param maxPrice Giá tối đa
     * @param attrs Attributes filter string
     * @param page Page number (0-based)
     * @param size Page size
     * @param sort Sort string (field,direction)
     * @return ApiResponse<Page<ProductDTO>>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getProducts(
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String attrs,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        try {
            // Build filter DTO
            ProductFilterDTO filter = ProductFilterDTO.builder()
                    .brandIds(brandIds != null ? brandIds : List.of())
                    .categoryId(categoryId)
                    .minPrice(minPrice)
                    .maxPrice(maxPrice)
                    .status("ACTIVE") // Only active products for public store
                    .build();

            // Parse attributes
            if (attrs != null && !attrs.trim().isEmpty()) {
                Map<String, String> attributes = parseAttributes(attrs);
                filter.setAttributes(attributes);
            }

            // Build pageable
            Pageable pageable = buildPageable(page, size, sort);

            // Search products
            Page<ProductDTO> products = productStoreService.searchProducts(filter, pageable);

            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));

        } catch (Exception e) {
            log.error("Error searching products", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "Lỗi khi tìm kiếm sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Xem chi tiết sản phẩm theo slug (SEO friendly).
     * 
     * Endpoint: GET /api/products/{slug}
     * 
     * @param slug Slug của variant (vì Product không có slug, dùng variant slug)
     * @return ApiResponse<ProductDetailDTO>
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> getProductBySlug(@PathVariable String slug) {
        try {
            ProductDetailDTO product = productStoreService.getProductBySlug(slug);
            return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công", product));
        } catch (Exception e) {
            log.error("Error getting product by slug: {}", slug, e);
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(404, "Không tìm thấy sản phẩm với slug: " + slug));
        }
    }

    /**
     * Full-text search theo tên sản phẩm.
     * 
     * Endpoint: GET /api/products/search
     * 
     * Query Parameters:
     * - q: String (required) - Từ khóa tìm kiếm
     * - page: int (default: 0)
     * - size: int (default: 20)
     * - sort: String (default: "createdAt,desc")
     * 
     * Example:
     * GET /api/products/search?q=Chanel&page=0&size=20
     * 
     * @param keyword Từ khóa tìm kiếm
     * @param page Page number
     * @param size Page size
     * @param sort Sort string
     * @return ApiResponse<Page<ProductDTO>>
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Từ khóa tìm kiếm không được để trống"));
            }

            Pageable pageable = buildPageable(page, size, sort);
            Page<ProductDTO> products = productStoreService.searchProductsByName(q, pageable);

            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công", products));

        } catch (Exception e) {
            log.error("Error searching products by name", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "Lỗi khi tìm kiếm sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Parse attributes từ string.
     * 
     * Hỗ trợ 2 formats:
     * 1. Key:value pairs: "color:Red,size:XL"
     * 2. JSON string: "{\"color\":\"Red\",\"size\":\"XL\"}"
     */
    private Map<String, String> parseAttributes(String attrs) {
        if (attrs == null || attrs.trim().isEmpty()) {
            return Map.of();
        }

        // Try JSON format first
        if (attrs.trim().startsWith("{")) {
            try {
                return objectMapper.readValue(attrs, new TypeReference<Map<String, String>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse attributes as JSON, trying key:value format", e);
            }
        }

        // Parse as key:value pairs
        return ProductFilterDTO.parseAttributesString(attrs);
    }

    /**
     * Build Pageable từ request parameters.
     */
    private Pageable buildPageable(int page, int size, String sort) {
        // Parse sort string: "field,direction"
        String[] sortParts = sort.split(",");
        String sortField = sortParts.length > 0 ? sortParts[0] : "createdAt";
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }
}

