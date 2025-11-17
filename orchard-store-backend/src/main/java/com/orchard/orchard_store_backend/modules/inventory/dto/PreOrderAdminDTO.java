package com.orchard.orchard_store_backend.modules.inventory.dto;

import com.orchard.orchard_store_backend.modules.inventory.entity.PreOrder;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PreOrderAdminDTO {
    private Long id;
    private Long productVariantId;
    private String productVariantSku;
    private String productName;
    private Integer quantity;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate expectedRestockDate;
    private Boolean notificationSent;
    private LocalDateTime notificationSentAt;
    private PreOrder.PreOrderStatus status;
    private LocalDateTime createdAt;
    private String notes;
}

