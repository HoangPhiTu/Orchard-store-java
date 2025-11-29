package com.orchard.orchard_store_backend.security;

import com.orchard.orchard_store_backend.config.properties.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * JWT Token Provider for generating and validating JWT tokens
 * Embeds userId, email, and authorities (roles + permissions) into token claims
 */
@Component
public class JwtTokenProvider {
    
    @Autowired
    private JwtProperties jwtProperties;
    
    private SecretKey getSigningKey() {
        try {
            // Use UTF-8 encoding explicitly to avoid encoding issues
            return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create signing key", e);
        }
    }
    
    /**
     * Generate access token with userId, email, and authorities
     * 
     * @param userId User ID
     * @param email User email
     * @param authorities Collection of authorities (roles + permissions)
     * @return JWT access token
     */
    public String generateAccessToken(Long userId, String email, Collection<? extends GrantedAuthority> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        
        // Extract roles (ROLE_*) and permissions (resource:action)
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .collect(Collectors.toList());
        
        List<String> permissions = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toList());
        
        claims.put("roles", roles);
        claims.put("authorities", permissions);
        
        return createToken(claims, email, jwtProperties.getExpirationMs());
    }
    
    /**
     * Generate refresh token (long-lived, minimal claims)
     * 
     * @param userId User ID
     * @param email User email
     * @return JWT refresh token
     */
    public String generateRefreshToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("type", "refresh");
        
        return createToken(claims, email, jwtProperties.getLongLivedExpirationMs());
    }
    
    /**
     * Generate token with remember me (long-lived access token)
     */
    public String generateLongLivedToken(Long userId, String email, Collection<? extends GrantedAuthority> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("rememberMe", true);
        
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .collect(Collectors.toList());
        
        List<String> permissions = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toList());
        
        claims.put("roles", roles);
        claims.put("authorities", permissions);
        
        return createToken(claims, email, jwtProperties.getLongLivedExpirationMs());
    }
    
    private String createToken(Map<String, Object> claims, String subject, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    public Long getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get("userId", Long.class));
    }
    
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object roles = claims.get("roles");
            if (roles instanceof List) {
                return (List<String>) roles;
            }
            return Collections.emptyList();
        });
    }
    
    @SuppressWarnings("unchecked")
    public List<String> getAuthoritiesFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object authorities = claims.get("authorities");
            if (authorities instanceof List) {
                return (List<String>) authorities;
            }
            return Collections.emptyList();
        });
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Validate token signature and expiration
     */
    public Boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get Authentication object from token
     * Used by JwtAuthenticationFilter to set SecurityContext
     */
    public Authentication getAuthentication(String token) {
        String email = getEmailFromToken(token);
        List<String> roles = getRolesFromToken(token);
        List<String> permissions = getAuthoritiesFromToken(token);
        
        // Combine roles and permissions into authorities
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        roles.forEach(role -> authorities.add(new SimpleGrantedAuthority(role)));
        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission)));
        
        return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                email,
                null,
                authorities
        );
    }
    
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
}

