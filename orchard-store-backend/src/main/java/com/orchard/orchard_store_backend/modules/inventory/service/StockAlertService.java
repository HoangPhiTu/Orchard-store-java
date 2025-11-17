package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.inventory.dto.StockAlertDTO;

import java.util.List;

public interface StockAlertService {
    List<StockAlertDTO> getActiveAlerts();
    StockAlertDTO markAsResolved(Long alertId);
    void evaluateVariantStock(ProductVariant variant);
}

