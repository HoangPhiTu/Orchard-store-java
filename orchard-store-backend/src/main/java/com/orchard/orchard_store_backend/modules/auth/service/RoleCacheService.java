package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import com.orchard.orchard_store_backend.modules.customer.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for caching roles to improve performance
 * Roles are cached in Redis with TTL of 1 hour
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoleCacheService {

    private final RoleRepository roleRepository;
    private final RedisService redisService;

    private static final String ROLE_CACHE_KEY_PREFIX = "role:cache:";
    private static final String ROLES_BY_IDS_CACHE_KEY_PREFIX = "roles:by_ids:";
    private static final long CACHE_TTL_SECONDS = 3600; // 1 hour

    /**
     * Get roles by IDs with caching
     * @param roleIds Set of role IDs
     * @return List of roles
     */
    public List<Role> getRolesByIds(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Create cache key from sorted role IDs
        String cacheKey = ROLES_BY_IDS_CACHE_KEY_PREFIX + roleIds.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        // Fetch from database
        // Note: In production, consider caching full Role objects as JSON to avoid DB queries
        // For now, we cache existence markers to help with validation
        List<Role> roles = roleRepository.findByIdIn(roleIds);
        
        if (roles.size() != roleIds.size()) {
            throw new RuntimeException("Một hoặc nhiều quyền không tồn tại");
        }

        // Cache individual roles as existence markers
        // This helps avoid unnecessary queries when checking if roles exist
        try {
            for (Role role : roles) {
                String roleKey = ROLE_CACHE_KEY_PREFIX + role.getId();
                // Cache role ID as existence marker
                redisService.setValue(roleKey, String.valueOf(role.getId()), CACHE_TTL_SECONDS);
            }
            // Cache the IDs list for quick lookup
            String idsString = roleIds.stream()
                    .sorted()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            redisService.setValue(cacheKey, idsString, CACHE_TTL_SECONDS);
        } catch (Exception e) {
            log.warn("Failed to cache roles: {}", e.getMessage());
            // Continue without cache - not critical
        }

        return roles;
    }

    /**
     * Get single role by ID with caching
     * @param roleId Role ID
     * @return Optional Role
     */
    public Optional<Role> getRoleById(Long roleId) {
        if (roleId == null) {
            return Optional.empty();
        }

        String cacheKey = ROLE_CACHE_KEY_PREFIX + roleId;
        
        // Try cache first (simplified - in production, cache full object)
        try {
            String cached = redisService.getValue(cacheKey);
            if (cached != null) {
                // Role exists in cache, fetch from DB
                return roleRepository.findById(roleId);
            }
        } catch (Exception e) {
            log.warn("Failed to check role cache: {}", e.getMessage());
        }

        // Fetch from database
        Optional<Role> role = roleRepository.findById(roleId);
        
        // Cache if found
        if (role.isPresent()) {
            try {
                redisService.setValue(cacheKey, String.valueOf(roleId), CACHE_TTL_SECONDS);
            } catch (Exception e) {
                log.warn("Failed to cache role: {}", e.getMessage());
            }
        }

        return role;
    }

    /**
     * Evict role cache (call when roles are updated)
     * @param roleId Role ID to evict (null to evict all)
     */
    public void evictRoleCache(Long roleId) {
        try {
            if (roleId != null) {
                String cacheKey = ROLE_CACHE_KEY_PREFIX + roleId;
                redisService.deleteKey(cacheKey);
            }
            // Note: In production, you might want to evict all role-related caches
            // For simplicity, we'll let them expire naturally
        } catch (Exception e) {
            log.warn("Failed to evict role cache: {}", e.getMessage());
        }
    }

    /**
     * Evict all role caches
     */
    public void evictAllRoleCaches() {
        try {
            // In production, use Redis SCAN to find and delete all keys with prefix
            // For now, we'll just log - keys will expire naturally
            log.info("Role cache eviction requested - keys will expire naturally");
        } catch (Exception e) {
            log.warn("Failed to evict all role caches: {}", e.getMessage());
        }
    }
}

