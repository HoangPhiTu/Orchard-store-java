package com.orchard.orchard_store_backend.modules.inventory.repository;

import com.orchard.orchard_store_backend.modules.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long>, JpaSpecificationExecutor<Warehouse> {

    Optional<Warehouse> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * Tìm warehouse mặc định
     */
    @Query("SELECT w FROM Warehouse w WHERE w.isDefault = true AND w.status = 'ACTIVE'")
    Optional<Warehouse> findDefaultWarehouse();

    /**
     * Kiểm tra xem warehouse có đang được sử dụng trong inventory_transaction không
     */
    @Query(value = "SELECT COUNT(*) > 0 FROM inventory_transactions WHERE warehouse_id = :warehouseId", nativeQuery = true)
    boolean isUsedByInventoryTransactions(@Param("warehouseId") Long warehouseId);

    /**
     * Kiểm tra xem warehouse có đang được sử dụng trong warehouse_stock không
     */
    @Query("SELECT COUNT(ws) > 0 FROM WarehouseStock ws WHERE ws.warehouse.id = :warehouseId")
    boolean isUsedByWarehouseStock(@Param("warehouseId") Long warehouseId);
}

