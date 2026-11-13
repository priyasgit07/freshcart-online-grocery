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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService â€” covers login, register, inactive-user block,
 * duplicate email rejection, vendor application, and bad credentials handling.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private VendorRepository vendorRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private User activeCustomer;
    private User inactiveCustomer;

    @BeforeEach
    void setUp() {
        activeCustomer = new User("Sarah Customer", "customer@test.com",
                "$2a$10$encodedPassword", Role.CUSTOMER, "123 Main St", "555-0100");
        activeCustomer.setActive(true);

        inactiveCustomer = new User("Deleted User", "deleted@test.com",
                "$2a$10$encodedPassword", Role.CUSTOMER, "Addr", "555");
        inactiveCustomer.setActive(false);
    }

    @Test
    @DisplayName("login â€” active user with correct credentials receives JWT")
    void login_activeUser_success() {
        CustomUserDetails details = new CustomUserDetails(activeCustomer);
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(activeCustomer));
        when(jwtService.generateToken(any(), anyString(), any())).thenReturn("jwt-token-abc");

        LoginRequest request = new LoginRequest();
        request.setEmail("customer@test.com");
        request.setPassword("Customer@123");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token-abc");
        assertThat(response.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(response.getEmail()).isEqualTo("customer@test.com");
    }

    @Test
    @DisplayName("login â€” inactive user is rejected even if credentials are correct")
    void login_inactiveUser_throwsBadRequest() {
        CustomUserDetails details = new CustomUserDetails(inactiveCustomer);
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(userRepository.findByEmail("deleted@test.com")).thenReturn(Optional.of(inactiveCustomer));

        LoginRequest request = new LoginRequest();
        request.setEmail("deleted@test.com");
        request.setPassword("password");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    @DisplayName("login â€” inactive vendor is rejected with pending approval message")
    void login_inactiveVendor_throwsPendingApprovalMessage() {
        User inactiveVendor = new User("Pending Vendor", "vendor@test.com",
                "$2a$10$encodedPassword", Role.VENDOR, null, "555-0100");
        inactiveVendor.setActive(false);

        CustomUserDetails details = new CustomUserDetails(inactiveVendor);
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(userRepository.findByEmail("vendor@test.com")).thenReturn(Optional.of(inactiveVendor));

        LoginRequest request = new LoginRequest();
        request.setEmail("vendor@test.com");
        request.setPassword("VendorPass@123");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("pending administrator approval");
    }

    @Test
    @DisplayName("login â€” wrong password throws BadCredentialsException from AuthenticationManager")
    void login_wrongPassword_throwsBadCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest request = new LoginRequest();
        request.setEmail("customer@test.com");
        request.setPassword("WrongPassword");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("register â€” new customer is registered and JWT is returned")
    void register_newUser_success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@test.com");
        request.setPassword("NewPass@123");
        request.setAddress("456 Other St");
        request.setPhone("555-0200");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("NewPass@123")).thenReturn("$2a$10$encodedNewPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            try {
                var f = User.class.getDeclaredField("id");
                f.setAccessible(true);
                f.set(u, 5L);
            } catch (Exception e) { /* ignore */ }
            return u;
        });
        when(jwtService.generateToken(any(), anyString(), any())).thenReturn("register-jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("register-jwt-token");
        assertThat(response.getEmail()).isEqualTo("new@test.com");
        assertThat(response.getRole()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    @DisplayName("register â€” duplicate email throws BadRequestException")
    void register_duplicateEmail_throwsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Sarah Customer");
        request.setEmail("customer@test.com");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("customer@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    @DisplayName("registerVendor â€” creates inactive user and vendor entity without token")
    void registerVendor_success_createsInactiveUserAndVendorWithoutToken() {
        VendorRegisterRequest request = new VendorRegisterRequest(
                "Vendor Owner", "vendor@test.com", "Password123", "Organic Farms", "555-1234", "Fresh organics"
        );

        when(userRepository.existsByEmail("vendor@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("$2a$10$encodedVendorPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            try {
                var f = User.class.getDeclaredField("id");
                f.setAccessible(true);
                f.set(u, 10L);
            } catch (Exception e) { /* ignore */ }
            return u;
        });
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(inv -> {
            Vendor v = inv.getArgument(0);
            try {
                var f = Vendor.class.getDeclaredField("id");
                f.setAccessible(true);
                f.set(v, 20L);
            } catch (Exception e) { /* ignore */ }
            return v;
        });

        AuthResponse response = authService.registerVendor(request);

        assertThat(response.getToken()).isNull();
        assertThat(response.getRole()).isEqualTo(Role.VENDOR);
        assertThat(response.getEmail()).isEqualTo("vendor@test.com");
        assertThat(response.getVendorBusinessName()).isEqualTo("Organic Farms");

        verify(userRepository).save(argThat(user -> !user.isActive() && user.getRole() == Role.VENDOR));
        verify(vendorRepository).save(argThat(vendor -> vendor.getName().equals("Organic Farms")));
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("registerVendor â€” duplicate email throws BadRequestException")
    void registerVendor_duplicateEmail_throwsBadRequest() {
        VendorRegisterRequest request = new VendorRegisterRequest(
                "Vendor Owner", "existing@test.com", "Password123", "Organic Farms", "555-1234", "Fresh organics"
        );

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerVendor(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }
}
