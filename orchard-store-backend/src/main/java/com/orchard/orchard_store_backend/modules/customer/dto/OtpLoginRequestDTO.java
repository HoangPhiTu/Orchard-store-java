package com.orchard.orchard_store_backend.modules.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request gửi OTP login.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpLoginRequestDTO {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
}

