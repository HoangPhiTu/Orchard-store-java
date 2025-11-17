package com.orchard.orchard_store_backend.modules.inventory.repository;

import com.orchard.orchard_store_backend.modules.inventory.entity.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    List<StockAlert> findByResolvedFalseOrderByCreatedAtAsc();
    List<StockAlert> findByAlertTypeAndResolvedFalse(StockAlert.AlertType alertType);
    Optional<StockAlert> findFirstByProductVariantIdAndResolvedFalseOrderByCreatedAtDesc(Long variantId);
}

