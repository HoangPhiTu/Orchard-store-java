package com.orchard.orchard_store_backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;
    private Long expirationMs;
    private Long longLivedExpirationMs;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public Long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(Long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public Long getLongLivedExpirationMs() {
        return longLivedExpirationMs;
    }

    public void setLongLivedExpirationMs(Long longLivedExpirationMs) {
        this.longLivedExpirationMs = longLivedExpirationMs;
    }
}

