package com.orchard.orchard_store_backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DataInitializer: Tự động tạo dữ liệu mặc định khi backend khởi động
 * - Tạo các roles mặc định nếu chưa có
 * - Tạo tài khoản admin mặc định
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRoleRepository userRoleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void run(String... args) {
        try {
            logger.info("🚀 Starting data initialization...");
            
            // 1. Đảm bảo các roles mặc định đã được tạo
            ensureDefaultRolesExist();
            
            // 2. Tạo tài khoản admin mặc định
            createDefaultAdminAccount();
            
            logger.info("✅ Data initialization completed successfully");
            
        } catch (DataAccessException e) {
            logger.error("❌ Database error during initialization: {}", e.getMessage());
            logger.warn("⚠️ Please check database connection and restart the application");
            // Không throw exception để app vẫn có thể start
        } catch (Exception e) {
            logger.error("❌ Unexpected error during initialization: {}", e.getMessage(), e);
            // Không throw exception để app vẫn có thể start
        }
    }
    
    /**
     * Đảm bảo các roles mặc định đã được tạo trong database
     */
    private void ensureDefaultRolesExist() {
        logger.info("📋 Checking default roles...");
        
        // Danh sách roles mặc định cần có
        String[][] defaultRoles = {
            {"SUPER_ADMIN", "Super Administrator", "Full system access with all permissions", "10", "{\"*\": [\"*\"]}"},
            {"ADMIN", "Administrator", "Full access to all modules except system settings", "9", 
             "{\"products\": [\"*\"], \"orders\": [\"*\"], \"customers\": [\"*\"], \"categories\": [\"*\"], \"brands\": [\"*\"], \"concentrations\": [\"*\"], \"inventory\": [\"*\"], \"analytics\": [\"read\"]}"},
            {"MANAGER", "Manager", "Can manage products, orders, and view analytics", "7", 
             "{\"products\": [\"create\", \"read\", \"update\"], \"orders\": [\"read\", \"update\"], \"customers\": [\"read\"], \"analytics\": [\"read\"]}"},
            {"STAFF", "Staff", "Can view and update orders, limited product access", "5", 
             "{\"orders\": [\"read\", \"update\"], \"products\": [\"read\"], \"customers\": [\"read\"]}"},
            {"VIEWER", "Viewer", "Read-only access to all modules", "3", "{\"*\": [\"read\"]}"}
        };
        
        for (String[] roleData : defaultRoles) {
            String roleCode = roleData[0];
            String roleName = roleData[1];
            String description = roleData[2];
            int hierarchyLevel = Integer.parseInt(roleData[3]);
            String permissionsJson = roleData[4];
            
            roleRepository.findByRoleCode(roleCode).ifPresentOrElse(
                role -> logger.debug("✅ Role {} already exists", roleCode),
                () -> {
                    try {
                        // Parse JSON string to Map
                        Map<String, Object> permissionsMap = parseJsonToMap(permissionsJson);
                        
                        Role newRole = Role.builder()
                                .roleCode(roleCode)
                                .roleName(roleName)
                                .description(description)
                                .hierarchyLevel(hierarchyLevel)
                                .permissions(permissionsMap)
                                .status("ACTIVE")
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        
                        roleRepository.save(newRole);
                        logger.info("✅ Created default role: {} ({})", roleName, roleCode);
                    } catch (Exception e) {
                        logger.warn("⚠️ Failed to create role {}: {}", roleCode, e.getMessage());
                    }
                }
            );
        }
    }
    
    /**
     * Tạo tài khoản admin mặc định nếu chưa tồn tại
     */
    private void createDefaultAdminAccount() {
        String adminEmail = "tuhoang.170704@gmail.com";
        String adminPassword = "admin123";
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Kiểm tra xem user đã tồn tại chưa
        boolean userExists = userRepository.existsByEmail(adminEmail);
        
        if (!userExists) {
            logger.info("📝 Creating new admin account...");
            
            // 2. Tìm hoặc tạo Role ADMIN
            Role adminRole = roleRepository.findByRoleCode("ADMIN")
                    .or(() -> roleRepository.findByRoleCode("SUPER_ADMIN"))
                    .or(() -> roleRepository.findByRoleCode("ROLE_ADMIN"))
                    .orElseGet(() -> {
                        logger.warn("⚠️ ADMIN role not found, creating it...");
                        try {
                            String adminPermissionsJson = "{\"products\": [\"*\"], \"orders\": [\"*\"], \"customers\": [\"*\"], \"categories\": [\"*\"], \"brands\": [\"*\"], \"concentrations\": [\"*\"], \"inventory\": [\"*\"], \"analytics\": [\"read\"]}";
                            Map<String, Object> adminPermissions = parseJsonToMap(adminPermissionsJson);
                            
                            Role newAdminRole = Role.builder()
                                    .roleCode("ADMIN")
                                    .roleName("Administrator")
                                    .description("Full access to all modules except system settings")
                                    .hierarchyLevel(9)
                                    .permissions(adminPermissions)
                                    .status("ACTIVE")
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build();
                            return roleRepository.save(newAdminRole);
                        } catch (Exception e) {
                            logger.error("❌ Failed to create ADMIN role: {}", e.getMessage());
                            throw new RuntimeException("Cannot create ADMIN role", e);
                        }
                    });
            
            logger.info("✅ Using admin role: {} ({})", adminRole.getRoleName(), adminRole.getRoleCode());
            
            // 3. Tạo User
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
            logger.info("✅ User created with ID: {}", savedUser.getId());
            
            // 4. Tạo UserRole (quan trọng cho RBAC)
            UserRole userRole = UserRole.builder()
                    .user(savedUser)
                    .role(adminRole)
                    .assignedBy(savedUser)
                    .isActive(true)
                    .assignedAt(now)
                    .build();
            
            userRoleRepository.save(userRole);
            logger.info("✅ UserRole created linking User ID {} with Role ID {}", 
                    savedUser.getId(), adminRole.getId());
            
            logger.info("========================================");
            logger.info("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY");
            logger.info("Email: {}", adminEmail);
            logger.info("Password: {}", adminPassword);
            logger.info("User ID: {}", savedUser.getId());
            logger.info("Role: {} ({})", adminRole.getRoleName(), adminRole.getRoleCode());
            logger.info("Role ID: {}", adminRole.getId());
            logger.info("========================================");
            
        } else {
            logger.info("ℹ️ Admin account already exists: {}", adminEmail);
            
            // Kiểm tra và fix nếu user tồn tại nhưng thiếu role
            User existingUser = userRepository.findByEmail(adminEmail)
                    .orElse(null);
            
            if (existingUser != null) {
                boolean hasActiveRoles = existingUser.getUserRoles() != null && 
                        existingUser.getUserRoles().stream()
                                .anyMatch(ur -> ur.getIsActive() != null && ur.getIsActive());
                
                if (!hasActiveRoles) {
                    logger.warn("⚠️ Admin user exists but has no active roles. Attempting to fix...");
                    
                    Role adminRole = roleRepository.findByRoleCode("ADMIN")
                            .or(() -> roleRepository.findByRoleCode("SUPER_ADMIN"))
                            .or(() -> roleRepository.findByRoleCode("ROLE_ADMIN"))
                            .orElse(null);
                    
                    if (adminRole != null) {
                        // Kiểm tra xem UserRole đã tồn tại chưa (query thủ công)
                        boolean userRoleExists = userRoleRepository.findAll().stream()
                                .anyMatch(ur -> ur.getUser().getId().equals(existingUser.getId()) && 
                                              ur.getRole().getId().equals(adminRole.getId()));
                        
                        if (!userRoleExists) {
                            UserRole userRole = UserRole.builder()
                                    .user(existingUser)
                                    .role(adminRole)
                                    .assignedBy(existingUser)
                                    .isActive(true)
                                    .assignedAt(LocalDateTime.now())
                                    .build();
                            
                            userRoleRepository.save(userRole);
                            logger.info("✅ Fixed: Added role {} ({}) to existing admin user", 
                                    adminRole.getRoleName(), adminRole.getRoleCode());
                        }
                        
                        // Cập nhật primary_role_id nếu chưa có
                        if (existingUser.getPrimaryRole() == null || 
                            !existingUser.getPrimaryRole().getId().equals(adminRole.getId())) {
                            existingUser.setPrimaryRole(adminRole);
                            existingUser.setUpdatedAt(LocalDateTime.now());
                            userRepository.save(existingUser);
                            logger.info("✅ Updated primary role for admin user");
                        }
                    } else {
                        logger.error("❌ Cannot fix: No ADMIN role found in database");
                    }
                } else {
                    logger.info("✅ Admin account is valid with active roles");
                }
            }
        }
    }
    
    /**
     * Parse JSON string to Map<String, Object>
     */
    private Map<String, Object> parseJsonToMap(String jsonString) {
        try {
            if (jsonString == null || jsonString.trim().isEmpty()) {
                return new HashMap<>();
            }
            return objectMapper.readValue(jsonString, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.warn("⚠️ Failed to parse JSON string: {}. Using empty map.", jsonString);
            return new HashMap<>();
        }
    }
}
