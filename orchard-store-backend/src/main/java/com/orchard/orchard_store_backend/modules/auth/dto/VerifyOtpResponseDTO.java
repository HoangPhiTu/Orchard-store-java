package com.orchard.orchard_store_backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho response verify OTP.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpResponseDTO {
    private String message;
    private String resetToken; // Token để dùng cho reset password
}

