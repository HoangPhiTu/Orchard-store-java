package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.AuthRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.AuthResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.mapper.UserMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.auth.validation.PasswordValidator;
import com.orchard.orchard_store_backend.security.CustomUserDetailsService;
import com.orchard.orchard_store_backend.security.JwtTokenProvider;
import com.orchard.orchard_store_backend.exception.AccountLockedException;
import com.orchard.orchard_store_backend.exception.InvalidCredentialsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private LoginHistoryService loginHistoryService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordValidator passwordValidator;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public AuthResponseDTO login(AuthRequestDTO request, HttpServletRequest httpRequest) {
        // Note: This method may not be used if AuthController handles login directly
        // But if used, fetch with roles for authorities
        User user = userRepository.findByEmailWithRolesAndPermissions(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isAccountLocked()) {
            if (httpRequest != null) {
                loginHistoryService.saveLoginHistory(user, httpRequest, LoginHistory.LoginStatus.LOCKED, "Account is currently locked");
            }
            throw new AccountLockedException("Account is locked. Please try again later or contact administrator.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            user.resetFailedLoginAttempts();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            if (httpRequest != null) {
                loginHistoryService.saveLoginHistory(user, httpRequest, LoginHistory.LoginStatus.SUCCESS, null);
            }

            // Get authorities from user
            var authorities = userDetailsService.getAuthorities(user);
            
            String token = Boolean.TRUE.equals(request.getRememberMe())
                    ? tokenProvider.generateLongLivedToken(user.getId(), user.getEmail(), authorities)
                    : tokenProvider.generateAccessToken(user.getId(), user.getEmail(), authorities);

            return AuthResponseDTO.builder()
                    .token(token)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build();
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            user.incrementFailedLoginAttempts();
            userRepository.save(user);

            if (httpRequest != null) {
                String failureReason = "Invalid email or password";
                loginHistoryService.saveLoginHistory(user, httpRequest, LoginHistory.LoginStatus.FAILED, failureReason);
            }

            if (user.isAccountLocked()) {
                if (httpRequest != null) {
                    loginHistoryService.saveLoginHistory(user, httpRequest, LoginHistory.LoginStatus.LOCKED, "Account locked due to too many failed attempts");
                }
                throw new AccountLockedException("Account has been locked due to too many failed login attempts. Please try again in 30 minutes.");
            }

            int remainingAttempts = 5 - user.getFailedLoginAttempts();
            throw new InvalidCredentialsException(
                "Invalid email or password. " + remainingAttempts + " attempt(s) remaining.",
                remainingAttempts
            );
        }
    }

    @Override
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Use basic findByEmail for simple user info retrieval
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        // Validate password strength
        passwordValidator.validatePassword(newPassword);
        
        // Clear entity manager cache to ensure fresh data
        entityManager.clear();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Encode new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        
        // Update password
        user.setPassword(encodedPassword);
        user.setPasswordChangedAt(LocalDateTime.now());
        
        // Save user
        userRepository.save(user);
        
        // Flush to ensure changes are persisted immediately
        entityManager.flush();
        entityManager.clear();
        
        // Verify password was saved correctly by querying fresh from database
        User verifyUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after save"));
        
        boolean passwordMatches = passwordEncoder.matches(newPassword, verifyUser.getPassword());
        if (!passwordMatches) {
            throw new RuntimeException("Password was not saved correctly. Please try again.");
        }
    }
}

