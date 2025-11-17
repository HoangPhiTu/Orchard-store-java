package com.orchard.orchard_store_backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.password-reset")
public class PasswordResetProperties {

    private int tokenExpirationHours = 24;
    private int maxRequestsPerDay = 5;
    private String cleanupCron = "0 0 * * * *";

    public int getTokenExpirationHours() {
        return tokenExpirationHours;
    }

    public void setTokenExpirationHours(int tokenExpirationHours) {
        this.tokenExpirationHours = tokenExpirationHours;
    }

    public int getMaxRequestsPerDay() {
        return maxRequestsPerDay;
    }

    public void setMaxRequestsPerDay(int maxRequestsPerDay) {
        this.maxRequestsPerDay = maxRequestsPerDay;
    }

    public String getCleanupCron() {
        return cleanupCron;
    }

    public void setCleanupCron(String cleanupCron) {
        this.cleanupCron = cleanupCron;
    }
}

