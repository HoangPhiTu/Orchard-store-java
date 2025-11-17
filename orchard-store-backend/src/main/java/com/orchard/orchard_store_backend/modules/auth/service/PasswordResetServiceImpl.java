package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.config.properties.AppProperties;
import com.orchard.orchard_store_backend.config.properties.PasswordResetProperties;
import com.orchard.orchard_store_backend.modules.auth.dto.ForgotPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.ResetPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.PasswordResetToken;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.PasswordResetTokenRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetProperties passwordResetProperties;

    @Autowired
    private AppProperties appProperties;

    private static final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void requestPasswordReset(ForgotPasswordDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("If the email exists, a password reset link will be sent."));

        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long requestCount = tokenRepository.countUnusedTokensByUserSince(user, since);

        if (requestCount >= passwordResetProperties.getMaxRequestsPerDay()) {
            throw new RuntimeException("Too many password reset requests. Please try again later.");
        }

        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(passwordResetProperties.getTokenExpirationHours());

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        String resetUrl = appProperties.getFrontendUrl() + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), token, resetUrl);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findValidToken(
                request.getToken(),
                LocalDateTime.now()
        ).orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }

        if (resetToken.getUsed()) {
            throw new RuntimeException("Reset token has already been used. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.markTokenAsUsed(request.getToken(), LocalDateTime.now());

        emailService.sendPasswordResetSuccessEmail(user.getEmail(), user.getFullName());
    }

    @Override
    public boolean validateResetToken(String token) {
        return tokenRepository.findValidToken(token, LocalDateTime.now())
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredOrUsedTokens(LocalDateTime.now());
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}

