package com.orchard.orchard_store_backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho response gửi OTP.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendOtpResponseDTO {
    private String message;
    private Long expiresIn; // seconds
}

