# Báo Cáo Lỗi và Cách Khắc Phục - Backend

## Tổng Quan

Tài liệu này liệt kê các lỗi logic, vấn đề hiệu suất và lỗ hổng bảo mật đã được phát hiện trong codebase của Backend (Spring Boot), cùng với giải pháp khắc phục chi tiết.

**Ngày tạo:** $(date)  
**Phạm vi:** Authentication, User Management, Security Configuration

---

## 1. LỖI LOGIC

### 1.1. AuthController - Log Password Trong Production Code

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/controller/AuthController.java` (dòng 114-126)

**Vấn đề:**

```java
log.info("Password hash from database: {}", userBeforeAuth.getPassword());
log.info("Password from request: {}", loginRequest.getPassword());
log.error("Trying to match password: '{}' against hash: '{}'",
    loginRequest.getPassword(), userBeforeAuth.getPassword());
```

**Mô tả:**

- Log password plain text và hash trong production code
- Có thể leak thông tin nhạy cảm trong log files
- Vi phạm security best practices

**Giải pháp:**

```java
// Chỉ log trong development mode
if (log.isDebugEnabled()) {
    log.debug("User found before authentication. User ID: {}", userBeforeAuth.getId());
    // KHÔNG log password hoặc hash
}

// Hoặc sử dụng logger với level check
log.debug("Password verification attempt for user: {}", userBeforeAuth.getId());
// Không log password hoặc hash
```

**Mức độ nghiêm trọng:** 🔴 High

---

### 1.2. UserAdminServiceImpl - N+1 Query Problem Với Lazy Loading

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/UserAdminServiceImpl.java` (dòng 113-120, 222-229)

**Vấn đề:**

```java
// Eager fetch userRoles và role để có hierarchy level
if (currentUser.getUserRoles() != null) {
    currentUser.getUserRoles().size(); // Trigger lazy loading
    currentUser.getUserRoles().forEach(userRole -> {
        if (userRole.getRole() != null) {
            userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
        }
    });
}
```

**Mô tả:**

- Sử dụng manual lazy loading trigger thay vì EntityGraph hoặc JOIN FETCH
- Có thể gây N+1 query problem
- Code lặp lại nhiều lần trong các methods

**Giải pháp:**

1. **Sử dụng EntityGraph trong Repository:**

```java
// UserRepository.java
@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
Optional<User> findByIdWithRoles(Long id);

@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
Optional<User> findByEmailWithRoles(String email);
```

2. **Sử dụng JOIN FETCH trong Service:**

```java
@Transactional(readOnly = true)
private User getCurrentUserWithRoles() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
        return null;
    }
    String email = authentication.getName();

    // Sử dụng EntityGraph method
    return userRepository.findByEmailWithRoles(email).orElse(null);
}
```

3. **Hoặc sử dụng JPQL với JOIN FETCH:**

```java
@Query("SELECT u FROM User u " +
       "LEFT JOIN FETCH u.userRoles ur " +
       "LEFT JOIN FETCH ur.role r " +
       "WHERE u.email = :email")
Optional<User> findByEmailWithRoles(@Param("email") String email);
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 1.3. AuthServiceImpl - Exception Handling Không Nhất Quán

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/AuthServiceImpl.java` (dòng 54-116)

**Vấn đề:**

```java
User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

// ...

throw new RuntimeException("Account is locked. Please try again later or contact administrator.");

// ...

throw new RuntimeException("Invalid email or password. " + remainingAttempts + " attempt(s) remaining.");
```

**Mô tả:**

- Sử dụng `RuntimeException` generic thay vì custom exceptions
- Khó xử lý error handling nhất quán
- GlobalExceptionHandler không thể phân biệt các loại lỗi

**Giải pháp:**

1. **Tạo custom exceptions:**

```java
// exception/AccountLockedException.java
public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String message) {
        super(message);
    }
}

// exception/InvalidCredentialsException.java
public class InvalidCredentialsException extends RuntimeException {
    private final int remainingAttempts;

    public InvalidCredentialsException(String message, int remainingAttempts) {
        super(message);
        this.remainingAttempts = remainingAttempts;
    }

    public int getRemainingAttempts() {
        return remainingAttempts;
    }
}
```

2. **Cập nhật AuthServiceImpl:**

```java
User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

if (user.isAccountLocked()) {
    throw new AccountLockedException("Account is locked. Please try again later or contact administrator.");
}

// ...

throw new InvalidCredentialsException(
    "Invalid email or password. " + remainingAttempts + " attempt(s) remaining.",
    remainingAttempts
);
```

