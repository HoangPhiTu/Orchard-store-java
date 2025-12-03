package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.inventory.dto.WarehouseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WarehouseService {

    /**
     * Lấy danh sách warehouses có phân trang và tìm kiếm (dành cho admin)
     */
    Page<WarehouseDTO> getWarehouses(String keyword, String status, Pageable pageable);

    /**
     * Lấy tất cả warehouses đang active (không phân trang - dành cho dropdown)
     */
    List<WarehouseDTO> getActiveWarehouses();

    WarehouseDTO getWarehouseById(Long id);

    WarehouseDTO getWarehouseByCode(String code);

    WarehouseDTO createWarehouse(WarehouseDTO warehouseDTO);

    WarehouseDTO updateWarehouse(Long id, WarehouseDTO warehouseDTO);

    void deleteWarehouse(Long id);

    /**
     * Đặt warehouse làm mặc định
     */
    WarehouseDTO setDefaultWarehouse(Long id);
}

