package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.customer.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Service for managing JWT token blacklist
 * Tokens are blacklisted in Redis until they expire
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisService redisService;
    
    private static final String BLACKLIST_KEY_PREFIX = "jwt:blacklist:";

    /**
     * Blacklist a token until its expiration time
     * @param token The JWT token to blacklist
     * @param expirationTime Token expiration time in milliseconds
     */
    public void blacklistToken(String token, long expirationTime) {
        try {
            long now = System.currentTimeMillis();
            long ttl = expirationTime - now;
            
            if (ttl > 0) {
                // Store token in blacklist with TTL matching token expiration
                String key = BLACKLIST_KEY_PREFIX + token;
                redisService.setValue(key, "1", ttl / 1000); // Convert to seconds
                log.debug("Token blacklisted until: {}", new Date(expirationTime));
            } else {
                log.debug("Token already expired, no need to blacklist");
            }
        } catch (Exception e) {
            log.error("Failed to blacklist token", e);
            // Don't throw - blacklisting is best effort
        }
    }

    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     * @return true if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            String key = BLACKLIST_KEY_PREFIX + token;
            String value = redisService.getValue(key);
            return value != null;
        } catch (Exception e) {
            log.warn("Failed to check token blacklist: {}", e.getMessage());
            // On error, assume token is not blacklisted (fail open)
            return false;
        }
    }

    /**
     * Remove token from blacklist (e.g., for testing or manual cleanup)
     * @param token The JWT token to remove from blacklist
     */
    public void removeFromBlacklist(String token) {
        try {
            String key = BLACKLIST_KEY_PREFIX + token;
            redisService.deleteKey(key);
            log.debug("Token removed from blacklist");
        } catch (Exception e) {
            log.warn("Failed to remove token from blacklist: {}", e.getMessage());
        }
    }
}

