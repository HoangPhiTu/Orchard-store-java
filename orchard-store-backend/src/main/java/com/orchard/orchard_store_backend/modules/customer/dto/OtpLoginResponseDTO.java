package com.orchard.orchard_store_backend.modules.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho response OTP login.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpLoginResponseDTO {

    /**
     * JWT access token
     */
    private String accessToken;

    /**
     * Token type (mặc định: Bearer)
     */
    @Builder.Default
    private String tokenType = "Bearer";

    /**
     * Thời gian hết hạn (seconds)
     */
    private Long expiresIn;

    /**
     * Customer info
     */
    private CustomerInfo customer;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerInfo {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
    }
}

