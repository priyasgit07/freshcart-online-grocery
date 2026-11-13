package com.grocery.controller;

import com.grocery.dto.AuthResponse;
import com.grocery.dto.LoginRequest;
import com.grocery.dto.RegisterRequest;
import com.grocery.dto.VendorRegisterRequest;
import com.grocery.entity.Role;
import com.grocery.entity.User;
import com.grocery.entity.Vendor;
import com.grocery.repository.VendorRepository;
import com.grocery.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user login, registration, and session info")
public class AuthController {

    private final AuthService authService;
    private final VendorRepository vendorRepository;

    public AuthController(AuthService authService, VendorRepository vendorRepository) {
        this.authService = authService;
        this.vendorRepository = vendorRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "User login for Customer, Vendor, or Admin")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new Customer account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register-vendor")
    @Operation(summary = "Apply for a new Vendor account (defaults to pending administrator approval)")
    public ResponseEntity<AuthResponse> registerVendor(@Valid @RequestBody VendorRegisterRequest request) {
        return ResponseEntity.ok(authService.registerVendor(request));
    }

    /**
     * Returns current authenticated user info.
     * The existing Bearer token is re-used as-is â€” no new token is generated,
     * avoiding unnecessary token churn on app startup validation.
     */
    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info and validate token")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpServletRequest httpRequest) {
        String existingToken = null;
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            existingToken = authHeader.substring(7);
        }

        User user = authService.getCurrentAuthenticatedUser();
        Long vendorId = null;
        String vendorBusinessName = null;
        if (user.getRole() == Role.VENDOR) {
            Optional<Vendor> vendor = vendorRepository.findByUserId(user.getId());
            if (vendor.isPresent()) {
                vendorId = vendor.get().getId();
                vendorBusinessName = vendor.get().getName();
            }
        }
        return ResponseEntity.ok(new AuthResponse(
                existingToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                vendorId,
                vendorBusinessName,
                user.getAddress(),
                user.getPhone()
        ));
    }
}
