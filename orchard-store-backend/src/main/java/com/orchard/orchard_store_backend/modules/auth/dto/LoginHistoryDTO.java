package com.orchard.orchard_store_backend.modules.auth.dto;

import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistoryDTO {

    private Long id;
    private Long userId;
    private String userEmail;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private String browser;
    private String os;
    private String location;
    private String loginStatus;
    private String failureReason;
    private LocalDateTime loginAt;

    public static LoginHistoryDTO fromEntity(LoginHistory loginHistory) {
        return LoginHistoryDTO.builder()
                .id(loginHistory.getId())
                .userId(loginHistory.getUser().getId())
                .userEmail(loginHistory.getUser().getEmail())
                .ipAddress(loginHistory.getIpAddress())
                .userAgent(loginHistory.getUserAgent())
                .deviceType(loginHistory.getDeviceType())
                .browser(loginHistory.getBrowser())
                .os(loginHistory.getOs())
                .location(loginHistory.getLocation())
                .loginStatus(loginHistory.getLoginStatus().name())
                .failureReason(loginHistory.getFailureReason())
                .loginAt(loginHistory.getLoginAt())
                .build();
    }
}

