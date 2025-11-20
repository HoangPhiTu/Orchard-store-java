package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO cho filter parameters khi tìm kiếm sản phẩm.
 * 
 * Hỗ trợ:
 * - Filter theo Brand (List<Long>)
 * - Filter theo Category
 * - Filter theo Price range
 * - Filter theo Attributes (JSONB) - Dynamic attributes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterDTO {

    /**
     * Danh sách Brand IDs để filter
     * Ví dụ: ?brandId=1&brandId=2
     */
    @Builder.Default
    private List<Long> brandIds = new ArrayList<>();

    /**
     * Category ID để filter
     */
    private Long categoryId;

    /**
     * Giá tối thiểu
     */
    private BigDecimal minPrice;

    /**
     * Giá tối đa
     */
    private BigDecimal maxPrice;

    /**
     * Attributes filter - Map<attributeKey, attributeValue>
     * 
     * Có thể nhận từ:
     * 1. Query params: ?attrs=color:Red,size:XL
     * 2. JSON string: ?attrs={"color":"Red","size":"XL"}
     * 
     * Ví dụ:
     * - color: Red
     * - gender: MALE
     * - fragrance_group: woody
     */
    @Builder.Default
    private Map<String, String> attributes = new HashMap<>();

    /**
     * Status filter (mặc định: ACTIVE cho public store)
     */
    @Builder.Default
    private String status = "ACTIVE";

    /**
     * Parse attributes từ string format: "color:Red,size:XL"
     */
    public static Map<String, String> parseAttributesString(String attrsString) {
        Map<String, String> attrs = new HashMap<>();
        if (attrsString == null || attrsString.trim().isEmpty()) {
            return attrs;
        }

        // Try to parse as JSON first
        if (attrsString.trim().startsWith("{")) {
            try {
                // JSON parsing will be handled in controller
                return attrs;
            } catch (Exception e) {
                // Fall through to key:value parsing
            }
        }

        // Parse as key:value pairs separated by comma
        String[] pairs = attrsString.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                attrs.put(keyValue[0].trim(), keyValue[1].trim());
            }
        }

        return attrs;
    }
}

