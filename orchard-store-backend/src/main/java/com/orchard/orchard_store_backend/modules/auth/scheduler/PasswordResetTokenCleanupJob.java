package com.orchard.orchard_store_backend.modules.auth.scheduler;

import com.orchard.orchard_store_backend.config.properties.PasswordResetProperties;
import com.orchard.orchard_store_backend.modules.auth.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetTokenCleanupJob {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetTokenCleanupJob.class);

    private final PasswordResetService passwordResetService;
    private final PasswordResetProperties passwordResetProperties;

    public PasswordResetTokenCleanupJob(PasswordResetService passwordResetService,
                                        PasswordResetProperties passwordResetProperties) {
        this.passwordResetService = passwordResetService;
        this.passwordResetProperties = passwordResetProperties;
    }

    @Scheduled(cron = "${app.password-reset.cleanup-cron:0 0 * * * *}")
    public void cleanExpiredTokens() {
        try {
            passwordResetService.cleanupExpiredTokens();
            logger.debug("Password reset token cleanup executed - cron: {}", passwordResetProperties.getCleanupCron());
        } catch (Exception ex) {
            logger.error("Failed to cleanup password reset tokens", ex);
        }
    }
}

