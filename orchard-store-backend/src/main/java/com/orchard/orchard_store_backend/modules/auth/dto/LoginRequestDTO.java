package com.orchard.orchard_store_backend.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @Builder.Default
    @JsonProperty("rememberMe") // Primary field name
    private Boolean rememberMe = false;
    
    // Support 'remember' field from frontend (alias for rememberMe)
    @JsonProperty("remember")
    public void setRemember(Boolean remember) {
        this.rememberMe = remember != null ? remember : false;
    }
}

