package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.modules.auth.mapper.LoginHistoryMapper;
import com.orchard.orchard_store_backend.modules.auth.mapper.UserAdminMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.LoginHistoryRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAdminServiceImpl implements UserAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final UserAdminMapper userAdminMapper;
    private final LoginHistoryMapper loginHistoryMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsers(String keyword, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate fullNamePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern);
                Predicate phonePredicate = cb.like(cb.lower(root.get("phone")), searchPattern);
                predicates.add(cb.or(emailPredicate, fullNamePredicate, phonePredicate));
            }

            // Eagerly fetch userRoles and roles to avoid LazyInitializationException
            root.fetch("userRoles", jakarta.persistence.criteria.JoinType.LEFT)
                .fetch("role", jakarta.persistence.criteria.JoinType.LEFT);
            query.distinct(true); // Avoid duplicate results from joins

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(userAdminMapper::toResponseDTO);
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        // Validate roleIds không được rỗng
        Set<Long> roleIds = request.getRoleIds();
        if (roleIds == null || roleIds.isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một vai trò");
        }

        // Check email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại: " + request.getEmail());
        }

        // Check phone exists (nếu có)
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new ResourceAlreadyExistsException("Số điện thoại đã tồn tại: " + request.getPhone());
            }
        }

        // Find roles
        List<Role> roles = roleRepository.findByIdIn(roleIds);
        if (roles.size() != roleIds.size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều quyền không tồn tại");
        }

        // Kiểm tra: Không cho phép gán role có level >= level của currentUser
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            // Eager fetch userRoles và role để có hierarchy level
            if (currentUser.getUserRoles() != null) {
                currentUser.getUserRoles().size(); // Trigger lazy loading
                currentUser.getUserRoles().forEach(userRole -> {
                    if (userRole.getRole() != null) {
                        userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                    }
                });
            }
            
            Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);
            
            // SUPER_ADMIN (level 10) có thể gán bất kỳ role nào
            if (currentUserMaxLevel < 10) {
                // Kiểm tra từng role được gán
                for (Role role : roles) {
                    if (role.getHierarchyLevel() != null && role.getHierarchyLevel() >= currentUserMaxLevel) {
                        throw new OperationNotPermittedException(
                            "Bạn không thể gán role có cấp bậc cao hơn hoặc ngang bằng mình. " +
                            "Role level: " + role.getHierarchyLevel() + " >= Your level: " + currentUserMaxLevel
                        );
                    }
                }
            }
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .status(request.getStatus() != null 
                    ? User.Status.valueOf(request.getStatus().toUpperCase()) 
                    : User.Status.ACTIVE)
                .build();

        // Assign roles
        List<UserRole> userRoles = roles.stream()
                .map(role -> UserRole.builder()
                        .user(user)
                        .role(role)
                        .isActive(true)
                        .build())
                .collect(Collectors.toList());
        user.setUserRoles(userRoles);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("Created user: {} with email: {}", savedUser.getId(), savedUser.getEmail());

        return userAdminMapper.toResponseDTO(savedUser);
    }

    /**
     * Lấy hierarchy level cao nhất của user (từ các roles của user)
     * Hierarchy level: Số càng lớn = Quyền càng cao (ví dụ: 10 = SUPER_ADMIN, 8 = ADMIN, 4 = STAFF)
     */
    private Integer getHighestHierarchyLevel(User user) {
        if (user.getUserRoles() == null || user.getUserRoles().isEmpty()) {
            return 0; // Không có role = quyền thấp nhất (level 0)
        }
        return user.getUserRoles().stream()
                .filter(UserRole::getIsActive)
                .map(UserRole::getRole)
                .filter(role -> role != null && role.getHierarchyLevel() != null)
                .map(Role::getHierarchyLevel)
                .max(Integer::compareTo) // Số lớn hơn = quyền cao hơn
                .orElse(0);
    }

    /**
     * Lấy current user từ SecurityContext với eager fetch userRoles
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        // Sử dụng findByEmail với EntityGraph để fetch userRoles và role
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Kiểm tra quyền phân cấp (Hierarchy Protection) - "Gác cổng"
     * 
     * Logic:
     * - Nếu currentUser.getId().equals(targetUser.getId()): CHO PHÉP (trường hợp tự sửa)
     * - SUPER_ADMIN (level 10) luôn được phép (trừ khi xóa chính mình - đã xử lý riêng)
     * - Nếu currentUser.maxLevel > targetUser.maxLevel: CHO PHÉP
     * - Các trường hợp còn lại: Ném AccessDeniedException
     * 
     * @param targetUser User đang bị tác động (update/delete/toggle status)
     * @param currentUser User đang thực hiện thao tác
     * @throws OperationNotPermittedException Nếu không có quyền
     */
    private void checkHierarchyPermission(User targetUser, User currentUser) {
        // Nếu không có currentUser (system call) -> cho phép
        if (currentUser == null) {
            return;
        }
        
        // Nếu currentUser.getId().equals(targetUser.getId()): CHO PHÉP (trường hợp tự sửa)
        if (currentUser.getId().equals(targetUser.getId())) {
            return;
        }
        
        // Eager fetch userRoles và role để có hierarchy level
        if (currentUser.getUserRoles() != null) {
            currentUser.getUserRoles().size(); // Trigger lazy loading
            currentUser.getUserRoles().forEach(userRole -> {
                if (userRole.getRole() != null) {
                    userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                }
            });
        }
        
        // Tính maxRoleLevel của currentUser (level cao nhất)
        Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);
        
        // Tính maxRoleLevel của targetUser (level cao nhất)
        Integer targetUserMaxLevel = getHighestHierarchyLevel(targetUser);
        
        // SUPER_ADMIN (level 10) luôn được phép
        if (currentUserMaxLevel >= 10) {
            return;
        }
        
        // Kiểm tra: Nếu currentUser.maxLevel > targetUser.maxLevel: CHO PHÉP
        // Hierarchy level: Số càng lớn = Quyền càng cao
        if (currentUserMaxLevel > targetUserMaxLevel) {
            return;
        }
        
        // Các trường hợp còn lại: Ném AccessDeniedException
        throw new OperationNotPermittedException(
            "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình."
        );
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request) {
        // Fetch target user với userRoles để có hierarchy level
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));
        
        // Eager fetch userRoles và role để tránh LazyInitializationException
        if (targetUser.getUserRoles() != null) {
            targetUser.getUserRoles().size(); // Trigger lazy loading
            targetUser.getUserRoles().forEach(userRole -> {
                if (userRole.getRole() != null) {
                    userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                }
            });
        }

        User currentUser = getCurrentUser();
        
        // Gác cổng: Kiểm tra quyền phân cấp trước khi update
        checkHierarchyPermission(targetUser, currentUser);
        
        // Kiểm tra xem có phải tự sửa không
        boolean isSelfEdit = currentUser != null && currentUser.getId().equals(targetUser.getId());
        
        // Nếu là tự sửa: Chặn thay đổi Role và Status
        if (isSelfEdit) {
            // Chặn thay đổi Role: Nếu danh sách roleIds trong request khác với role hiện tại
            if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
                // Lấy danh sách role IDs hiện tại của user (chỉ lấy các role đang active)
                Set<Long> currentRoleIds = targetUser.getUserRoles().stream()
                        .filter(UserRole::getIsActive)
                        .map(userRole -> userRole.getRole().getId())
                        .collect(Collectors.toSet());
                
                // So sánh với roleIds trong request
                if (!currentRoleIds.equals(request.getRoleIds())) {
                    throw new OperationNotPermittedException(
                        "Bạn không thể tự thay đổi chức vụ của chính mình."
                    );
                }
            }
            
            // Chặn thay đổi Status: Bỏ qua field status khi tự sửa
            if (request.getStatus() != null) {
                // Bỏ qua status update cho self-edit (chỉ cho phép sửa fullName, phone)
                // Không ném lỗi, chỉ bỏ qua field này
            }
        }

        // Validate roleIds không được rỗng (nếu có)
        if (request.getRoleIds() != null && request.getRoleIds().isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một vai trò");
        }

        // Check phone duplicate (trừ chính user này)
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
                throw new ResourceAlreadyExistsException("Số điện thoại đã tồn tại: " + request.getPhone());
            }
        }

        // Update basic info
        if (request.getFullName() != null) {
            targetUser.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            targetUser.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            targetUser.setAvatarUrl(request.getAvatarUrl());
        }
        // Chỉ cho phép update status nếu không phải tự sửa
        if (request.getStatus() != null && !isSelfEdit) {
            try {
                targetUser.setStatus(User.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
            }
        }

        // Update roles if provided
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<Role> newRoles = roleRepository.findByIdIn(request.getRoleIds());
            if (newRoles.size() != request.getRoleIds().size()) {
                throw new ResourceNotFoundException("Một hoặc nhiều quyền không tồn tại");
            }

            // Kiểm tra: Không cho phép gán role có quyền cao hơn (level lớn hơn) cho user
            // Chỉ cho phép gán role có level <= target user hiện tại
            // Hierarchy level: Số càng lớn = Quyền càng cao
            Integer targetUserCurrentLevel = getHighestHierarchyLevel(targetUser);
            for (Role newRole : newRoles) {
                if (newRole.getHierarchyLevel() > targetUserCurrentLevel) {
                    throw new OperationNotPermittedException(
                        "Bạn không thể gán role có quyền cao hơn cho user này. Role level: " + 
                        newRole.getHierarchyLevel() + " > User level: " + targetUserCurrentLevel
                    );
                }
            }

            // Lấy danh sách role IDs hiện tại của user (để tránh duplicate)
            // Chỉ lấy các role đang active
            Set<Long> currentRoleIds = targetUser.getUserRoles().stream()
                    .filter(UserRole::getIsActive)
                    .map(userRole -> userRole.getRole().getId())
                    .collect(Collectors.toSet());

            // Lấy danh sách role IDs mới
            Set<Long> newRoleIds = newRoles.stream()
                    .map(Role::getId)
                    .collect(Collectors.toSet());

            // Chỉ xử lý nếu có thay đổi
            if (!currentRoleIds.equals(newRoleIds)) {
                // Tạo một List mới để tránh ConcurrentModificationException
                List<UserRole> rolesToRemove = new ArrayList<>();
                
                // Tìm các role cần remove (không còn trong danh sách mới)
                // Chỉ xử lý các role đang active
                for (UserRole existingUserRole : targetUser.getUserRoles()) {
                    if (existingUserRole.getIsActive()) {
                        Long roleId = existingUserRole.getRole().getId();
                        if (!newRoleIds.contains(roleId)) {
                            rolesToRemove.add(existingUserRole);
                        }
                    }
                }
                
                // Remove các role không còn trong danh sách mới
                targetUser.getUserRoles().removeAll(rolesToRemove);

                // Add new roles (chỉ add những role chưa có)
                // Kiểm tra cả active và inactive roles để tránh duplicate
                Set<Long> allExistingRoleIds = targetUser.getUserRoles().stream()
                        .map(userRole -> userRole.getRole().getId())
                        .collect(Collectors.toSet());
                
                for (Role newRole : newRoles) {
                    if (!allExistingRoleIds.contains(newRole.getId())) {
                        UserRole userRole = UserRole.builder()
                                .user(targetUser)
                                .role(newRole)
                                .isActive(true)
                                .build();
                        targetUser.getUserRoles().add(userRole);
                    }
                }
            }
        }

        User updatedUser = userRepository.save(targetUser);
        log.info("Updated user: {} with email: {} by user: {}", 
                updatedUser.getId(), updatedUser.getEmail(), 
                currentUser != null ? currentUser.getEmail() : "SYSTEM");

        return userAdminMapper.toResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserResponseDTO toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        // Eager fetch userRoles và role để có hierarchy level
        if (user.getUserRoles() != null) {
            user.getUserRoles().size(); // Trigger lazy loading
            user.getUserRoles().forEach(userRole -> {
                if (userRole.getRole() != null) {
                    userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                }
            });
        }

        // Validate Self-Protection: Không cho phép tự khóa/xóa chính mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String currentUserEmail = authentication.getName();
            if (user.getEmail().equals(currentUserEmail)) {
                throw new OperationNotPermittedException("Bạn không thể tự khóa hoặc xóa tài khoản của chính mình");
            }
        }

        User currentUser = getCurrentUser();
        
        // Gác cổng: Kiểm tra quyền phân cấp trước khi toggle status
        checkHierarchyPermission(user, currentUser);

        // Toggle status: ACTIVE -> INACTIVE, others -> ACTIVE
        if (user.getStatus() == User.Status.ACTIVE) {
            user.setStatus(User.Status.INACTIVE);
            log.info("Deactivated user: {} with email: {}", user.getId(), user.getEmail());
        } else {
            user.setStatus(User.Status.ACTIVE);
            log.info("Activated user: {} with email: {}", user.getId(), user.getEmail());
        }

        User updatedUser = userRepository.save(user);
        return userAdminMapper.toResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        // Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        // Eager fetch userRoles và role để có hierarchy level
        if (user.getUserRoles() != null) {
            user.getUserRoles().size(); // Trigger lazy loading
            user.getUserRoles().forEach(userRole -> {
                if (userRole.getRole() != null) {
                    userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                }
            });
        }

        User currentUser = getCurrentUser();
        
        // Kiểm tra xem có phải tự reset password không
        boolean isSelfReset = currentUser != null && currentUser.getId().equals(user.getId());
        
        // Nếu không phải tự reset: Kiểm tra quyền phân cấp
        // Nếu là tự reset: Cho phép (không cần kiểm tra hierarchy)
        if (!isSelfReset) {
            // Gác cổng: Kiểm tra quyền phân cấp trước khi reset password của user khác
            checkHierarchyPermission(user, currentUser);
        }

        // Mã hóa mật khẩu mới
        String encodedPassword = passwordEncoder.encode(newPassword);

        // Cập nhật mật khẩu
        user.setPassword(encodedPassword);

        // Lưu user
        userRepository.save(user);
        if (isSelfReset) {
            log.info("User reset own password: {} with email: {}", 
                    user.getId(), user.getEmail());
        } else {
            log.info("Admin reset password for user: {} with email: {} by user: {}", 
                    user.getId(), user.getEmail(), 
                    currentUser != null ? currentUser.getEmail() : "SYSTEM");
        }
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        // Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        // Eager fetch userRoles và role để có hierarchy level
        if (user.getUserRoles() != null) {
            user.getUserRoles().size(); // Trigger lazy loading
            user.getUserRoles().forEach(userRole -> {
                if (userRole.getRole() != null) {
                    userRole.getRole().getHierarchyLevel(); // Trigger lazy loading
                }
            });
        }

        // Validate Self-Protection: Không cho phép tự xóa chính mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String currentUserEmail = authentication.getName();
            if (user.getEmail().equals(currentUserEmail)) {
                throw new OperationNotPermittedException("Bạn không thể tự xóa tài khoản của chính mình");
            }
        }

        User currentUser = getCurrentUser();
        
        // Gác cổng: Kiểm tra quyền phân cấp trước khi xóa
        checkHierarchyPermission(user, currentUser);

        // Xóa user (cascade delete sẽ xóa các bản ghi liên quan như UserRole, LoginHistory)
        userRepository.delete(user);
        log.info("Deleted user: {} with email: {} by user: {}", 
                user.getId(), user.getEmail(), 
                currentUser != null ? currentUser.getEmail() : "SYSTEM");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoginHistoryDTO> getUserLoginHistory(Long userId, Pageable pageable) {
        // Kiểm tra user có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy user với ID: " + userId);
        }

        // Lấy lịch sử đăng nhập theo userId, sắp xếp giảm dần theo loginAt
        return loginHistoryRepository.findByUserId(userId, pageable)
                .map(loginHistoryMapper::toDTO);
    }
}

