package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.auth.dto.ChangePasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.LoginRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.LoginResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.SendOtpRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.SendOtpResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.VerifyOtpRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.VerifyOtpResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.exception.InvalidOtpException;
import com.orchard.orchard_store_backend.modules.auth.exception.RateLimitExceededException;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.auth.service.AdminOtpService;
import com.orchard.orchard_store_backend.modules.auth.service.AuthService;
import com.orchard.orchard_store_backend.modules.auth.service.LoginHistoryService;
import com.orchard.orchard_store_backend.modules.auth.service.PasswordResetService;
import com.orchard.orchard_store_backend.modules.auth.service.TokenBlacklistService;
import com.orchard.orchard_store_backend.exception.InvalidCredentialsException;
import com.orchard.orchard_store_backend.security.CustomUserDetailsService;
import com.orchard.orchard_store_backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminOtpService adminOtpService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private LoginHistoryService loginHistoryService;

    @PersistenceContext
    private EntityManager entityManager;

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
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO loginRequest,
            HttpServletRequest request
    ) {
        try {
            log.info("Login attempt for email: {}", loginRequest.getEmail());
            
            // Clear entity manager cache to ensure fresh data
            entityManager.clear();
            
            // Authenticate user (Spring Security will handle password verification and user loading)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            
            log.info("Authentication successful for email: {}", loginRequest.getEmail());

            // Get user from database with roles for authorities
            // Note: User was already loaded by Spring Security during authentication,
            // but we need to fetch again with roles for token generation
            User user = userRepository.findByEmailWithRolesAndPermissions(loginRequest.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("User not found after authentication"));

            // Check if account is locked (double-check after authentication)
            if (user.isAccountLocked()) {
                throw new BadCredentialsException("Account is locked. Please try again later.");
            }

            // Check if account is active (double-check after authentication)
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
                            .phone(user.getPhone()) // Thêm phone
                            .avatarUrl(user.getAvatarUrl()) // Thêm avatarUrl
                            .roles(roles)
                            .authorities(permissions)
                            .build())
                    .build();

            log.info("Login response built successfully. AccessToken length: {}, User ID: {}, Roles: {}", 
                    accessToken != null ? accessToken.length() : 0, 
                    user.getId(), 
                    roles);

            loginHistoryService.logLogin(
                    user,
                    request,
                    LoginHistory.LoginStatus.SUCCESS,
                    null
            );
            
            return ResponseEntity.ok(response);

        } catch (LockedException e) {
            log.error("Account locked for email: {}", loginRequest.getEmail());
            // Use basic findByEmail (no need for roles when logging locked status)
            User lockedUser = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            loginHistoryService.logLogin(
                    lockedUser,
                    request,
                    LoginHistory.LoginStatus.LOCKED,
                    "Tài khoản bị khóa"
            );
            throw e;
        } catch (BadCredentialsException e) {
            log.error("Authentication failed for email: {}", loginRequest.getEmail());
            log.error("BadCredentialsException message: {}", e.getMessage());
            
            // Handle failed login attempts - use basic findByEmail (no need for roles)
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (user != null) {
                log.info("User found. Failed attempts: {}, Locked: {}", 
                    user.getFailedLoginAttempts(), user.isAccountLocked());
                user.incrementFailedLoginAttempts();
                userRepository.save(user);
                log.info("Incremented failed login attempts. New count: {}", user.getFailedLoginAttempts());
                loginHistoryService.logLogin(
                        user,
                        request,
                        LoginHistory.LoginStatus.FAILED,
                        "Sai mật khẩu"
                );
            } else {
                log.warn("User not found for email: {}", loginRequest.getEmail());
                loginHistoryService.logLogin(
                        null,
                        request,
                        LoginHistory.LoginStatus.FAILED,
                        "Sai mật khẩu"
                );
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during login for email: {}", loginRequest.getEmail(), e);
            throw new BadCredentialsException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Change password (requires authentication)
     * PUT /api/auth/change-password
     * 
     * Request body:
     * {
     *   "currentPassword": "oldPassword123",
     *   "newPassword": "newPassword123",
     *   "confirmPassword": "newPassword123"
     * }
     */
    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordDTO request) {
        try {
            // Validate passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(400, "New password and confirm password do not match"));
            }

            // Get current user email from authentication
            Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext()
                    .getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error(401, "Authentication required"));
            }

            String email = authentication.getName();
            
            // Use service method to change password (removes duplicate logic)
            try {
                authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
                log.info("Password changed successfully for user: {}", email);
                return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
            } catch (InvalidCredentialsException e) {
                log.warn("Password change failed: invalid current password for user: {}", email);
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(400, e.getMessage()));
            } catch (Exception e) {
                log.error("Error changing password for user: {}", email, e);
                return ResponseEntity.status(500)
                        .body(ApiResponse.error(500, "Failed to change password. Please try again."));
            }
            
        } catch (Exception e) {
            log.error("Error in change password endpoint", e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, e.getMessage() != null ? e.getMessage() : "Failed to change password. Please try again."));
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     * Blacklists the current JWT token
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        try {
            // Get token from request
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String token = bearerToken.substring(7);
                
                // Get token expiration
                try {
                    Date expiration = tokenProvider.getExpirationDateFromToken(token);
                    long expirationTime = expiration.getTime();
                    
                    // Blacklist token until expiration
                    tokenBlacklistService.blacklistToken(token, expirationTime);
                    log.info("Token blacklisted successfully");
                } catch (Exception e) {
                    log.warn("Failed to blacklist token: {}", e.getMessage());
                    // Continue anyway - token might be invalid or expired
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
            // Always return success to prevent information leakage
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
                .phone(user.getPhone()) // Thêm phone
                .avatarUrl(user.getAvatarUrl()) // Thêm avatarUrl
                .roles(roles)
                .authorities(permissions)
                .build();

        return ResponseEntity.ok(userInfo);
    }

    /**
     * Send OTP for password reset
     * POST /api/auth/send-otp
     * 
     * Request body:
     * {
     *   "email": "admin@example.com"
     * }
     * 
     * Response:
     * {
     *   "message": "OTP code has been sent to your email",
     *   "expiresIn": 300
     * }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<SendOtpResponseDTO>> sendOtp(@Valid @RequestBody SendOtpRequestDTO request) {
        try {
            adminOtpService.sendOtp(request.getEmail());
            
            SendOtpResponseDTO response = SendOtpResponseDTO.builder()
                    .message("OTP code has been sent to your email")
                    .expiresIn(300L) // 5 minutes
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
        } catch (RateLimitExceededException ex) {
            log.warn("Rate limit exceeded for email: {}", request.getEmail());
            return ResponseEntity.status(429)
                    .body(ApiResponse.error(429, ex.getMessage()));
        } catch (Exception e) {
            log.error("Error sending OTP to email: {}", request.getEmail(), e);
            // Don't reveal if email exists or not for security
            return ResponseEntity.ok(ApiResponse.success(
                    "If the email exists, an OTP code will be sent.",
                    SendOtpResponseDTO.builder()
                            .message("If the email exists, an OTP code will be sent.")
                            .expiresIn(300L)
                            .build()
            ));
        }
    }

    /**
     * Verify OTP and get reset token
     * POST /api/auth/verify-otp
     * 
     * Request body:
     * {
     *   "email": "admin@example.com",
     *   "otp": "123456"
     * }
     * 
     * Response:
     * {
     *   "message": "OTP verified successfully",
     *   "resetToken": "uuid-token"
     * }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponseDTO>> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO request) {
        try {
            String resetToken = adminOtpService.verifyOtp(request.getEmail(), request.getOtp());
            
            VerifyOtpResponseDTO response = VerifyOtpResponseDTO.builder()
                    .message("OTP verified successfully")
                    .resetToken(resetToken)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
        } catch (InvalidOtpException ex) {
            log.warn("Invalid OTP for email: {}", request.getEmail());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, ex.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying OTP for email: {}", request.getEmail(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, "Failed to verify OTP. Please try again."));
        }
    }

    /**
     * Reset password with OTP
     * POST /api/auth/reset-password
     * 
     * Request body:
     * {
     *   "email": "admin@example.com",
     *   "otp": "123456",
     *   "newPassword": "newPassword123",
     *   "confirmPassword": "newPassword123"
     * }
     */
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.orchard.orchard_store_backend.modules.auth.dto.ResetPasswordDTO request) {
        try {
            log.info("=== RESET PASSWORD REQUEST ===");
            log.info("Email: {}", request.getEmail());
            log.info("OTP: {}", request.getOtp() != null ? "***" : "NULL");
            log.info("New password length: {}", request.getNewPassword() != null ? request.getNewPassword().length() : 0);
            
            // Validate passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                log.warn("Passwords do not match");
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(400, "Passwords do not match"));
            }

            // OTP-based reset
            if (request.getEmail() != null && request.getOtp() != null) {
                // Clear entity manager cache before reset
                entityManager.clear();
                
                // Verify OTP or reset token
                boolean isValid = adminOtpService.verifyResetToken(request.getEmail(), request.getOtp());
                
                if (!isValid) {
                    // Try to verify OTP directly (in case verify-otp wasn't called)
                    try {
                        adminOtpService.verifyOtp(request.getEmail(), request.getOtp());
                    } catch (InvalidOtpException e) {
                        log.warn("Invalid OTP for email: {}", request.getEmail());
                        return ResponseEntity.status(400)
                                .body(ApiResponse.error(400, "Invalid or expired OTP. Please request a new one."));
                    }
                }

                // Use service method to reset password (ensures proper transaction handling)
                adminOtpService.resetPasswordWithOtp(request.getEmail(), request.getNewPassword());

                log.info("Password reset successfully for email: {}", request.getEmail());
                
                // Clear cache again after reset to ensure fresh data for next login
                entityManager.clear();
                
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
            }
            // Token-based reset (legacy - for backward compatibility)
            else if (request.getToken() != null) {
                // Use existing password reset service
                passwordResetService.resetPassword(request);
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
            } else {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(400, "Either email+otp or token is required"));
            }
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, e.getMessage() != null ? e.getMessage() : "Failed to reset password. Please try again."));
        }
    }
}
