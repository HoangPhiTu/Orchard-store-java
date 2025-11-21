package com.orchard.orchard_store_backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request gửi OTP để reset password.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendOtpRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    private String email;
}

