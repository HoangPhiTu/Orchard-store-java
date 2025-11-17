package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.AuthRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.AuthResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    AuthResponseDTO login(AuthRequestDTO request, HttpServletRequest httpRequest);

    UserDTO getCurrentUser();

    void changePassword(String email, String currentPassword, String newPassword);
}

