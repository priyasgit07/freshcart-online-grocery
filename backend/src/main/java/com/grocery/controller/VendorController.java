package com.grocery.controller;

import com.grocery.dto.*;
import com.grocery.entity.User;
import com.grocery.service.AuthService;
import com.grocery.service.OrderService;
import com.grocery.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@Tag(name = "Vendor Management", description = "Vendor catalog, inventory management, and order fulfillment")
public class VendorController {

    private final VendorService vendorService;
    private final AuthService authService;
    private final OrderService orderService;

    public VendorController(VendorService vendorService, AuthService authService, OrderService orderService) {
        this.vendorService = vendorService;
        this.authService = authService;
        this.orderService = orderService;
    }

    @GetMapping("/products")
    @Operation(summary = "Get all products listed by the logged-in vendor")
    public ResponseEntity<List<ProductResponse>> getVendorProducts() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getVendorProducts(user.getId()));
    }

    @PostMapping("/products")
    @Operation(summary = "Create a new product listing for vendor")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(vendorService.createProduct(user.getId(), request), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product listing")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.updateProduct(user.getId(), id, request));
    }

    @PatchMapping("/products/{id}/stock")
    @Operation(summary = "Update inventory stock level for a product")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.updateStock(user.getId(), id, request.getStock()));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete (soft delete) a product from vendor catalog")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        vendorService.deleteProduct(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders containing items from this vendor")
    public ResponseEntity<List<OrderResponse>> getVendorOrders() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getVendorOrders(user.getId()));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update order status (PENDINGâ†’CONFIRMEDâ†’SHIPPEDâ†’DELIVERED)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.updateOrderStatus(user.getId(), id, request.getStatus()));
    }

    /**
     * Vendor rejection: cancel a PENDING order that contains this vendor's items.
     * Inventory is restored transactionally. Customer receives a cancellation notification.
     * Only PENDING orders can be rejected. CONFIRMED/SHIPPED/DELIVERED are blocked.
     */
    @PatchMapping("/orders/{id}/cancel")
    @Operation(summary = "Reject/cancel a PENDING order (vendor action). Inventory is restored transactionally.")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(orderService.cancelOrder(id, user, "VENDOR"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get vendor performance KPIs, revenue, and order metrics")
    public ResponseEntity<DashboardMetricsResponse> getVendorDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getVendorDashboardMetrics(user.getId()));
    }
}
