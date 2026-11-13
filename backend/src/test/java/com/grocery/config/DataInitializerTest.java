package com.grocery.config;

import com.grocery.entity.*;
import com.grocery.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(userRepository, vendorRepository, productRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Application starts cleanly and skips demo seeding when passwords are not configured")
    void shouldSkipSeedingWhenPasswordsAreBlank() {
        dataInitializer.setAdminPassword("");
        dataInitializer.setCustomerPassword("   ");
        dataInitializer.setVendor1Password(null);
        dataInitializer.setVendor2Password("");

        assertThatCode(() -> dataInitializer.run()).doesNotThrowAnyException();

        // Verify no users or vendors were created
        verify(userRepository, never()).save(any(User.class));
        verify(vendorRepository, never()).save(any(Vendor.class));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Seeds Admin account with BCrypt password when SEED_ADMIN_PASSWORD is configured")
    void shouldSeedAdminWhenPasswordConfigured() {
        dataInitializer.setAdminPassword("SecureAdmin@999");
        when(userRepository.existsByEmail("admin@grocery.com")).thenReturn(false);
        when(passwordEncoder.encode("SecureAdmin@999")).thenReturn("$2a$10$encodedAdminHash");

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedAdmin = userCaptor.getValue();
        assertThat(savedAdmin.getEmail()).isEqualTo("admin@grocery.com");
        assertThat(savedAdmin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(savedAdmin.getPasswordHash()).isEqualTo("$2a$10$encodedAdminHash");
        assertThat(savedAdmin.getName()).isEqualTo("System Administrator");
    }

    @Test
    @DisplayName("Seeds Customer account with BCrypt password when SEED_CUSTOMER_PASSWORD is configured")
    void shouldSeedCustomerWhenPasswordConfigured() {
        dataInitializer.setCustomerPassword("CustomerSecret!88");
        when(userRepository.existsByEmail("customer@grocery.com")).thenReturn(false);
        when(passwordEncoder.encode("CustomerSecret!88")).thenReturn("$2a$10$encodedCustomerHash");

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedCustomer = userCaptor.getValue();
        assertThat(savedCustomer.getEmail()).isEqualTo("customer@grocery.com");
        assertThat(savedCustomer.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(savedCustomer.getPasswordHash()).isEqualTo("$2a$10$encodedCustomerHash");
    }

    @Test
    @DisplayName("Seeds Vendors and 13 products when vendor passwords are provided and catalog is empty")
    void shouldSeedVendorsAndProductsWhenConfigured() {
        dataInitializer.setVendor1Password("V1SecretPass@1");
        dataInitializer.setVendor2Password("V2SecretPass@2");

        when(userRepository.existsByEmail("freshfarms@grocery.com")).thenReturn(false);
        when(userRepository.existsByEmail("greenvalley@grocery.com")).thenReturn(false);
        when(productRepository.count()).thenReturn(0L);

        when(passwordEncoder.encode("V1SecretPass@1")).thenReturn("$2a$10$v1Hash");
        when(passwordEncoder.encode("V2SecretPass@2")).thenReturn("$2a$10$v2Hash");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        dataInitializer.run();

        verify(vendorRepository, times(2)).save(any(Vendor.class));
        verify(productRepository, times(13)).save(any(Product.class));
    }

    @Test
    @DisplayName("Does not re-seed existing accounts when they already exist in database")
    void shouldNotOverwriteExistingAccounts() {
        dataInitializer.setAdminPassword("NewPassword@123");
        dataInitializer.setCustomerPassword("NewPassword@123");
        dataInitializer.setVendor1Password("NewPassword@123");
        dataInitializer.setVendor2Password("NewPassword@123");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        when(vendorRepository.findByUserEmail(anyString())).thenReturn(Optional.of(mock(Vendor.class)));
        when(productRepository.count()).thenReturn(13L);

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(productRepository, never()).save(any(Product.class));
    }
}
