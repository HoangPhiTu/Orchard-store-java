package com.orchard.orchard_store_backend.modules.auth.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String resetToken, String resetUrl);

    void sendPasswordResetSuccessEmail(String to, String userName);

    /**
     * Gửi OTP code qua email cho Customer login.
     * 
     * @param to Email người nhận
     * @param otpCode OTP code (6 digits)
     * @param customerName Tên khách hàng (optional)
     */
    void sendOtpEmail(String to, String otpCode, String customerName);
}

