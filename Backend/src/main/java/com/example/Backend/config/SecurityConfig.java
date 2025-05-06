package com.example.Backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Defines the security filter chain for HTTP requests.
     * Currently disables CSRF protection and allows all requests without authentication.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Disable CSRF for simplicity (enable it for production with proper tokens)
                .authorizeHttpRequests()
                .anyRequest().permitAll(); // Allow all requests without authentication
        return http.build();
    }

    /**
     * Configures CORS settings to allow frontend (e.g., React) to communicate with backend.
     * Allows all headers, all methods, and credentials from the specified origin.
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173"); // Allow frontend origin
        config.addAllowedHeader("*"); // Allow all headers
        config.addAllowedMethod("*"); // Allow all HTTP methods (GET, POST, etc.)
        config.setAllowCredentials(true); // Allow credentials (cookies, auth headers)
        source.registerCorsConfiguration("/**", config); // Apply config to all endpoints
        return new CorsFilter(source);
    }

    /**
     * Provides a password encoder bean using BCrypt hashing algorithm.
     * Used for encoding and verifying user passwords securely.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
