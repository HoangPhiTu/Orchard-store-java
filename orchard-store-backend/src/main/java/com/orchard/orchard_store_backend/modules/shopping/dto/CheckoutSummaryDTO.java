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
public class CheckoutSummaryDTO {

    @Builder.Default
    private List<ItemSummary> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal vipDiscountRate;
    private BigDecimal vipDiscountAmount;
    private BigDecimal voucherDiscount;
    private String voucherCode;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;

    private String currentTier;
    private String nextTier;
    private BigDecimal spendToNextTier;
    private Double progressPercent;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemSummary {
        private Long productVariantId;
        private String productName;
        private String variantName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }
}

