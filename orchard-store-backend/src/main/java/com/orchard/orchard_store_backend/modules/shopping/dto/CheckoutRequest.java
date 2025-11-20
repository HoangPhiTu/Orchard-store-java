package com.orchard.orchard_store_backend.modules.shopping.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class CheckoutRequest {

    /**
     * Session ID dùng cho guest checkout (optional nếu đã login).
     */
    private String sessionId;

    /**
     * Items trong giỏ hàng.
     */
    @Valid
    @NotEmpty
    @Builder.Default
    private List<CheckoutItemDTO> items = new ArrayList<>();

    private String voucherCode;

    /**
     * Thông tin khách hàng (để lấy VIP tier, thông tin liên hệ).
     */
    @Valid
    private CheckoutCustomerInfo customer;

    private BigDecimal shippingFee;
    private BigDecimal voucherDiscount;

    private String shippingAddress;
    private String shippingCity;
    private String shippingDistrict;
    private String shippingWard;
    private String shippingPostalCode;

    private String paymentMethod;
    private String shippingMethod;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutCustomerInfo {
        private Long customerId;

        @NotNull
        private String fullName;

        @NotNull
        private String email;

        @NotNull
        private String phone;
    }
}

