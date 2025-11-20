package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.config.properties.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AppProperties appProperties;

    @Value("${spring.mail.username:no-reply@orchard-store.com}")
    private String fromEmail;

    @Override
    public void sendPasswordResetEmail(String to, String resetToken, String resetUrl) {
        String subject = "Orchard Store Admin - Đặt lại mật khẩu";
        String url = resetUrl != null ? resetUrl : appProperties.getFrontendUrl() + "/reset-password?token=" + resetToken;

        String content = """
                <p>Xin chào,</p>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản quản trị Orchard Store.</p>
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 24 giờ.</p>
                <p style="margin:24px 0;">
                    <a href="%s" style="background-color:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
                        Đặt lại mật khẩu
                    </a>
                </p>
                <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
                <p>Trân trọng,<br/>Orchard Store Team</p>
                """.formatted(url);

        sendHtmlEmail(to, subject, content);
    }

    @Override
    public void sendPasswordResetSuccessEmail(String to, String userName) {
        String subject = "Orchard Store Admin - Đổi mật khẩu thành công";
        String name = (userName == null || userName.isBlank()) ? "bạn" : userName;

        String content = """
                <p>Xin chào %s,</p>
                <p>Mật khẩu tài khoản quản trị Orchard Store của bạn đã được thay đổi thành công.</p>
                <p>Nếu bạn không thực hiện hành động này, hãy liên hệ ngay với quản trị viên để được hỗ trợ.</p>
                <p>Trân trọng,<br/>Orchard Store Team</p>
""".formatted(name);

        sendHtmlEmail(to, subject, content);
    }

    @Override
    public void sendOtpEmail(String to, String otpCode, String customerName) {
        String subject = "Orchard Store - Mã OTP đăng nhập";
        String name = (customerName == null || customerName.isBlank()) ? "bạn" : customerName;

        String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #111827; margin-bottom: 20px;">Xin chào %s,</h2>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Bạn vừa yêu cầu đăng nhập vào Orchard Store. Mã OTP của bạn là:
                    </p>
                    <div style="background-color: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <h1 style="color: #111827; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                            %s
                        </h1>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <strong>Lưu ý:</strong>
                    </p>
                    <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                        <li>Mã OTP có hiệu lực trong <strong>5 phút</strong></li>
                        <li>Không chia sẻ mã OTP với bất kỳ ai</li>
                        <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>
                    </ul>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                        Trân trọng,<br/>
                        <strong>Orchard Store Team</strong>
                    </p>
                </div>
                """.formatted(name, otpCode);

        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Sent email '{}' to {}", subject, to);
        } catch (MessagingException ex) {
            logger.error("Failed to send email '{}' to {}", subject, to, ex);
            throw new RuntimeException("Unable to send email. Please try again later.");
        }
    }
}

