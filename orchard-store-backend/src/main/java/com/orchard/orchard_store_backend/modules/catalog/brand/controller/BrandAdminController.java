package com.orchard.orchard_store_backend.modules.catalog.brand.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.service.BrandAdminService;
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

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class BrandAdminController {

    private final BrandAdminService brandAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BrandDTO>>> getBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BrandDTO> brands = brandAdminService.getBrands(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thương hiệu thành công", brands));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> getBrandById(@PathVariable Long id) {
        BrandDTO brand = brandAdminService.getBrandById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thương hiệu thành công", brand));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandDTO>> createBrand(
            @Valid @RequestBody BrandCreateRequest request
    ) {
        BrandDTO created = brandAdminService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo thương hiệu thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandUpdateRequest request
    ) {
        BrandDTO updated = brandAdminService.updateBrand(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thương hiệu thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandAdminService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thương hiệu thành công", null));
    }
}

