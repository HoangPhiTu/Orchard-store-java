package com.orchard.orchard_store_backend.modules.inventory.repository;

import com.orchard.orchard_store_backend.modules.inventory.entity.PreOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreOrderRepository extends JpaRepository<PreOrder, Long> {
    List<PreOrder> findByStatusOrderByCreatedAtAsc(PreOrder.PreOrderStatus status);
    List<PreOrder> findByProductVariantIdAndStatus(Long variantId, PreOrder.PreOrderStatus status);
}