3. **Cập nhật GlobalExceptionHandler:**

```java
@ExceptionHandler(AccountLockedException.class)
public ResponseEntity<Map<String, Object>> handleAccountLockedException(AccountLockedException ex) {
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("timestamp", LocalDateTime.now());
    errorResponse.put("status", HttpStatus.LOCKED.value()); // 423
    errorResponse.put("error", "Account Locked");
    errorResponse.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.LOCKED).body(errorResponse);
}

@ExceptionHandler(InvalidCredentialsException.class)
public ResponseEntity<Map<String, Object>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("timestamp", LocalDateTime.now());
    errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
    errorResponse.put("error", "Invalid Credentials");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("remainingAttempts", ex.getRemainingAttempts());
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
}
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 1.4. AuthController - Duplicate Password Change Logic

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/controller/AuthController.java` (dòng 283-353)

**Vấn đề:**

- Logic change password được implement trực tiếp trong Controller
- Có duplicate code với `AuthServiceImpl.changePassword()`
- Vi phạm Single Responsibility Principle

**Giải pháp:**

```java
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(401, "Authentication required"));
        }

        String email = authentication.getName();

        // Sử dụng service method thay vì duplicate logic
        authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());

        log.info("Password changed successfully for user: {}", email);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));

    } catch (RuntimeException e) {
        log.error("Error changing password", e);
        return ResponseEntity.status(400)
                .body(ApiResponse.error(400, e.getMessage()));
    }
}
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

## 2. VẤN ĐỀ HIỆU SUẤT

### 2.1. UserAdminServiceImpl - N+1 Query Problem

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/UserAdminServiceImpl.java` (dòng 49-80)

**Vấn đề:**

```java
Specification<User> spec = (root, query, cb) -> {
    // ...
    // Eagerly fetch userRoles and roles to avoid LazyInitializationException
    root.fetch("userRoles", jakarta.persistence.criteria.JoinType.LEFT)
        .fetch("role", jakarta.persistence.criteria.JoinType.LEFT);
    query.distinct(true);
    // ...
};

return userRepository.findAll(spec, pageable)
        .map(userAdminMapper::toResponseDTO);
```

**Mô tả:**

- Đã có fetch nhưng có thể tối ưu hơn
- Có thể gây performance issue với large datasets
- Không có pagination optimization

**Giải pháp:**

1. **Sử dụng EntityGraph trong Repository:**

```java
// UserRepository.java
@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
Page<User> findAll(Specification<User> spec, Pageable pageable);
```

2. **Hoặc tạo method riêng:**

```java
@Query("SELECT DISTINCT u FROM User u " +
       "LEFT JOIN FETCH u.userRoles ur " +
       "LEFT JOIN FETCH ur.role r " +
       "WHERE (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
       "AND (:status IS NULL OR :status = 'ALL' OR u.status = :status)")
Page<User> findUsersWithRoles(
    @Param("keyword") String keyword,
    @Param("status") User.Status status,
    Pageable pageable
);
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 2.2. AuthController - Nhiều Database Queries Trong Login

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/controller/AuthController.java` (dòng 100-270)

**Vấn đề:**

```java
// Query 1: Check user exists
User userBeforeAuth = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

// Query 2: Authenticate (Spring Security queries again)
authenticationManager.authenticate(...);

// Query 3: Get user again after authentication
User user = userRepository.findByEmail(loginRequest.getEmail())
        .orElseThrow(() -> new BadCredentialsException("User not found"));
```

**Mô tả:**

- Query user 3 lần trong một login request
- Không cần thiết query trước khi authenticate
- Có thể optimize bằng cách cache hoặc reuse

**Giải pháp:**

```java
@PostMapping("/login")
public ResponseEntity<LoginResponseDTO> login(
        @Valid @RequestBody LoginRequestDTO loginRequest,
        HttpServletRequest request
) {
    try {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        // Authenticate user (Spring Security sẽ query user)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("Authentication successful for email: {}", loginRequest.getEmail());

        // Get user from database (chỉ query 1 lần)
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

        // ... rest of the code
    } catch (BadCredentialsException e) {
        // Handle failed login
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        if (user != null) {
            user.incrementFailedLoginAttempts();
            userRepository.save(user);
            loginHistoryService.logLogin(user, request, LoginHistory.LoginStatus.FAILED, "Sai mật khẩu");
        }
        throw e;
    }
}
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

### 2.3. UserAdminServiceImpl - Không Có Caching Cho Roles

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/UserAdminServiceImpl.java` (dòng 104, 351)

