package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.auth.dto.AdminResetPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.EmailChangeInitRequest;
import com.orchard.orchard_store_backend.modules.auth.dto.EmailChangeVerifyRequest;
import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.service.AdminOtpService;
import com.orchard.orchard_store_backend.modules.auth.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cho quản lý Users (Admin only).
 * 
 * Security: Chỉ ADMIN mới được truy cập các endpoints này (@PreAuthorize("hasRole('ADMIN')")).
 * 
 * Các chức năng:
 * - Lấy danh sách users với tìm kiếm và phân trang
 * - Tạo user mới
 * - Cập nhật thông tin user
 * - Khóa/Mở khóa user (toggle status)
 * 
 * Swagger: Nếu có springdoc-openapi dependency, có thể thêm các annotations:
 * - @Tag(name = "User Management")
 * - @Operation, @ApiResponses cho từng endpoint
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class UserAdminController {

    private final UserAdminService userAdminService;
    private final AdminOtpService adminOtpService;

    /**
     * Lấy danh sách users với tìm kiếm và phân trang.
     * 
     * GET /api/admin/users?keyword=...&page=0&size=20
     * 
     * @param keyword Từ khóa tìm kiếm (email, tên, số điện thoại)
     * @param page Số trang (bắt đầu từ 0)
     * @param size Số lượng items mỗi trang
     * @return Page<UserResponseDTO> wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/admin/users - keyword: {}, status: {}, page: {}, size: {}",
                keyword, status, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserResponseDTO> users = userAdminService.getUsers(keyword, status, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách users thành công", users));
    }

    /**
     * Lấy chi tiết một user theo ID.
     * 
     * GET /api/admin/users/{id}
     * 
     * @param id ID của user cần lấy
     * @return UserResponseDTO wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(
            @PathVariable @org.springframework.lang.NonNull Long id
    ) {
        log.info("GET /api/admin/users/{}", id);
        
        UserResponseDTO user = userAdminService.getUserById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", user));
    }

    /**
     * Tạo user mới.
     * 
     * POST /api/admin/users
     * 
     * @param request UserCreateRequestDTO với email, password, roles
     * @return UserResponseDTO wrapped in ApiResponse (201 Created)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponseDTO>> createUser(
            @Valid @RequestBody UserCreateRequestDTO request
    ) {
        log.info("POST /api/admin/users - email: {}", request.getEmail());
        
        UserResponseDTO createdUser = userAdminService.createUser(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo user thành công", createdUser));
    }

    /**
     * Cập nhật thông tin user.
     * 
     * PUT /api/admin/users/{id}
     * 
     * Lưu ý: Không cho phép sửa email và password ở endpoint này.
     * 
     * @param id ID của user cần cập nhật
     * @param request UserUpdateRequestDTO với thông tin cần cập nhật
     * @return UserResponseDTO wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDTO request
    ) {
        log.info("PUT /api/admin/users/{}", id);
        
        UserResponseDTO updatedUser = userAdminService.updateUser(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Cập nhật user thành công", updatedUser));
    }

    /**
     * Khóa/Mở khóa user (toggle status).
     * 
     * PATCH /api/admin/users/{id}/status
     * 
     * Logic: ACTIVE -> INACTIVE, các trạng thái khác -> ACTIVE
     * 
     * @param id ID của user cần thay đổi trạng thái
     * @return UserResponseDTO wrapped in ApiResponse
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponseDTO>> toggleUserStatus(
            @PathVariable Long id
    ) {
        log.info("PATCH /api/admin/users/{}/status", id);
        
        UserResponseDTO updatedUser = userAdminService.toggleUserStatus(id);
        
        String message = updatedUser.getStatus().equals("ACTIVE") 
            ? "Mở khóa user thành công" 
            : "Khóa user thành công";
        
        return ResponseEntity.ok(ApiResponse.success(message, updatedUser));
    }

    /**
     * Admin reset password của user khác.
     * 
     * PUT /api/admin/users/{id}/reset-password
     * 
     * Security: Chỉ ADMIN mới được reset password (Staff không được).
     * 
     * @param id ID của user cần reset password
     * @param request AdminResetPasswordDTO với newPassword
     * @return ApiResponse với success message
     */
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminResetPasswordDTO request
    ) {
        log.info("PUT /api/admin/users/{}/reset-password", id);
        
        userAdminService.resetPassword(id, request.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
    }

    /**
     * Xóa user.
     * 
     * DELETE /api/admin/users/{id}
     * 
     * Security: Chỉ ADMIN mới được xóa user.
     * Logic: Kiểm tra self-protection (không cho xóa chính mình) và hierarchy permission.
     * 
     * @param id ID của user cần xóa
     * @return ApiResponse với success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("DELETE /api/admin/users/{}", id);
        
        userAdminService.deleteUser(id);
        
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công", null));
    }

    @PostMapping("/{id}/email/init")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> initiateEmailChange(
            @PathVariable Long id,
            @Valid @RequestBody EmailChangeInitRequest request
    ) {
        validateUserId(id, request.getUserId());
        adminOtpService.initiateEmailChange(id, request.getNewEmail());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi OTP xác nhận email mới", null));
    }

    @PostMapping("/{id}/email/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verifyEmailChange(
            @PathVariable Long id,
            @Valid @RequestBody EmailChangeVerifyRequest request
    ) {
        validateUserId(id, request.getUserId());
        adminOtpService.confirmEmailChange(id, request.getNewEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Đổi email thành công", null));
    }

    /**
     * Lấy lịch sử đăng nhập của user.
     * 
     * GET /api/admin/users/{id}/history?page=0&size=20
     * 
     * @param id ID của user cần xem lịch sử
     * @param page Số trang (bắt đầu từ 0)
     * @param size Số lượng items mỗi trang
     * @return Page<LoginHistoryDTO> wrapped in ApiResponse
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<Page<LoginHistoryResponseDTO>>> getUserLoginHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/admin/users/{}/history - page: {}, size: {}", id, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "loginAt"));
        Page<LoginHistoryResponseDTO> history = userAdminService.getUserLoginHistory(id, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử đăng nhập thành công", history));
    }

    private void validateUserId(Long pathId, Long bodyId) {
        if (bodyId != null && !pathId.equals(bodyId)) {
            throw new IllegalArgumentException("UserId trong request không khớp với đường dẫn");
        }
    }
}

