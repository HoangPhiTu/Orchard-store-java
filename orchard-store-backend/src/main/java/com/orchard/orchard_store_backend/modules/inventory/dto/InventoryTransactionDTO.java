package com.orchard.orchard_store_backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionDTO {
    private Long id;
    private Long productVariantId;
    private String productVariantSku;
    private String productName;
    private InventoryTransactionType transactionType;
    private Integer quantity;
    private String referenceType;
    private Long referenceId;
    private Integer stockBefore;
    private Integer stockAfter;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;

    public enum InventoryTransactionType {
        IN,
        OUT,
        ADJUSTMENT,
        RETURN,
        DAMAGED,
        RESERVE,
        RELEASE
    }
}

