package com.orchard.orchard_store_backend.modules.customer.controller;

import com.orchard.orchard_store_backend.config.properties.JwtProperties;
import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.customer.dto.OtpLoginRequestDTO;
import com.orchard.orchard_store_backend.modules.customer.dto.OtpLoginResponseDTO;
import com.orchard.orchard_store_backend.modules.customer.dto.OtpVerifyRequestDTO;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.exception.InvalidOtpException;
import com.orchard.orchard_store_backend.modules.customer.exception.RateLimitExceededException;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.customer.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cho Customer Authentication (OTP Email - Passwordless).
 * 
 * Public endpoints - Không cần authentication.
 */
@RestController
@RequestMapping("/api/store/auth")
@RequiredArgsConstructor
@Slf4j
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;
    private final CustomerRepository customerRepository;
    private final JwtProperties jwtProperties;

    /**
     * Gửi OTP code qua email cho Customer login.
     * 
     * Endpoint: POST /api/store/auth/send-otp
     * 
     * Flow:
     * 1. Kiểm tra email có trong bảng customers chưa
     * 2. Tạo OTP random 6 số
     * 3. Lưu OTP vào Redis (TTL: 5 phút)
     * 4. Gửi OTP qua email
     * 
     * @param request OtpLoginRequestDTO chứa email
     * @return ApiResponse với message thành công
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendLoginOtp(@Valid @RequestBody OtpLoginRequestDTO request) {
        try {
            customerAuthService.sendLoginOtp(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(
                    "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
                    null
            ));
        } catch (RateLimitExceededException ex) {
            log.warn("Rate limit exceeded for email: {}", request.getEmail());
            return ResponseEntity.status(429)
                    .body(ApiResponse.error(429, ex.getMessage()));
        } catch (Exception e) {
            log.error("Error sending OTP to email: {}", request.getEmail(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Verify OTP và trả về JWT token.
     * 
     * Endpoint: POST /api/store/auth/verify-otp
     * 
     * Flow:
     * 1. Lấy OTP từ Redis
     * 2. So sánh với OTP từ request
     * 3. Nếu đúng -> Xóa OTP, generate JWT token với role CUSTOMER
     * 4. Trả về access token
     * 
     * @param request OtpVerifyRequestDTO chứa email và OTP
     * @return ApiResponse<OtpLoginResponseDTO> chứa JWT token và customer info
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<OtpLoginResponseDTO>> verifyLoginOtp(@Valid @RequestBody OtpVerifyRequestDTO request) {
        try {
            // Verify OTP và generate JWT token
            String accessToken = customerAuthService.verifyLoginOtp(request.getEmail(), request.getOtp());

            // Load customer info
            Customer customer = customerRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // Build response
            OtpLoginResponseDTO response = OtpLoginResponseDTO.builder()
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtProperties.getExpirationMs() / 1000) // Convert ms to seconds
                    .customer(OtpLoginResponseDTO.CustomerInfo.builder()
                            .id(customer.getId())
                            .email(customer.getEmail())
                            .fullName(customer.getFullName())
                            .phone(customer.getPhone())
                            .build())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));

        } catch (InvalidOtpException ex) {
            log.warn("Invalid OTP for email: {}", request.getEmail());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, ex.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying OTP for email: {}", request.getEmail(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * API kiểm tra nhanh trạng thái Redis.
     */
    @GetMapping("/redis-health")
    public ResponseEntity<ApiResponse<String>> redisHealth() {
        boolean up = customerAuthService.isRedisUp();
        if (up) {
            return ResponseEntity.ok(ApiResponse.success("UP", "UP"));
        }
        return ResponseEntity.status(503)
                .body(ApiResponse.error(503, "Redis DOWN"));
    }
}

