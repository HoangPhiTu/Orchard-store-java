package com.orchard.orchard_store_backend.security;

import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Custom UserDetailsService that loads User with eager fetching of roles and permissions
 * Maps JSONB permissions to Spring Security authorities
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Load user by email with eager fetching of roles and permissions
     * Entity Graph ensures userRoles and role.permissions are loaded to avoid LazyInitializationException
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        // Check if account is locked
        boolean isLocked = user.isAccountLocked() || user.getStatus() == User.Status.BANNED;
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(getAuthorities(user))
                .accountExpired(false)
                .accountLocked(isLocked)
                .credentialsExpired(false)
                .disabled(user.getStatus() != User.Status.ACTIVE)
                .build();
    }
    
    /**
     * Extract authorities from User's roles and permissions
     * 
     * Authorities format:
     * - ROLE_ADMIN, ROLE_STAFF (from role.roleCode)
     * - product:view, product:create (from role.permissions JSONB)
     * - order:view (from additionalPermissions JSONB - overrides role permissions)
     * 
     * Example permissions JSONB:
     * {
     *   "product": ["view", "create", "update", "delete"],
     *   "order": ["view", "update"]
     * }
     */
    public Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // 1. Add role authorities (ROLE_ADMIN, ROLE_STAFF, etc.)
        if (user.getPrimaryRole() != null) {
            String roleCode = user.getPrimaryRole().getRoleCode().toUpperCase();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleCode));
        }
        
        // 2. Add role-based permissions from userRoles
        if (user.getUserRoles() != null) {
            for (UserRole userRole : user.getUserRoles()) {
                if (Boolean.TRUE.equals(userRole.getIsActive()) && 
                    (userRole.getExpiresAt() == null || userRole.getExpiresAt().isAfter(java.time.LocalDateTime.now()))) {
                    
                    Role role = userRole.getRole();
                    if (role != null) {
                        // Add role code as authority
                        String roleCode = role.getRoleCode().toUpperCase();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleCode));
                        
                        // Extract permissions from role.permissions JSONB
                        if (role.getPermissions() != null) {
                            extractPermissionsFromJsonb(role.getPermissions(), authorities);
                        }
                    }
                }
            }
        }
        
        // 3. Add/override with additionalPermissions from user (JSONB)
        if (user.getAdditionalPermissions() != null && !user.getAdditionalPermissions().isEmpty()) {
            extractPermissionsFromJsonb(user.getAdditionalPermissions(), authorities);
        }
        
        // 4. Legacy role support (backward compatibility)
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        }
        
        return authorities;
    }
    
    /**
     * Extract permissions from JSONB structure and add as authorities
     * 
     * JSONB structure: { "resource": ["action1", "action2"], ... }
     * Converts to: resource:action1, resource:action2, ...
     */
    private void extractPermissionsFromJsonb(Map<String, Object> permissionsJsonb, Set<GrantedAuthority> authorities) {
        if (permissionsJsonb == null || permissionsJsonb.isEmpty()) {
            return;
        }
        
        for (Map.Entry<String, Object> entry : permissionsJsonb.entrySet()) {
            String resource = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof List) {
                // Handle array of actions: ["view", "create"]
                @SuppressWarnings("unchecked")
                List<String> actions = (List<String>) value;
                for (String action : actions) {
                    authorities.add(new SimpleGrantedAuthority(resource + ":" + action));
                }
            } else if (value instanceof String) {
                // Handle single action: "view"
                authorities.add(new SimpleGrantedAuthority(resource + ":" + value));
            }
        }
    }
    
    /**
     * Get user with authorities (for use in controllers/services)
     */
    @Transactional(readOnly = true)
    public User getUserWithAuthorities(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}

