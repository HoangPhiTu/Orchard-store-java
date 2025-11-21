package com.orchard.orchard_store_backend.config;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            // Create default admin account if not exists
            String adminEmail = "tuhoang.170704@gmail.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .email(adminEmail)
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("Administrator")
                        .role(User.LegacyRole.ADMIN)
                        .status(User.Status.ACTIVE)
                        .build();
                
                if (admin != null) {
                    userRepository.save(admin);
                    logger.info("========================================");
                    logger.info("Default admin account created:");
                    logger.info("Email: {}", adminEmail);
                    logger.info("Password: admin123");
                    logger.info("========================================");
                } else {
                    logger.error("Failed to create admin user: builder returned null");
                }
            } else {
                logger.info("Admin account already exists: {}", adminEmail);
            }
        } catch (DataAccessException e) {
            logger.error("Failed to initialize admin account due to database connection error: {}", e.getMessage());
            logger.warn("Application will continue to start, but admin account initialization was skipped.");
            logger.warn("Please check your database connection settings in application.properties");
        } catch (Exception e) {
            logger.error("Unexpected error during admin account initialization: {}", e.getMessage(), e);
            logger.warn("Application will continue to start, but admin account initialization was skipped.");
        }
    }
}

