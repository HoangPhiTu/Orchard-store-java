package com.orchard.orchard_store_backend.modules.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private BigDecimal totalPurchaseAmount;
    private Integer availablePoints;

    private VipInfo vipInfo;

    @Builder.Default
    private List<OrderSummaryDTO> recentOrders = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VipInfo {
        private String currentTier;
        private BigDecimal discountRate;
        private String nextTier;
        private BigDecimal spendToNextTier;
        private Double progressPercent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSummaryDTO {
        private Long orderId;
        private String orderNumber;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdAt;
    }
}

