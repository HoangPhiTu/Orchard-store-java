package com.orchard.orchard_store_backend.config;

import com.orchard.orchard_store_backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ====================================================
                // 1. PUBLIC ENDPOINTS (Không cần đăng nhập)
                // ====================================================
                
                // 👉 FIX: Mở quyền cho Admin Auth (Login/Refresh Token)
                // Phải đặt dòng này TRƯỚC dòng /api/admin/**
                .requestMatchers("/api/admin/auth/**").permitAll() 
                
                // Giữ lại cái này phòng trường hợp bạn dùng path cũ
                .requestMatchers("/api/auth/**").permitAll()
                
                // Setup endpoint (tạo admin account - tạm thời public)
                .requestMatchers("/api/setup/**").permitAll()
                
                // Customer Auth (Gửi OTP, Verify OTP)
                .requestMatchers("/api/store/auth/**").permitAll()
                
                // Public Catalog (Xem sản phẩm không cần login)
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/brands/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/concentrations/**").permitAll()
                .requestMatchers("/api/bundles/**").permitAll() // Thêm Bundle nếu cần public

                // Swagger UI (Nếu có cài, nên mở để test)
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Uploads (Để xem ảnh)
                .requestMatchers("/uploads/**").permitAll()

                // WebSocket endpoints (SockJS fallback)
                .requestMatchers("/ws/**").permitAll()

                // ====================================================
                // 2. PROTECTED ENDPOINTS (Cần đăng nhập)
                // ====================================================
                
                // Customer Profile: Chỉ khách hàng được xem
                .requestMatchers("/api/store/profile/**").hasRole("CUSTOMER")
                
                // Admin Panel: Chỉ Admin hoặc Staff được vào
                // Dòng này sẽ chặn tất cả các API bắt đầu bằng /api/admin (trừ cái auth đã mở ở trên)
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")
                
                // Tất cả request còn lại đều phải đăng nhập
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

