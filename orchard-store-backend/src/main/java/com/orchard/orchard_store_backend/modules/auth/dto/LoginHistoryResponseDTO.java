package com.orchard.orchard_store_backend.modules.auth.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistoryResponseDTO {

    private Long id;
    private LocalDateTime loginTime;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String browser;
    private String os;
    private String deviceType;
    private String failureReason;
}