**Vấn đề:**

```java
// Find roles
List<Role> roles = roleRepository.findByIdIn(roleIds);
```

**Mô tả:**

- Query roles mỗi lần create/update user
- Roles thường không thay đổi thường xuyên
- Có thể cache để tăng performance

**Giải pháp:**

1. **Sử dụng Spring Cache:**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAdminServiceImpl implements UserAdminService {

    private final RoleRepository roleRepository;

    @Cacheable(value = "roles", key = "#roleIds.toString()")
    public List<Role> getRolesByIds(Set<Long> roleIds) {
        List<Role> roles = roleRepository.findByIdIn(roleIds);
        if (roles.size() != roleIds.size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều quyền không tồn tại");
        }
        return roles;
    }

    @CacheEvict(value = "roles", allEntries = true)
    public void evictRolesCache() {
        // Called when roles are updated
    }
}
```

2. **Cấu hình Cache trong Application:**

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
            new ConcurrentMapCache("roles")
        ));
        return cacheManager;
    }
}
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

## 3. LỖ HỔNG BẢO MẬT

### 3.1. SecurityConfig - CSRF Disabled

**File:** `src/main/java/com/orchard/orchard_store_backend/config/SecurityConfig.java` (dòng 59)

**Vấn đề:**

```java
.csrf(csrf -> csrf.disable())
```

**Mô tả:**

- CSRF protection bị disable hoàn toàn
- Có thể bị CSRF attack
- Nên enable cho state-changing operations

**Giải pháp:**

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        // Enable CSRF protection
        .csrf(csrf -> csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .ignoringRequestMatchers(
                "/api/admin/auth/**",  // Auth endpoints (stateless)
                "/api/auth/**",
                "/api/store/auth/**"
            )
        )
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // ... rest of config
}
```

**Lưu ý:** Với JWT stateless authentication, CSRF có thể không cần thiết, nhưng nên có cho các endpoints khác.

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.2. SecurityConfig - CORS Configuration Có Thể Cải Thiện

**File:** `src/main/java/com/orchard/orchard_store_backend/config/SecurityConfig.java` (dòng 116-127)

**Vấn đề:**

```java
configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
configuration.setAllowedHeaders(Arrays.asList("*"));
```

**Mô tả:**

- Hardcoded origins (chỉ localhost)
- Allow all headers (`*`) có thể không an toàn
- Không có environment-based configuration

