package com.orchard.orchard_store_backend.modules.catalog.product.example;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Ví dụ sử dụng JSONB queries để tìm kiếm sản phẩm dựa trên attributes trong cached_attributes
 * 
 * Cấu trúc JSONB cached_attributes:
 * {
 *   "gender": {
 *     "value": "MALE",
 *     "display": "Nam",
 *     "type": "SELECT",
 *     "dataType": "STRING"
 *   },
 *   "fragrance_group": {
 *     "value": "woody",
 *     "display": "Gỗ",
 *     "type": "SELECT",
 *     "dataType": "STRING"
 *   },
 *   "color": {
 *     "value": "Red",
 *     "display": "Đỏ",
 *     "type": "SELECT",
 *     "dataType": "STRING"
 *   },
 *   "longevity": {
 *     "value": "8",
 *     "display": "8 giờ",
 *     "type": "RANGE",
 *     "dataType": "NUMERIC",
 *     "numericValue": 8
 *   }
 * }
 */
@Service
public class ProductVariantJsonbQueryExamples {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * Ví dụ 1: Tìm tất cả variant có màu 'Red' - OPTIMIZED với @> operator
     * 
     * ✅ BEST PRACTICE: Sử dụng @> (containment) operator để tận dụng GIN index
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND cached_attributes @> '{"color": {"value": "Red"}}'::jsonb
     * 
     * Performance: Sử dụng GIN index hiệu quả, nhanh hơn nhiều so với ->> operator
     */
    public Page<ProductVariant> findVariantsByColor(String color, Pageable pageable) {
        // Tạo JSON string với structure đúng
        String attributeJson = String.format("{\"color\": {\"value\": \"%s\"}}", color);
        return productVariantRepository.findByAttributeKeyValue(
            attributeJson,  // e.g., "{\"color\": {\"value\": \"Red\"}}"
            pageable
        );
    }

    /**
     * Ví dụ 2: Tìm variant có nhiều attributes (AND condition)
     * Tìm variant có gender = "MALE" AND fragrance_group = "woody"
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND cached_attributes @> '{"gender": {"value": "MALE"}, "fragrance_group": {"value": "woody"}}'::jsonb
     */
    public Page<ProductVariant> findVariantsByMultipleAttributes(
            String gender, 
            String fragranceGroup, 
            Pageable pageable) {
        
        // Tạo JSON string cho multiple attributes
        String attributesJson = String.format(
            "{\"gender\": {\"value\": \"%s\"}, \"fragrance_group\": {\"value\": \"%s\"}}",
            gender, fragranceGroup
        );
        
        return productVariantRepository.findByMultipleAttributes(attributesJson, pageable);
    }

    /**
     * Ví dụ 3: Tìm variant có color IN ('Red', 'Blue', 'Green') - OPTIMIZED
     * 
     * ✅ BEST PRACTICE: Sử dụng multiple @> operators với OR
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND (
     *          cached_attributes @> '{"color": {"value": "Red"}}'::jsonb
     *          OR cached_attributes @> '{"color": {"value": "Blue"}}'::jsonb
     *          OR cached_attributes @> '{"color": {"value": "Green"}}'::jsonb
     *        )
     * 
     * Note: Nếu có nhiều hơn 3 giá trị, nên tách thành nhiều query hoặc dùng UNION
     */
    public Page<ProductVariant> findVariantsByColorIn(String[] colors, Pageable pageable) {
        // Tạo JSON strings cho từng màu
        String json1 = colors.length > 0 ? String.format("{\"color\": {\"value\": \"%s\"}}", colors[0]) : "{}";
        String json2 = colors.length > 1 ? String.format("{\"color\": {\"value\": \"%s\"}}", colors[1]) : "{}";
        String json3 = colors.length > 2 ? String.format("{\"color\": {\"value\": \"%s\"}}", colors[2]) : "{}";
        
        return productVariantRepository.findByAttributeValueIn(
            json1,
            json2,
            json3,
            pageable
        );
    }

    /**
     * Ví dụ 4: Tìm variant có longevity BETWEEN 6 AND 12 (numeric range)
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND (cached_attributes->'longevity'->>'numericValue')::numeric BETWEEN 6 AND 12
     */
    public Page<ProductVariant> findVariantsByLongevityRange(
            BigDecimal minHours, 
            BigDecimal maxHours, 
            Pageable pageable) {
        return productVariantRepository.findByNumericAttributeRange(
            "longevity",
            minHours,
            maxHours,
            pageable
        );
    }

