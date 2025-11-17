package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.ForgotPasswordDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.ResetPasswordDTO;

public interface PasswordResetService {

    void requestPasswordReset(ForgotPasswordDTO request);

    void resetPassword(ResetPasswordDTO request);

    boolean validateResetToken(String token);

    void cleanupExpiredTokens();
}

