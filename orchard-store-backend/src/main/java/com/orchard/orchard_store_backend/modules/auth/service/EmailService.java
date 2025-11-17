package com.orchard.orchard_store_backend.modules.auth.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String resetToken, String resetUrl);

    void sendPasswordResetSuccessEmail(String to, String userName);
}

