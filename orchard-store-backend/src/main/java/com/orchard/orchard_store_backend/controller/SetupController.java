package com.orchard.orchard_store_backend.controller;

import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Setup controller để tạo admin account.
 * 
 * ⚠️ SECURITY: Endpoint này nên được bảo vệ hoặc xóa sau khi tạo admin xong!
 * 
 * Usage: POST http://localhost:8080/api/setup/admin
 */
@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
@Slf4j
public class SetupController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/admin")
    public ResponseEntity<Map<String, Object>> createAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String adminEmail = "tuhoang.170704@gmail.com";
            String adminPassword = "admin123";
            LocalDateTime now = LocalDateTime.now();
            
            // Check if user exists
            boolean userExists = userRepository.existsByEmail(adminEmail);
            
            if (userExists) {
                // Fix existing user - check if has roles
                User existingUser = userRepository.findByEmail(adminEmail)
                        .orElse(null);
                
                if (existingUser != null) {
                    boolean hasRoles = existingUser.getUserRoles() != null && !existingUser.getUserRoles().isEmpty();
                    
                    if (!hasRoles) {
                        // Add role to existing user
                        Role adminRole = roleRepository.findByRoleCode("ROLE_ADMIN")
                                .or(() -> roleRepository.findByRoleCode("ADMIN"))
                                .or(() -> roleRepository.findByRoleCode("SUPER_ADMIN"))
                                .orElse(null);
                        
                        if (adminRole != null) {
                            UserRole userRole = UserRole.builder()
                                    .user(existingUser)
                                    .role(adminRole)
                                    .assignedBy(existingUser)
                                    .isActive(true)
                                    .assignedAt(now)
                                    .build();
                            
                            userRoleRepository.save(userRole);
                            
                            response.put("success", true);
                            response.put("message", "Admin account exists. Role has been added.");
                            response.put("email", adminEmail);
                            response.put("password", adminPassword);
                            response.put("userId", existingUser.getId());
                            response.put("roleId", adminRole.getId());
                            
                            log.info("✅ Fixed: Added role to existing admin user");
                            return ResponseEntity.ok(response);
                        } else {
                            response.put("success", false);
                            response.put("message", "Admin role not found in database");
                            return ResponseEntity.badRequest().body(response);
                        }
                    } else {
                        response.put("success", true);
                        response.put("message", "Admin account already exists with roles.");
                        response.put("email", adminEmail);
                        response.put("password", adminPassword);
                        response.put("userId", existingUser.getId());
                        return ResponseEntity.ok(response);
                    }
                }
            }
            
            // Find ADMIN role
            Role adminRole = roleRepository.findByRoleCode("ROLE_ADMIN")
                    .or(() -> roleRepository.findByRoleCode("ADMIN"))
                    .or(() -> roleRepository.findByRoleCode("SUPER_ADMIN"))
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found. Please ensure roles are migrated."));
            
            // Create User
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Administrator")
                    .phone("0900000000")
                    .role(User.LegacyRole.ADMIN)
                    .primaryRole(adminRole)
                    .status(User.Status.ACTIVE)
                    .failedLoginAttempts(0)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            
            User savedUser = userRepository.save(admin);
            log.info("✅ User created with ID: {}", savedUser.getId());
            
            // Create UserRole
            UserRole userRole = UserRole.builder()
                    .user(savedUser)
                    .role(adminRole)
                    .assignedBy(savedUser)
                    .isActive(true)
                    .assignedAt(now)
                    .build();
            
            userRoleRepository.save(userRole);
            log.info("✅ UserRole created linking User ID {} with Role ID {}", 
                    savedUser.getId(), adminRole.getId());
            
            response.put("success", true);
            response.put("message", "Admin account created successfully");
            response.put("email", adminEmail);
            response.put("password", adminPassword);
            response.put("userId", savedUser.getId());
            response.put("roleId", adminRole.getId());
            
            log.info("========================================");
            log.info("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY");
            log.info("Email: {}", adminEmail);
            log.info("Password: {}", adminPassword);
            log.info("========================================");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to create admin: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

