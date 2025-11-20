package com.orchard.orchard_store_backend.modules.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDetailDTO {

    private Long cartItemId;
    private Long productVariantId;
    private String productName;
    private String variantName;
    private String sku;
    private String thumbnailUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
}

