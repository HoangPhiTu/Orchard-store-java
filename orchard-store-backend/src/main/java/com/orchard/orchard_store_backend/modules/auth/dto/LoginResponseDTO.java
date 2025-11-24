package com.orchard.orchard_store_backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn; // seconds
    private UserInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String fullName;
        private String phone; // Số điện thoại
        private String avatarUrl; // URL ảnh avatar
        private List<String> roles;
        private List<String> authorities;
    }
}

