package com.orchard.orchard_store_backend.config;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin account if not exists
        String adminEmail = "tuhoang.170704@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Administrator")
                    .role(User.Role.ADMIN)
                    .status(User.Status.ACTIVE)
                    .build();
            
            userRepository.save(admin);
            System.out.println("========================================");
            System.out.println("Default admin account created:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: admin123");
            System.out.println("========================================");
        }
    }
}