    /**
     * Ví dụ 5: Tìm variant có fragrance_group LIKE '%woody%' (text search)
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND LOWER(cached_attributes->'fragrance_group'->>'value') LIKE LOWER('%woody%')
     */
    public Page<ProductVariant> findVariantsByFragranceGroupLike(String pattern, Pageable pageable) {
        return productVariantRepository.findByAttributeValueLike(
            "fragrance_group",
            pattern, // e.g., "woody"
            pageable
        );
    }

    /**
     * Ví dụ 6: Tìm variant có attributes + price range
     * Tìm variant có gender='MALE' và price BETWEEN 1000000 AND 5000000
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND cached_attributes @> '{"gender": {"value": "MALE"}}'::jsonb
     *        AND price BETWEEN 1000000 AND 5000000
     */
    public Page<ProductVariant> findVariantsByAttributesAndPrice(
            String gender,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {
        
        String attributesJson = String.format(
            "{\"gender\": {\"value\": \"%s\"}}",
            gender
        );
        
        return productVariantRepository.findByAttributesAndPriceRange(
            attributesJson,
            minPrice,
            maxPrice,
            pageable
        );
    }

    /**
     * Ví dụ 7: Full-text search trong tất cả attributes
     * Tìm variant có bất kỳ attribute nào chứa từ khóa "woody"
     * 
     * Query: SELECT * FROM product_variants 
     *        WHERE status = 'ACTIVE' 
     *        AND EXISTS (
     *            SELECT 1 FROM jsonb_each(cached_attributes) AS attr
     *            WHERE LOWER(attr.value->>'display') LIKE LOWER('%woody%')
     *               OR LOWER(attr.value->>'value') LIKE LOWER('%woody%')
     *        )
     */
    public Page<ProductVariant> searchVariantsByAnyAttribute(String searchTerm, Pageable pageable) {
        return productVariantRepository.searchByAttributeDisplayValue(searchTerm, pageable);
    }

    /**
     * Ví dụ 8: Sử dụng JPQL (không phải native query) - Cách 1: Sử dụng hàm PostgreSQL
     * 
     * Lưu ý: JPQL không hỗ trợ trực tiếp JSONB operators, nên phải dùng native query
     * hoặc tạo custom function trong PostgreSQL
     */
    // Không thể dùng JPQL thuần túy cho JSONB, phải dùng native query

    /**
     * Ví dụ 9: Kiểm tra variant có attribute key không
     */
    public boolean variantHasColorAttribute(Long variantId) {
        return productVariantRepository.hasAttributeKey(variantId, "color");
    }

    /**
     * Ví dụ 10: Lấy giá trị attribute của variant
     */
    public String getVariantColor(Long variantId) {
        return productVariantRepository.getAttributeValue(variantId, "color");
    }

    /**
     * Ví dụ 11: Sử dụng trong Service layer - Tìm variant màu đỏ với pagination
     */
    public Page<ProductVariant> findRedVariants(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return findVariantsByColor("Red", pageable);
    }

    /**
     * Ví dụ 12: Tạo JSON string từ Map (helper method)
     */
    private String buildAttributesJson(Map<String, String> attributeMap) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        
        for (Map.Entry<String, String> entry : attributeMap.entrySet()) {
            if (!first) {
                json.append(", ");
            }
            json.append(String.format("\"%s\": {\"value\": \"%s\"}", entry.getKey(), entry.getValue()));
            first = false;
        }
        
        json.append("}");
        return json.toString();
    }

    /**
     * Ví dụ 13: Tìm variant với dynamic attributes từ Map
     */
    public Page<ProductVariant> findVariantsByDynamicAttributes(
            Map<String, String> attributes,
            Pageable pageable) {
        
        String attributesJson = buildAttributesJson(attributes);
        return productVariantRepository.findByMultipleAttributes(attributesJson, pageable);
    }

    /**
     * Ví dụ sử dụng trong Controller:
     * 
     * @GetMapping("/variants/search")
     * public ResponseEntity<Page<ProductVariant>> searchVariants(
     *         @RequestParam(required = false) String color,
     *         @RequestParam(required = false) String gender,
     *         @RequestParam(defaultValue = "0") int page,
     *         @RequestParam(defaultValue = "20") int size) {
     *     
     *     Pageable pageable = PageRequest.of(page, size);
     *     
     *     if (color != null) {
     *         return ResponseEntity.ok(examples.findVariantsByColor(color, pageable));
     *     }
     *     
     *     if (gender != null) {
     *         Map<String, String> attrs = new HashMap<>();
     *         attrs.put("gender", gender);
     *         return ResponseEntity.ok(examples.findVariantsByDynamicAttributes(attrs, pageable));
     *     }
     *     
     *     return ResponseEntity.badRequest().build();
     * }
     */
}

