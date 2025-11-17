package com.orchard.orchard_store_backend.modules.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "os", length = 100)
    private String os;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "login_status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoginStatus loginStatus = LoginStatus.SUCCESS;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @CreationTimestamp
    @Column(name = "login_at", nullable = false, updatable = false)
    private LocalDateTime loginAt;

    public enum LoginStatus {
        SUCCESS, FAILED, LOCKED
    }
}