**Giải pháp:**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Get allowed origins from properties
    String allowedOrigins = appProperties.getCorsAllowedOrigins();
    if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    } else {
        // Fallback to localhost for development
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
    }

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

    // Specify allowed headers instead of *
    configuration.setAllowedHeaders(Arrays.asList(
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "X-CSRF-TOKEN"
    ));

    configuration.setExposedHeaders(Arrays.asList("Authorization", "X-CSRF-TOKEN"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.3. JwtTokenProvider - Potential Encoding Issue

**File:** `src/main/java/com/orchard/orchard_store_backend/security/JwtTokenProvider.java` (dòng 29)

**Vấn đề:**

```java
private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
}
```

**Mô tả:**

- Sử dụng `getBytes()` không chỉ định encoding
- Có thể gây vấn đề với non-ASCII characters
- Nên sử dụng UTF-8 encoding

**Giải pháp:**

```java
private SecretKey getSigningKey() {
    try {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    } catch (Exception e) {
        throw new RuntimeException("Failed to create signing key", e);
    }
}
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

### 3.4. Password Reset - Information Disclosure

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/PasswordResetServiceImpl.java` (dòng 46-47)

**Vấn đề:**

```java
User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("If the email exists, a password reset link will be sent."));
```

**Mô tả:**

- Exception message có thể leak thông tin về email tồn tại
- Tốt hơn là luôn trả về success message (nhưng không gửi email nếu email không tồn tại)

**Giải pháp:**

```java
@Override
@Transactional
public void requestPasswordReset(ForgotPasswordDTO request) {
    // Luôn trả về success để không leak thông tin
    // Nhưng chỉ gửi email nếu user tồn tại
    Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

    if (userOpt.isEmpty()) {
        // Log internally nhưng không throw exception
        log.debug("Password reset requested for non-existent email: {}", request.getEmail());
        return; // Silent fail - không leak thông tin
    }

    User user = userOpt.get();

    // Check rate limit
    LocalDateTime since = LocalDateTime.now().minusHours(24);
    long requestCount = tokenRepository.countUnusedTokensByUserSince(user, since);

    if (requestCount >= passwordResetProperties.getMaxRequestsPerDay()) {
        log.warn("Rate limit exceeded for password reset: {}", request.getEmail());
        return; // Silent fail
    }

    // Generate and send token
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

    log.info("Password reset token sent to: {}", request.getEmail());
}
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.5. AuthController - Password Logging Trong Production

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/controller/AuthController.java` (dòng 114-126, 495-498)

**Vấn đề:**

```java
log.info("Password hash from database: {}", userBeforeAuth.getPassword());
log.info("Password from request: {}", loginRequest.getPassword());
log.info("New password (plain): {}", newPassword != null ? "***" : "NULL");
```

**Mô tả:**

- Log password hash và plain text (dù đã mask một phần)
- Có thể leak thông tin trong log files
- Vi phạm security best practices

**Giải pháp:**

```java
// Chỉ log trong debug mode
if (log.isDebugEnabled()) {
    log.debug("User found before authentication. User ID: {}", userBeforeAuth.getId());
    // KHÔNG log password hoặc hash
}

// Hoặc remove hoàn toàn các log statements liên quan đến password
log.info("Password reset request for email: {}", request.getEmail());
// Không log password
```

**Mức độ nghiêm trọng:** 🔴 High

---

### 3.6. JWT Token - Không Có Token Revocation Mechanism

**File:** `src/main/java/com/orchard/orchard_store_backend/security/JwtTokenProvider.java`

**Vấn đề:**

- JWT tokens không thể revoke trước khi expire
- Nếu token bị compromise, phải đợi hết hạn
- Không có blacklist mechanism

**Giải pháp:**

1. **Implement Token Blacklist với Redis:**

```java
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisService redisService;
    private static final String BLACKLIST_KEY_PREFIX = "jwt:blacklist:";

    public void blacklistToken(String token, long expirationTime) {
        // Calculate TTL
        long ttl = expirationTime - System.currentTimeMillis();
        if (ttl > 0) {
            redisService.setValue(BLACKLIST_KEY_PREFIX + token, "1", ttl / 1000);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return redisService.exists(BLACKLIST_KEY_PREFIX + token);
    }
}
```

2. **Cập nhật JwtAuthenticationFilter:**

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    try {
        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            // Check if token is blacklisted
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Blacklisted token detected");
                filterChain.doFilter(request, response);
                return;
            }

            var authentication = tokenProvider.getAuthentication(jwt);
            // ... rest of code
        }
    } catch (Exception ex) {
        logger.error("Could not set user authentication in security context", ex);
    }

    filterChain.doFilter(request, response);
}
```

3. **Cập nhật Logout endpoint:**

```java
@PostMapping("/logout")
public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
    String token = getJwtFromRequest(request);
    if (token != null) {
        Date expiration = tokenProvider.getExpirationDateFromToken(token);
        tokenBlacklistService.blacklistToken(token, expiration.getTime());
    }
    return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
}
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.7. Native Queries - Potential SQL Injection Risk

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/repository/ProductVariantRepository.java`

**Vấn đề:**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND pv.cached_attributes @> :attributeJson::jsonb
    """, nativeQuery = true)
Page<ProductVariant> findByAttributeValue(
    @Param("attributeJson") String attributeJson,
    Pageable pageable
);
```

**Mô tả:**

- Sử dụng native queries với parameters
- Nếu không cẩn thận, có thể bị SQL injection
- Cần validate input trước khi query

**Giải pháp:**

