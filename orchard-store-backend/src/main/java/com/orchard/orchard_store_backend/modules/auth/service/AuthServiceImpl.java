package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.AuthRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.AuthResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.mapper.UserMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.security.CustomUserDetailsService;
import com.orchard.orchard_store_backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    @Override
    public AuthResponseDTO login(AuthRequestDTO request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isAccountLocked()) {
            if (httpRequest != null) {
                loginHistoryService.saveLoginHistory(user, httpRequest, LoginHistory.LoginStatus.LOCKED, "Account is currently locked");
            }
            throw new RuntimeException("Account is locked. Please try again later or contact administrator.");
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
                throw new RuntimeException("Account has been locked due to too many failed login attempts. Please try again in 30 minutes.");
            }

            int remainingAttempts = 5 - user.getFailedLoginAttempts();
            throw new RuntimeException("Invalid email or password. " + remainingAttempts + " attempt(s) remaining.");
        }
    }

    @Override
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toDTO(user);
    }

    @Override
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

