package com.orchard.orchard_store_backend.modules.inventory.repository;

import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductVariantIdOrderByCreatedAtDesc(Long variantId);
}

