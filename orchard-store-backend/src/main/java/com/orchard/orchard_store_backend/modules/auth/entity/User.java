package com.orchard.orchard_store_backend.modules.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // Legacy role field (backward compatibility)
    // Vẫn giữ để tương thích với code cũ, nhưng khuyến nghị dùng bảng user_roles
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private LegacyRole role = LegacyRole.ADMIN;

    // Enhanced role management (NEW - RBAC ready)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_role_id")
    private Role primaryRole;

    @Column(name = "primary_role_id", insertable = false, updatable = false)
    private Long primaryRoleId;

    // Additional permissions (JSONB) - override permissions from roles
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_permissions", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> additionalPermissions = Map.of();

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    // Security
    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "last_password_reset_request")
    private LocalDateTime lastPasswordResetRequest;

    // Metadata
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserRole> userRoles = new ArrayList<>();

    // Legacy enum (deprecated - use Role entity instead)
    public enum LegacyRole {
        ADMIN, STAFF
    }

    public enum Status {
        ACTIVE, INACTIVE, BANNED, SUSPENDED
    }

    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }
}

