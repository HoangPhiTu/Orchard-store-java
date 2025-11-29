package com.orchard.orchard_store_backend.modules.auth.validation;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.regex.Pattern;

@Component
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    // At least one uppercase, one lowercase, one digit, one special character
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$");

    // Simple set of common passwords for demonstration. In a real app, this would be loaded from a secure source.
    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "12345678", "qwerty", "abc123", "password123", "admin", "orchard"
    );

    public void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống.");
        }

        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Mật khẩu phải có ít nhất %d ký tự.", MIN_LENGTH)
            );
        }

        if (password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Mật khẩu phải có tối đa %d ký tự.", MAX_LENGTH)
            );
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt (@$!%*?&)."
            );
        }

        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            throw new IllegalArgumentException("Mật khẩu quá phổ biến. Vui lòng chọn mật khẩu mạnh hơn.");
        }
    }
}

