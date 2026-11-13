package com.grocery.security;

import com.grocery.entity.Role;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String TEST_SECRET = "dGVzdC1qd3Qtc2VjcmV0LWtleS1mb3ItYXV0b21hdGVkLXRlc3RzLTEyMzQ1Njc4OTA=";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }

    @Test
    @DisplayName("generateToken generates a valid token with role and userId claims")
    void shouldGenerateAndExtractClaims() {
        String token = jwtService.generateToken(42L, "customer@grocery.com", Role.CUSTOMER);
        assertThat(token).isNotBlank();

        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("customer@grocery.com");

        Claims claims = jwtService.extractAllClaims(token);
        assertThat(claims.get("userId", Long.class)).isEqualTo(42L);
        assertThat(claims.get("role", String.class)).isEqualTo("CUSTOMER");
    }

    @Test
    @DisplayName("isTokenValid returns true for matching UserDetails and unexpired token")
    void shouldValidateMatchingUserDetails() {
        String token = jwtService.generateToken(1L, "admin@grocery.com", Role.ADMIN);
        UserDetails userDetails = new User("admin@grocery.com", "password", Collections.emptyList());

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid returns false for mismatched username")
    void shouldRejectMismatchedUsername() {
        String token = jwtService.generateToken(1L, "admin@grocery.com", Role.ADMIN);
        UserDetails otherUser = new User("intruder@grocery.com", "password", Collections.emptyList());

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    @DisplayName("Default application.properties fallback secret key parses and functions correctly")
    void testCurrentApplicationPropertiesDefaultKey() {
        JwtService fallbackJwtService = new JwtService();
        ReflectionTestUtils.setField(fallbackJwtService, "secretKey", "7A8B3C2D1E9F4A6B5C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9");
        ReflectionTestUtils.setField(fallbackJwtService, "jwtExpiration", 86400000L);

        String token = fallbackJwtService.generateToken(10L, "vendor@grocery.com", Role.VENDOR);
        assertThat(token).isNotBlank();
        assertThat(fallbackJwtService.extractUsername(token)).isEqualTo("vendor@grocery.com");
    }
}
