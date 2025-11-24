package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserUpdateRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserAdminService {
    Page<UserResponseDTO> getUsers(String keyword, Pageable pageable);
    UserResponseDTO createUser(UserCreateRequestDTO request);
    UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request);
    UserResponseDTO toggleUserStatus(Long id);
    void resetPassword(Long userId, String newPassword);
    void deleteUser(Long userId);
    Page<LoginHistoryResponseDTO> getUserLoginHistory(Long userId, Pageable pageable);
}

