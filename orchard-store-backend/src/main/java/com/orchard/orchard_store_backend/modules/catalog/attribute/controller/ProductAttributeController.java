package com.orchard.orchard_store_backend.modules.catalog.attribute.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.ProductAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ProductAttributeController {

    private final ProductAttributeService productAttributeService;

    /**
     * GET /api/admin/attributes - Lấy danh sách với phân trang và tìm kiếm (Admin)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductAttributeDTO>>> getAttributes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String domain
    ) {
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductAttributeDTO> attributes = productAttributeService.getAttributes(keyword, status, domain, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thuộc tính thành công", attributes));
    }

    /**
     * GET /api/admin/attributes/all - Lấy tất cả (không phân trang - dành cho dropdown)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductAttributeDTO>>> getAllAttributes() {
        List<ProductAttributeDTO> attributes = productAttributeService.getAllAttributes();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thuộc tính thành công", attributes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> getAttribute(@PathVariable Long id) {
        ProductAttributeDTO attribute = productAttributeService.getAttribute(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thuộc tính thành công", attribute));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> createAttribute(@Valid @RequestBody ProductAttributeDTO dto) {
        ProductAttributeDTO created = productAttributeService.createAttribute(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo thuộc tính thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        ProductAttributeDTO updated = productAttributeService.updateAttribute(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thuộc tính thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long id) {
        productAttributeService.deleteAttribute(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thuộc tính thành công", null));
    }

    @GetMapping("/{id}/values")
    public ResponseEntity<ApiResponse<List<AttributeValueDTO>>> getAttributeValues(@PathVariable Long id) {
        List<AttributeValueDTO> values = productAttributeService.getAttributeValues(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách giá trị thuộc tính thành công", values));
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> createAttributeValue(
            @PathVariable Long id,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        AttributeValueDTO created = productAttributeService.createAttributeValue(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo giá trị thuộc tính thành công", created));
    }

    @PutMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> updateAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        AttributeValueDTO updated = productAttributeService.updateAttributeValue(id, valueId, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giá trị thuộc tính thành công", updated));
    }

    @DeleteMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId
    ) {
        productAttributeService.deleteAttributeValue(id, valueId);
        return ResponseEntity.ok(ApiResponse.success("Xóa giá trị thuộc tính thành công", null));
    }
}

