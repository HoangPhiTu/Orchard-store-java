package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.LoginResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.security.CustomUserDetailsService;
import com.orchard.orchard_store_backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Login endpoint
     * POST /api/auth/login
     * 
     * Request body:
     * {
     *   "email": "admin@example.com",
     *   "password": "password123",
     *   "rememberMe": false
     * }
     * 
     * Response:
     * {
     *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "tokenType": "Bearer",
     *   "expiresIn": 3600,
     *   "user": {
     *     "id": 1,
     *     "email": "admin@example.com",
     *     "fullName": "Admin User",
     *     "roles": ["ROLE_ADMIN"],
     *     "authorities": ["product:view", "product:create", "order:view"]
     *   }
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Get user details with authorities
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            // Check if account is locked
            if (user.isAccountLocked()) {
                throw new BadCredentialsException("Account is locked. Please try again later.");
            }

            // Check if account is active
            if (user.getStatus() != User.Status.ACTIVE) {
                throw new BadCredentialsException("Account is not active");
            }

            // Get authorities
            var authorities = userDetailsService.getAuthorities(user);

            // Generate tokens
            String accessToken;
            if (Boolean.TRUE.equals(loginRequest.getRememberMe())) {
                // Long-lived token (30 days)
                accessToken = tokenProvider.generateLongLivedToken(
                        user.getId(),
                        user.getEmail(),
                        authorities
                );
            } else {
                // Standard access token (1 hour)
                accessToken = tokenProvider.generateAccessToken(
                        user.getId(),
                        user.getEmail(),
                        authorities
                );
            }

            // Generate refresh token
            String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            user.resetFailedLoginAttempts();
            userRepository.save(user);

            // Extract roles and permissions for response
            List<String> roles = authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .collect(Collectors.toList());

            List<String> permissions = authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> !auth.startsWith("ROLE_"))
                    .collect(Collectors.toList());

            // Build response
            LoginResponseDTO response = LoginResponseDTO.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(loginRequest.getRememberMe() 
                            ? tokenProvider.getExpirationDateFromToken(accessToken).getTime() / 1000
                            : 3600L) // 1 hour in seconds
                    .user(LoginResponseDTO.UserInfo.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .roles(roles)
                            .authorities(permissions)
                            .build())
                    .build();

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Handle failed login attempts
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (user != null) {
                user.incrementFailedLoginAttempts();
                userRepository.save(user);
            }
            throw e;
        }
    }

    /**
     * Get current user info
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponseDTO.UserInfo> getCurrentUser() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        var authorities = userDetailsService.getAuthorities(user);

        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .collect(Collectors.toList());

        List<String> permissions = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toList());

        LoginResponseDTO.UserInfo userInfo = LoginResponseDTO.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .authorities(permissions)
                .build();

        return ResponseEntity.ok(userInfo);
    }
}
