package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.exception.InvalidOtpException;
import com.orchard.orchard_store_backend.modules.auth.exception.RateLimitExceededException;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.customer.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * Service xử lý OTP cho Admin password reset.
 *
 * Flow:
 * 1. Admin nhập email -> sendOtp() -> Tạo OTP, lưu Redis, gửi email
 * 2. Admin nhập OTP -> verifyOtp() -> Verify OTP, trả về reset token
 * 3. Admin reset password với reset token
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminOtpService {

    private final UserRepository userRepository;
    private final RedisService redisService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    @PersistenceContext
    private EntityManager entityManager;

    private static final String OTP_KEY_PREFIX = "admin:otp:";
    private static final String OTP_RATE_LIMIT_KEY_PREFIX = "admin:otp_limit:";
    private static final String RESET_TOKEN_KEY_PREFIX = "admin:reset_token:";
    private static final String EMAIL_CHANGE_OTP_PREFIX = "user:email_change_otp:";

    private static final long OTP_TTL_SECONDS = 300; // 5 phút
    private static final long OTP_RATE_LIMIT_TTL_SECONDS = 300; // 5 phút
    private static final long RESET_TOKEN_TTL_SECONDS = 600; // 10 phút
    private static final int OTP_RATE_LIMIT_MAX_ATTEMPTS = 5;

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Gửi OTP code qua email cho Admin password reset.
     *
     * @param email Email của admin
     */
    public void sendOtp(String email) {
        log.info("Request OTP for admin email: {}", email);

        // 1. Check rate limit
        checkRateLimit(email);

        // 2. Tìm user (phải là admin)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("If the email exists, an OTP code will be sent."));

        // Check if user is admin
        if (user.getRole() == null || !user.getRole().name().contains("ADMIN")) {
            throw new RuntimeException("If the email exists, an OTP code will be sent.");
        }

        // 3. Generate OTP
        String otpCode = generateOtpCode();

        // 4. Lưu OTP vào Redis
        String redisKey = buildOtpKey(email);
        redisService.setValue(redisKey, otpCode, OTP_TTL_SECONDS);
        log.debug("OTP saved to Redis key: {}, TTL: {} seconds", redisKey, OTP_TTL_SECONDS);

        // 5. Gửi email
        emailService.sendOtpEmail(email, otpCode, user.getFullName());
        log.info("OTP sent to admin email: {}", email);
    }

    /**
     * Verify OTP và trả về reset token.
     *
     * @param email Email của admin
     * @param otp   OTP code
     * @return Reset token để dùng cho reset password
     */
    public String verifyOtp(String email, String otp) {
        log.info("Verifying OTP for admin email: {}", email);

        String redisKey = buildOtpKey(email);
        String storedOtp = redisService.getValue(redisKey);

        if (storedOtp == null || storedOtp.isEmpty()) {
            log.warn("OTP expired or missing for email: {}", email);
            throw new InvalidOtpException("OTP code is invalid or expired. Please request a new one.");
        }

        if (!storedOtp.equals(otp)) {
            log.warn("OTP mismatch for email: {}", email);
            throw new InvalidOtpException("OTP code is incorrect. Please try again.");
        }

        // Không xóa OTP ngay, để dùng lại khi reset password
        // Chỉ đánh dấu là đã verify bằng cách tạo reset token
        String resetToken = UUID.randomUUID().toString();
        String resetTokenKey = buildResetTokenKey(email);
        redisService.setValue(resetTokenKey, resetToken, RESET_TOKEN_TTL_SECONDS);
        log.debug("Reset token saved to Redis key: {}, TTL: {} seconds", resetTokenKey, RESET_TOKEN_TTL_SECONDS);

        log.info("OTP verified successfully for email: {}", email);
        return resetToken;
    }

    /**
     * Verify reset token hoặc OTP (dùng khi reset password).
     *
     * @param email       Email của admin
     * @param resetToken  Reset token (UUID) hoặc OTP (6 digits)
     * @return true nếu token hợp lệ
     */
    public boolean verifyResetToken(String email, String resetToken) {
        // Check if it's a reset token (UUID format) - từ verify-otp
        String resetTokenKey = buildResetTokenKey(email);
        String storedToken = redisService.getValue(resetTokenKey);

        if (storedToken != null && storedToken.equals(resetToken)) {
            return true;
        }

        // Check if it's an OTP (6 digits) - cho phép reset trực tiếp với OTP
        String otpKey = buildOtpKey(email);
        String storedOtp = redisService.getValue(otpKey);
        
        if (storedOtp != null && storedOtp.equals(resetToken)) {
            return true;
        }

        log.warn("Invalid reset token/OTP for email: {}", email);
        return false;
    }

    /**
     * Reset password với OTP đã verify.
     *
     * @param email Email của admin
     * @param newPassword Password mới (plain text)
     */
    @Transactional
    public void resetPasswordWithOtp(String email, String newPassword) {
        log.info("=== RESET PASSWORD WITH OTP ===");
        log.info("Email: {}", email);
        log.info("New password (plain): {}", newPassword != null ? "***" : "NULL");
        
        // Clear entity manager cache first
        entityManager.clear();
        
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        log.info("User found. ID: {}, Current password hash: {}", user.getId(), user.getPassword());
        
        // Encode new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        log.info("New password encoded. Hash: {}", encodedPassword);
        
        // Verify encoding works before saving
        boolean testMatch = passwordEncoder.matches(newPassword, encodedPassword);
        log.info("Test password match (before save): {}", testMatch ? "SUCCESS" : "FAILED");
        
        if (!testMatch) {
            log.error("CRITICAL: Password encoding failed! Cannot match new password against encoded hash.");
            throw new RuntimeException("Password encoding failed. Please try again.");
        }
        
        // Update password
        user.setPassword(encodedPassword);
        
        // Reset failed login attempts and unlock account
        user.resetFailedLoginAttempts();
        
        // Update password changed timestamp
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        
        // Save user
        userRepository.save(user);
        
        // Flush to ensure changes are persisted immediately
        entityManager.flush();
        entityManager.clear();
        
        log.info("User password saved. Flushed to database.");
        
        // Verify password was saved correctly by querying fresh from database
        User verifyUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after save"));
        
        log.info("Verifying saved password...");
        log.info("Plain password: {}", newPassword);
        log.info("Stored hash: {}", verifyUser.getPassword());
        
        boolean passwordMatches = passwordEncoder.matches(newPassword, verifyUser.getPassword());
        log.info("Password verification after save: {}", passwordMatches ? "SUCCESS" : "FAILED");
        
        if (!passwordMatches) {
            log.error("CRITICAL: Password was not saved correctly for user: {}", email);
            log.error("Trying to match: '{}' against hash: '{}'", newPassword, verifyUser.getPassword());
            throw new RuntimeException("Password was not saved correctly. Please try again.");
        }
        
        log.info("Password reset successful for user: {}", email);
        
        // Delete reset token and OTP
        deleteResetToken(email);
    }

    /**
     * Xóa reset token và OTP sau khi đã reset password thành công.
     *
     * @param email Email của admin
     */
    public void deleteResetToken(String email) {
        String resetTokenKey = buildResetTokenKey(email);
        String otpKey = buildOtpKey(email);
        redisService.deleteKey(resetTokenKey);
        redisService.deleteKey(otpKey);
        log.debug("Reset token and OTP deleted for email: {}", email);
    }

    public void initiateEmailChange(Long userId, String newEmail) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId không được để trống");
        }
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email mới không được để trống");
        }

        String normalizedEmail = newEmail.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại trong hệ thống");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (normalizedEmail.equalsIgnoreCase(targetUser.getEmail())) {
            throw new IllegalArgumentException("Email mới phải khác email hiện tại");
        }

        ensureSuperAdminSelfEdit(targetUser);

        String otpCode = generateOtpCode();
        String redisKey = buildEmailChangeOtpKey(userId, normalizedEmail);
        redisService.setValue(redisKey, otpCode, OTP_TTL_SECONDS);
        emailService.sendEmailChangeOtp(normalizedEmail, otpCode, targetUser.getFullName(), targetUser.getEmail());
        log.info("OTP email-change sent to {} for user {}", normalizedEmail, userId);
    }

    @Transactional
    public void confirmEmailChange(Long userId, String newEmail, String otp) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId không được để trống");
        }
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email mới không được để trống");
        }

        String normalizedEmail = newEmail.trim().toLowerCase();
        String redisKey = buildEmailChangeOtpKey(userId, normalizedEmail);
        String storedOtp = redisService.getValue(redisKey);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new InvalidOtpException("OTP không hợp lệ hoặc đã hết hạn");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại trong hệ thống");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        ensureSuperAdminSelfEdit(targetUser);

        targetUser.setEmail(normalizedEmail);
        userRepository.save(targetUser);
        redisService.deleteKey(redisKey);
        log.info("User {} email changed to {}", userId, normalizedEmail);
    }

    private void checkRateLimit(String email) {
        String rateLimitKey = OTP_RATE_LIMIT_KEY_PREFIX + email;
        Long attempts = redisService.increment(rateLimitKey, OTP_RATE_LIMIT_TTL_SECONDS);

        if (attempts != null && attempts > OTP_RATE_LIMIT_MAX_ATTEMPTS) {
            log.warn("Rate limit exceeded for email: {}", email);
            throw new RateLimitExceededException("Too many OTP requests. Please try again after 5 minutes.");
        }
    }

    private String buildOtpKey(String email) {
        return OTP_KEY_PREFIX + email;
    }

    private String buildResetTokenKey(String email) {
        return RESET_TOKEN_KEY_PREFIX + email;
    }

    private String buildEmailChangeOtpKey(Long userId, String email) {
        return EMAIL_CHANGE_OTP_PREFIX + userId + ":" + email;
    }

    private String generateOtpCode() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    private void ensureSuperAdminSelfEdit(User targetUser) {
        if (!isSuperAdmin(targetUser)) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new OperationNotPermittedException("Bạn không có quyền thay đổi email của SUPER_ADMIN");
        }

        String currentEmail = authentication.getName();
        if (!targetUser.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new OperationNotPermittedException("Chỉ SUPER_ADMIN đó mới có quyền thay đổi email của chính mình");
        }
    }

    private boolean isSuperAdmin(User user) {
        if (user == null) {
            return false;
        }
        if (user.getRole() != null && user.getRole().name().contains("SUPER_ADMIN")) {
            return true;
        }
        if (user.getPrimaryRole() != null && user.getPrimaryRole().getRoleCode() != null
                && user.getPrimaryRole().getRoleCode().contains("SUPER_ADMIN")) {
            return true;
        }
        if (user.getUserRoles() != null) {
            return user.getUserRoles().stream()
                    .anyMatch(ur -> ur.getRole() != null
                            && ur.getRole().getRoleCode() != null
                            && ur.getRole().getRoleCode().contains("SUPER_ADMIN"));
        }
        return false;
    }
}

