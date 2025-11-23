package com.orchard.orchard_store_backend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Admin reset password của user khác.
 * 
 * Chỉ Admin mới được sử dụng endpoint này.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminResetPasswordDTO {
    
    /**
     * Mật khẩu mới (bắt buộc, tối thiểu 6 ký tự)
     */
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    private String newPassword;
}

