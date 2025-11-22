package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.auth.dto.RoleResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller cho quản lý Roles (Admin only).
 * 
 * Security: Chỉ ADMIN mới được truy cập các endpoints này.
 * 
 * Các chức năng:
 * - Lấy danh sách tất cả roles (chỉ ACTIVE roles)
 */
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleRepository roleRepository;

    /**
     * Lấy danh sách tất cả roles (chỉ ACTIVE roles).
     * 
     * GET /api/admin/roles
     * 
     * @return List<RoleResponseDTO> wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponseDTO>>> getAllRoles() {
        log.info("GET /api/admin/roles");
        
        // Lấy tất cả roles có status ACTIVE
        List<Role> roles = roleRepository.findAll().stream()
                .filter(role -> "ACTIVE".equalsIgnoreCase(role.getStatus()))
                .collect(Collectors.toList());
        
        // Map to DTO
        List<RoleResponseDTO> roleDTOs = roles.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách roles thành công", roleDTOs)
        );
    }

    /**
     * Map Role entity to RoleResponseDTO
     */
    private RoleResponseDTO toDTO(Role role) {
        return RoleResponseDTO.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .hierarchyLevel(role.getHierarchyLevel())
                .status(role.getStatus())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}

