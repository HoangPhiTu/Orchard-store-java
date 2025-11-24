package com.orchard.orchard_store_backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmailChangeVerifyRequest {

    @NotNull(message = "UserId không được để trống")
    private Long userId;

    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String newEmail;

    @NotBlank(message = "OTP không được để trống")
    @Size(min = 6, max = 6, message = "OTP phải gồm 6 ký tự")
    private String otp;
}

