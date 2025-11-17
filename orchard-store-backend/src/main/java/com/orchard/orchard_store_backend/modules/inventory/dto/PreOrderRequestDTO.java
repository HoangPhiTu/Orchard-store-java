package com.orchard.orchard_store_backend.modules.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PreOrderRequestDTO {

    @NotNull
    private Long productVariantId;

    @Min(1)
    private Integer quantity;

    @NotBlank
    private String customerName;

    @NotBlank
    private String customerPhone;

    private String customerEmail;

    private String notes;
}

