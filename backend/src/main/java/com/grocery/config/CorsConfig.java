package com.grocery.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Allowed frontend origins, read from the CORS_ALLOWED_ORIGINS environment
     * variable (or app.cors.allowed-origins in application.properties).
     *
     * For local development: http://localhost:5173
     * For production:        https://your-app.vercel.app
     *
     * Wildcard (*) is intentionally not used as the production default.
     * Set CORS_ALLOWED_ORIGINS to the exact deployed frontend URL in production.
     */
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Support comma-separated list of origins (e.g. for multi-env setups)
        List<String> allowedOrigins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"
        ));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
