package com.orchard.orchard_store_backend.modules.customer.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.exception.InvalidOtpException;
import com.orchard.orchard_store_backend.modules.customer.exception.RateLimitExceededException;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Collections;

/**
 * Service xử lý authentication cho Customer bằng OTP Email (Passwordless).
 *
 * Flow:
 * 1. Customer nhập email -> sendLoginOtp() -> Tạo OTP, lưu Redis, gửi email (log)
 * 2. Customer nhập OTP -> verifyLoginOtp() -> Verify OTP, generate JWT token
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final RedisService redisService;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String OTP_KEY_PREFIX = "auth:otp:";
    private static final String OTP_RATE_LIMIT_KEY_PREFIX = "otp_limit:";

    private static final long OTP_TTL_SECONDS = 300; // 5 phút
    private static final long OTP_RATE_LIMIT_TTL_SECONDS = 300; // 5 phút
    private static final int OTP_RATE_LIMIT_MAX_ATTEMPTS = 3;

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Gửi OTP code qua email cho Customer login.
     *
     * @param email Email của customer
     */
    public void sendLoginOtp(String email) {
        log.info("Request OTP for email: {}", email);

        // 1. Check rate limit
        checkRateLimit(email);

        // 2. Tìm customer hoặc tạo mới (đảm bảo customer tồn tại trước khi gửi OTP)
        customerRepository.findByEmail(email)
                .orElseGet(() -> createGuestCustomer(email));

        // 3. Generate OTP
        String otpCode = generateOtpCode();

        // 4. Lưu OTP vào Redis
        String redisKey = buildOtpKey(email);
        redisService.setValue(redisKey, otpCode, OTP_TTL_SECONDS);
        log.debug("OTP saved to Redis key: {}, TTL: {} seconds", redisKey, OTP_TTL_SECONDS);

        // 5. Giả lập gửi email (log ra console)
        log.info("Sending OTP [{}] to [{}]", otpCode, email);
    }

    /**
     * Verify OTP và generate JWT token nếu đúng.
     */
    public String verifyLoginOtp(String email, String otp) {
        log.info("Verifying OTP for email: {}", email);

        String redisKey = buildOtpKey(email);
        String storedOtp = redisService.getValue(redisKey);

        if (storedOtp == null || storedOtp.isEmpty()) {
            log.warn("OTP expired or missing for email: {}", email);
            throw new InvalidOtpException("Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!storedOtp.equals(otp)) {
            log.warn("OTP mismatch for email: {}", email);
            throw new InvalidOtpException("Mã OTP không đúng. Vui lòng thử lại.");
        }

        // Xóa OTP sau khi verify thành công
        redisService.deleteKey(redisKey);
        log.info("OTP verified successfully for email: {}", email);

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", email));

        String accessToken = jwtTokenProvider.generateAccessToken(
                customer.getId(),
                email,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        log.info("JWT token generated for customer ID: {}", customer.getId());
        return accessToken;
    }

    /**
     * Health check Redis.
     */
    public boolean isRedisUp() {
        String pong = redisService.ping();
        return "PONG".equalsIgnoreCase(pong);
    }

    private void checkRateLimit(String email) {
        String rateLimitKey = OTP_RATE_LIMIT_KEY_PREFIX + email;
        Long attempts = redisService.increment(rateLimitKey, OTP_RATE_LIMIT_TTL_SECONDS);

        if (attempts != null && attempts > OTP_RATE_LIMIT_MAX_ATTEMPTS) {
            log.warn("Rate limit exceeded for email: {}", email);
            throw new RateLimitExceededException("Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }
    }

    private Customer createGuestCustomer(String email) {
        Customer customer = Customer.builder()
                .email(email)
                .phone(generateGuestPhone())
                .status(Customer.Status.ACTIVE)
                .build();
        Customer saved = customerRepository.save(customer);
        log.info("Created guest customer with ID: {} for email: {}", saved.getId(), email);
        return saved;
    }

    private String generateGuestPhone() {
        String phone;
        do {
            phone = "G" + String.format("%09d", secureRandom.nextInt(1_000_000_000));
        } while (customerRepository.findByPhone(phone).isPresent());
        return phone;
    }

    private String buildOtpKey(String email) {
        return OTP_KEY_PREFIX + email;
    }

    private String generateOtpCode() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
}

