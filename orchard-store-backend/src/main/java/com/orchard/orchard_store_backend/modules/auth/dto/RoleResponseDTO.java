package com.orchard.orchard_store_backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponseDTO {
    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
    private Integer hierarchyLevel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

