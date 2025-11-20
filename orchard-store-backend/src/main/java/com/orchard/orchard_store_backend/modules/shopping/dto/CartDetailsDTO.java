package com.orchard.orchard_store_backend.modules.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDetailsDTO {

    @Builder.Default
    private List<CartItemDetailDTO> items = new ArrayList<>();

    private BigDecimal subtotal;

    private Integer totalQuantity;
}

