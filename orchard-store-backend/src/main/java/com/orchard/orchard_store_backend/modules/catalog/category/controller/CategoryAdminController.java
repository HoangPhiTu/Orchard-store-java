package com.orchard.orchard_store_backend.modules.catalog.category.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.service.CategoryAdminService;
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
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class CategoryAdminController {

    private final CategoryAdminService categoryAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryDTO>>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "level") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Sort.Direction sortDirection = direction != null ? direction : Sort.Direction.ASC;
        Sort sort = Sort.by(sortDirection, sortBy)
                .and(Sort.by("displayOrder").ascending())
                .and(Sort.by("name").ascending());
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CategoryDTO> categories = categoryAdminService.getCategories(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục thành công", categories));
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategoriesTree() {
        List<CategoryDTO> tree = categoryAdminService.getCategoriesTree();
        return ResponseEntity.ok(ApiResponse.success("Lấy cây danh mục thành công", tree));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        CategoryDTO category = categoryAdminService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin danh mục thành công", category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        CategoryDTO created = categoryAdminService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo danh mục thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        CategoryDTO updated = categoryAdminService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryAdminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}

