package com.orchard.orchard_store_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Configuration để serve static files (uploads) từ thư mục local.
 * 
 * Cho phép truy cập file ảnh đã upload qua URL: /uploads/products/image-123.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.directory:uploads}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve files từ thư mục uploads
        // URL: /uploads/** -> file:///path/to/project/uploads/**
        String uploadPath = Paths.get(uploadDirectory).toAbsolutePath().toString().replace("\\", "/");
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}

