package com.orchard.orchard_store_backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String frontendUrl = "http://localhost:3001";
    
    private String corsAllowedOrigins = "http://localhost:3000,http://localhost:3001";

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }
    
    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }
    
    public void setCorsAllowedOrigins(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
    }
}

