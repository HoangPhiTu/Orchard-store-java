package com.orchard.orchard_store_backend.modules.shopping.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutItemDTO {

    @NotNull
    private Long productVariantId;

    @NotNull
    @Min(1)
    private Integer quantity;
}

