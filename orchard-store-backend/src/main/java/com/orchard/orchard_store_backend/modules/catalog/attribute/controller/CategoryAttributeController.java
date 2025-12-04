package com.orchard.orchard_store_backend.modules.catalog.attribute.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.CategoryAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/category-attributes")
@RequiredArgsConstructor
public class CategoryAttributeController {

    private final CategoryAttributeService categoryAttributeService;

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<List<CategoryAttributeDTO>>> getCategoryAttributes(
            @PathVariable Long categoryId
    ) {
        List<CategoryAttributeDTO> attributes = categoryAttributeService.getAttributesByCategory(categoryId);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách thuộc tính danh mục thành công", attributes)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryAttributeDTO>> assignAttribute(
            @Valid @RequestBody CategoryAttributeDTO dto
    ) {
        CategoryAttributeDTO assigned = categoryAttributeService.assignAttributeToCategory(dto);
        return ResponseEntity.ok(
                ApiResponse.success("Gán thuộc tính cho danh mục thành công", assigned)
        );
    }

    @DeleteMapping("/{categoryId}/{attributeId}")
    public ResponseEntity<ApiResponse<Void>> removeAttribute(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId
    ) {
        categoryAttributeService.removeAttributeFromCategory(categoryId, attributeId);
        return ResponseEntity.ok(
                ApiResponse.success("Xóa thuộc tính khỏi danh mục thành công", null)
        );
    }

    @PutMapping("/{categoryId}/{attributeId}")
    public ResponseEntity<ApiResponse<CategoryAttributeDTO>> updateMetadata(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId,
            @Valid @RequestBody CategoryAttributeDTO dto
    ) {
        CategoryAttributeDTO updated = categoryAttributeService.updateCategoryAttributeMetadata(
                categoryId,
                attributeId,
                dto
        );
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật thuộc tính danh mục thành công", updated)
        );
    }

    /**
     * Lấy danh sách attributes cho Product Form
     * - Chỉ trả về Product Attributes (is_variant_specific = false)
     * - Group theo group_name (fallback to domain nếu NULL)
     * - Sort theo display_order trong mỗi group
     * - Include attribute values
     */
    @GetMapping("/{categoryId}/for-product")
    public ResponseEntity<ApiResponse<Map<String, List<ProductAttributeDTO>>>> getAttributesForProduct(
            @PathVariable Long categoryId
    ) {
        Map<String, List<ProductAttributeDTO>> grouped = categoryAttributeService.getAttributesForProduct(categoryId);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách thuộc tính cho Product Form thành công", grouped)
        );
    }

    /**
     * Lấy danh sách Variant Attributes (is_variant_specific = true)
     * để dùng cho Variant Generator.
     */
    @GetMapping("/{categoryId}/for-variants")
    public ResponseEntity<ApiResponse<List<ProductAttributeDTO>>> getVariantAttributesForProduct(
            @PathVariable Long categoryId
    ) {
        List<ProductAttributeDTO> attributes =
                categoryAttributeService.getVariantAttributesForCategory(categoryId);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách thuộc tính cho Variant Generator thành công", attributes)
        );
    }
}

