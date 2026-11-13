package com.grocery.service;

import com.grocery.dto.VendorCreateRequest;
import com.grocery.entity.Role;
import com.grocery.entity.User;
import com.grocery.entity.Vendor;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import com.grocery.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private VendorRepository vendorRepository;
    @Mock private ProductRepository productRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private OrderService orderService;

    @InjectMocks private AdminService adminService;

    private User sampleUser;
    private Vendor sampleVendor;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Vendor Person", "vendor@store.com", "pass", Role.VENDOR, null, "555-1234");
        sampleUser.setActive(false);

        sampleVendor = new Vendor(sampleUser, "Farm Fresh", "555-1234", "Fresh farm items");
    }

    @Test
    @DisplayName("toggleVendorStatus â€” activates inactive vendor and saves user")
    void toggleVendorStatus_activatesInactiveVendor() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(sampleVendor));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        Vendor result = adminService.toggleVendorStatus(1L);

        assertThat(result).isNotNull();
        assertThat(result.getUser().isActive()).isTrue();
        verify(userRepository).save(sampleUser);
    }

    @Test
    @DisplayName("toggleVendorStatus â€” suspends active vendor and saves user")
    void toggleVendorStatus_suspendsActiveVendor() {
        sampleUser.setActive(true);
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(sampleVendor));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        Vendor result = adminService.toggleVendorStatus(1L);

        assertThat(result).isNotNull();
        assertThat(result.getUser().isActive()).isFalse();
        verify(userRepository).save(sampleUser);
    }

    @Test
    @DisplayName("toggleVendorStatus â€” non-existent vendor throws ResourceNotFoundException")
    void toggleVendorStatus_notFound_throwsException() {
        when(vendorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.toggleVendorStatus(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vendor not found with id: 99");
    }

    @Test
    @DisplayName("deleteUser â€” cannot delete ADMIN account")
    void deleteUser_adminRole_throwsBadRequestException() {
        User adminUser = new User("Admin", "admin@store.com", "pass", Role.ADMIN, null, null);
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> adminService.deleteUser(2L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Admin accounts cannot be removed");
    }
}
