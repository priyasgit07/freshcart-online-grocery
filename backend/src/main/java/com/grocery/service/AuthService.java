package com.grocery.service;

import com.grocery.dto.AuthResponse;
import com.grocery.dto.LoginRequest;
import com.grocery.dto.RegisterRequest;
import com.grocery.dto.VendorRegisterRequest;
import com.grocery.entity.Role;
import com.grocery.entity.User;
import com.grocery.entity.Vendor;
import com.grocery.exception.BadRequestException;
import com.grocery.repository.UserRepository;
import com.grocery.repository.VendorRepository;
import com.grocery.security.CustomUserDetails;
import com.grocery.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       VendorRepository vendorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isActive()) {
            if (user.getRole() == Role.VENDOR) {
                throw new BadRequestException("Your vendor account is pending administrator approval. You will receive access once approved.");
            }
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        Long vendorId = null;
        String vendorBusinessName = null;
        if (user.getRole() == Role.VENDOR) {
            Optional<Vendor> vendor = vendorRepository.findByUserId(user.getId());
            if (vendor.isPresent()) {
                vendorId = vendor.get().getId();
                vendorBusinessName = vendor.get().getName();
            }
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                vendorId,
                vendorBusinessName,
                user.getAddress(),
                user.getPhone()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.CUSTOMER,
                request.getAddress(),
                request.getPhone()
        );

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                null,
                null,
                user.getAddress(),
                user.getPhone()
        );
    }

    @Transactional
    public AuthResponse registerVendor(VendorRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.VENDOR,
                null,
                request.getPhone()
        );
        // Public vendor registration defaults to inactive (pending administrator approval)
        user.setActive(false);
        user = userRepository.save(user);

        Vendor vendor = new Vendor(
                user,
                request.getBusinessName(),
                request.getPhone(),
                request.getDescription()
        );
        vendor = vendorRepository.save(vendor);

        return new AuthResponse(
                null,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                vendor.getId(),
                vendor.getName(),
                user.getAddress(),
                user.getPhone()
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found: " + email));
    }
}
