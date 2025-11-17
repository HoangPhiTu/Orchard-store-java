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
public class StockAlertDTO {
    private Long id;
    private Long productVariantId;
    private String productVariantSku;
    private String productName;
    private StockAlertType alertType;
    private Integer thresholdQuantity;
    private Integer currentQuantity;
    private Boolean notified;
    private Boolean resolved;
    private LocalDateTime notifiedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    public enum StockAlertType {
        LOW_STOCK,
        OUT_OF_STOCK,
        RESTOCKED
    }
}

