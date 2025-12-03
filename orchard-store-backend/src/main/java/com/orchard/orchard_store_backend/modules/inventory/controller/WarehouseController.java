package com.orchard.orchard_store_backend.modules.inventory.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.inventory.dto.WarehouseDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.WarehouseService;
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
@RequestMapping("/api/admin/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    /**
     * GET /api/admin/warehouses - Lấy danh sách với phân trang và tìm kiếm (Admin)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<WarehouseDTO>>> getWarehouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<WarehouseDTO> warehouses = warehouseService.getWarehouses(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách kho hàng thành công", warehouses));
    }

    /**
     * GET /api/admin/warehouses/active - Lấy tất cả warehouses đang active (không phân trang - dành cho dropdown)
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<WarehouseDTO>>> getActiveWarehouses() {
        List<WarehouseDTO> warehouses = warehouseService.getActiveWarehouses();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách kho hàng thành công", warehouses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseDTO>> getWarehouseById(@PathVariable Long id) {
        WarehouseDTO warehouse = warehouseService.getWarehouseById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin kho hàng thành công", warehouse));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<WarehouseDTO>> getWarehouseByCode(@PathVariable String code) {
        WarehouseDTO warehouse = warehouseService.getWarehouseByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin kho hàng thành công", warehouse));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WarehouseDTO>> createWarehouse(@Valid @RequestBody WarehouseDTO warehouseDTO) {
        WarehouseDTO created = warehouseService.createWarehouse(warehouseDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo kho hàng thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseDTO>> updateWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseDTO warehouseDTO
    ) {
        WarehouseDTO updated = warehouseService.updateWarehouse(id, warehouseDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật kho hàng thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa kho hàng thành công", null));
    }

    /**
     * PUT /api/admin/warehouses/{id}/set-default - Đặt warehouse làm mặc định
     */
    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<WarehouseDTO>> setDefaultWarehouse(@PathVariable Long id) {
        WarehouseDTO updated = warehouseService.setDefaultWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Đặt kho hàng làm mặc định thành công", updated));
    }
}

