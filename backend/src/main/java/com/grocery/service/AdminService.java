package com.grocery.service;

import com.grocery.dto.DashboardMetricsResponse;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.VendorCreateRequest;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import com.grocery.repository.VendorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderService orderService;

    public AdminService(UserRepository userRepository,
                        VendorRepository vendorRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        PasswordEncoder passwordEncoder,
                        OrderService orderService) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderService = orderService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    /**
     * Soft-delete a user by marking them inactive.
     * All existing orders, cart items, and notifications are preserved.
     * The user will be unable to log in (AuthService.login checks isActive).
     *
     * Guards:
     *  - Cannot deactivate an ADMIN account through this path (use toggleUserStatus).
     *  - Prevents accidental removal of admin accounts via the delete endpoint.
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException(
                    "Admin accounts cannot be removed via this endpoint. Use the toggle-status endpoint to deactivate an admin.");
        }

        // Soft delete â€” preserve all associated records
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public Vendor createVendor(VendorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.VENDOR,
                null,
                request.getPhone()
        );
        user = userRepository.save(user);

        Vendor vendor = new Vendor(
                user,
                request.getBusinessName(),
                request.getPhone(),
                request.getDescription()
        );

        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    @Transactional
    public Vendor toggleVendorStatus(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        User user = vendor.getUser();
        if (user != null) {
            user.setActive(!user.isActive());
            userRepository.save(user);
        }
        return vendor;
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(orderService::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public DashboardMetricsResponse getAdminDashboardMetrics() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalVendors = vendorRepository.count();
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);

        Map<String, Long> statusCounts = new HashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            statusCounts.put(s.name(), orderRepository.countByStatus(s));
        }

        DashboardMetricsResponse metrics = new DashboardMetricsResponse();
        metrics.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        metrics.setTotalOrders(totalOrders);
        metrics.setTotalProducts(totalProducts);
        metrics.setTotalVendors(totalVendors);
        metrics.setTotalUsers(totalUsers);
        metrics.setTotalCustomers(totalCustomers);
        metrics.setOrdersByStatus(statusCounts);

        return metrics;
    }
}
