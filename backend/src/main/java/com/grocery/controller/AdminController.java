package com.grocery.controller;

import com.grocery.dto.DashboardMetricsResponse;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.VendorCreateRequest;
import com.grocery.entity.User;
import com.grocery.entity.Vendor;
import com.grocery.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administrator Management", description = "Admin dashboard, user management, and vendor onboarding")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @Operation(summary = "View list of all registered users and their roles")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/vendors")
    @Operation(summary = "Create and onboard a new vendor account")
    public ResponseEntity<Vendor> createVendor(@Valid @RequestBody VendorCreateRequest request) {
        return new ResponseEntity<>(adminService.createVendor(request), HttpStatus.CREATED);
    }

    @GetMapping("/vendors")
    @Operation(summary = "Get list of all vendors")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(adminService.getAllVendors());
    }

    @PatchMapping("/vendors/{id}/toggle-status")
    @Operation(summary = "Approve, activate, or suspend a vendor account")
    public ResponseEntity<Vendor> toggleVendorStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleVendorStatus(id));
    }

    @GetMapping("/orders")
    @Operation(summary = "Audit all marketplace orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "System-wide reporting dashboard KPIs and metrics")
    public ResponseEntity<DashboardMetricsResponse> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboardMetrics());
    }
}
