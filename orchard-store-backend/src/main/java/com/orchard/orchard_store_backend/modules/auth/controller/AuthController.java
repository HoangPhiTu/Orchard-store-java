package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.modules.auth.dto.AuthRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.AuthResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.ChangePasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.ForgotPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.ResetPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.auth.service.AuthService;
import com.orchard.orchard_store_backend.modules.auth.service.LoginHistoryService;
import com.orchard.orchard_store_backend.modules.auth.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private LoginHistoryService loginHistoryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody AuthRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        AuthResponseDTO response = authService.login(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "New password and confirm password do not match");
            return ResponseEntity.badRequest().body(error);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/login-history")
    public ResponseEntity<Page<LoginHistoryDTO>> getLoginHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "loginAt"));

        Page<LoginHistoryDTO> history;
        if (status != null && !status.isEmpty()) {
            try {
                LoginHistory.LoginStatus loginStatus = LoginHistory.LoginStatus.valueOf(status.toUpperCase());
                history = loginHistoryService.getLoginHistoryByStatus(user, loginStatus, pageable);
            } catch (IllegalArgumentException e) {
                history = loginHistoryService.getLoginHistory(user, pageable);
            }
        } else {
            history = loginHistoryService.getLoginHistory(user, pageable);
        }

        return ResponseEntity.ok(history);
    }

    @GetMapping("/login-history/recent")
    public ResponseEntity<List<LoginHistoryDTO>> getRecentLoginHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LoginHistoryDTO> history = loginHistoryService.getRecentLoginHistory(user, 10);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/login-history/stats")
    public ResponseEntity<Map<String, Object>> getLoginStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long successfulCount = loginHistoryService.getSuccessfulLoginCount(user);
        long failedCount = loginHistoryService.getFailedLoginCount(user);
        LoginHistoryDTO lastSuccessful = loginHistoryService.getLastSuccessfulLogin(user);

        Map<String, Object> stats = new HashMap<>();
        stats.put("successfulCount", successfulCount);
        stats.put("failedCount", failedCount);
        stats.put("lastSuccessfulLogin", lastSuccessful);

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordDTO request) {
        try {
            passwordResetService.requestPasswordReset(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "If the email exists, a password reset link has been sent.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "If the email exists, a password reset link has been sent.");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordDTO request) {
        passwordResetService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully. Please login with your new password.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        if (!isValid) {
            response.put("message", "Invalid or expired reset token");
        }
        return ResponseEntity.ok(response);
    }
}

