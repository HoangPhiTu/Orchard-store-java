package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderAdminDTO;
import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderRequestDTO;

import java.util.List;

public interface PreOrderService {
    void createPreOrder(PreOrderRequestDTO dto);
    List<PreOrderAdminDTO> getPreOrders(String status);
    PreOrderAdminDTO updateStatus(Long preOrderId, String status, Long convertedOrderId);
    void processRestock(ProductVariant variant);
}

