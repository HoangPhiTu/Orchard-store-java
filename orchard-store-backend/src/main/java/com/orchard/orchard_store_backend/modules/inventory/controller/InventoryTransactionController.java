package com.orchard.orchard_store_backend.modules.inventory.controller;

import com.orchard.orchard_store_backend.modules.inventory.dto.InventoryTransactionDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryTransactionController {

    private final InventoryService inventoryService;

    @GetMapping("/variants/{variantId}/transactions")
    public ResponseEntity<List<InventoryTransactionDTO>> getTransactions(@PathVariable Long variantId) {
        return ResponseEntity.ok(inventoryService.getTransactionsForVariant(variantId));
    }

    @PostMapping("/transactions")
    public ResponseEntity<InventoryTransactionDTO> createTransaction(
            @Valid @RequestBody InventoryTransactionDTO dto
    ) {
        return ResponseEntity.ok(inventoryService.createTransaction(dto));
    }

    @PostMapping("/variants/{variantId}/adjust")
    public ResponseEntity<Void> adjustStock(
            @PathVariable Long variantId,
            @RequestBody InventoryTransactionDTO dto
    ) {
        inventoryService.adjustStock(
                variantId,
                dto.getQuantity(),
                dto.getTransactionType(),
                dto.getReferenceType(),
                dto.getReferenceId(),
                dto.getNotes()
        );
        return ResponseEntity.ok().build();
    }
}

