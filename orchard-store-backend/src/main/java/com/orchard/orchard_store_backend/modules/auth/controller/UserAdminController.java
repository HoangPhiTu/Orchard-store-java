package com.orchard.orchard_store_backend.modules.auth.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.auth.dto.UserCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserUpdateRequestDTO;
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/admin/users - keyword: {}, page: {}, size: {}", keyword, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserResponseDTO> users = userAdminService.getUsers(keyword, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách users thành công", users));
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
}

