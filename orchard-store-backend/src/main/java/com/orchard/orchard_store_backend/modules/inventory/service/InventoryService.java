package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.inventory.dto.InventoryTransactionDTO;

import java.util.List;

public interface InventoryService {
    List<InventoryTransactionDTO> getTransactionsForVariant(Long variantId);
    InventoryTransactionDTO createTransaction(InventoryTransactionDTO dto);
    void adjustStock(Long variantId, int quantity, InventoryTransactionDTO.InventoryTransactionType type, String referenceType, Long referenceId, String notes);
}