1. **Validate input:**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND pv.cached_attributes @> CAST(:attributeJson AS jsonb)
    """, nativeQuery = true)
Page<ProductVariant> findByAttributeValue(
    @Param("attributeJson") String attributeJson,
    Pageable pageable
);

// Trong Service:
public Page<ProductVariant> findByAttributeValue(String attributeJson, Pageable pageable) {
    // Validate JSON format
    try {
        ObjectMapper mapper = new ObjectMapper();
        mapper.readTree(attributeJson); // Validate JSON
    } catch (Exception e) {
        throw new IllegalArgumentException("Invalid JSON format: " + attributeJson);
    }

    // Validate size
    if (attributeJson.length() > 10000) {
        throw new IllegalArgumentException("Attribute JSON too large");
    }

    return productVariantRepository.findByAttributeValue(attributeJson, pageable);
}
```

2. **Sử dụng JPQL thay vì native query nếu có thể:**

```java
@Query("SELECT pv FROM ProductVariant pv " +
       "WHERE pv.status = 'ACTIVE' " +
       "AND FUNCTION('jsonb_contains', pv.cachedAttributes, CAST(:attributeJson AS jsonb)) = true")
Page<ProductVariant> findByAttributeValue(
    @Param("attributeJson") String attributeJson,
    Pageable pageable
);
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.8. Password Reset - Không Validate Password Strength

**File:** `src/main/java/com/orchard/orchard_store_backend/modules/auth/service/PasswordResetServiceImpl.java` (dòng 74-99)

**Vấn đề:**

```java
public void resetPassword(ResetPasswordDTO request) {
    // ...
    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    // ...
}
```

**Mô tả:**

- Không validate password strength trước khi reset
- Có thể set password yếu
- Nên có password policy

**Giải pháp:**

```java
// Tạo PasswordValidator utility
@Component
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    public void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Password must be at least %d characters long", MIN_LENGTH)
            );
        }

        if (password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Password must be at most %d characters long", MAX_LENGTH)
            );
        }

        if (!password.matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException(
                "Password must contain at least one uppercase letter, " +
                "one lowercase letter, one number, and one special character"
            );
        }

        // Check common passwords
        if (isCommonPassword(password)) {
            throw new IllegalArgumentException("Password is too common. Please choose a stronger password.");
        }
    }

    private boolean isCommonPassword(String password) {
        // Load from file or database
        Set<String> commonPasswords = Set.of(
            "password", "12345678", "qwerty", "abc123", "password123"
        );
        return commonPasswords.contains(password.toLowerCase());
    }
}

// Sử dụng trong service:
@Autowired
private PasswordValidator passwordValidator;

public void resetPassword(ResetPasswordDTO request) {
    // Validate password strength
    passwordValidator.validatePassword(request.getNewPassword());

    // ... rest of code
}
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

## 4. CÁC VẤN ĐỀ KHÁC

### 4.1. Error Messages Không Nhất Quán

**Vấn đề:**

- Một số nơi sử dụng tiếng Việt, một số nơi tiếng Anh
- Error messages không có format chuẩn

**Giải pháp:**

- Tạo file `messages.properties` cho i18n
- Sử dụng `MessageSource` để quản lý messages
- Đảm bảo tất cả error messages đều có format nhất quán

---

### 4.2. Logging Không Nhất Quán

**Vấn đề:**

- Một số nơi log quá nhiều, một số nơi không log
- Không có logging strategy rõ ràng

**Giải pháp:**

- Tạo logging guidelines
- Sử dụng structured logging (JSON format)
- Implement log levels đúng cách (DEBUG, INFO, WARN, ERROR)

---

## 5. PRIORITY FIXES

### High Priority (Fix ngay):

1. 🔴 Password logging trong production (3.5, 1.1)
2. 🔴 Information disclosure trong password reset (3.4)

### Medium Priority (Fix trong sprint này):

1. ⚠️ N+1 query problem (2.1, 1.2)
2. ⚠️ Exception handling không nhất quán (1.3)
3. ⚠️ CSRF configuration (3.1)
4. ⚠️ CORS configuration (3.2)
5. ⚠️ SQL injection risk (3.7)
6. ⚠️ Password strength validation (3.8)

### Low Priority (Fix khi có thời gian):

1. ⚠️ Duplicate password change logic (1.4)
2. ⚠️ Multiple queries trong login (2.2)
3. ⚠️ Caching cho roles (2.3)
4. ⚠️ JWT token revocation (3.6)
5. ⚠️ Encoding issue (3.3)

---

## 6. KẾT LUẬN

Tài liệu này đã liệt kê các lỗi và vấn đề đã được phát hiện trong codebase backend. Các vấn đề bảo mật (High priority) nên được fix ngay lập tức, trong khi các vấn đề hiệu suất và logic có thể được fix trong các sprint tiếp theo.

**Tổng số vấn đề:** 15

- **High:** 2
- **Medium:** 9
- **Low:** 4

---

**Lưu ý:** Tài liệu này nên được cập nhật định kỳ khi có thêm vấn đề mới hoặc khi các vấn đề đã được fix.
