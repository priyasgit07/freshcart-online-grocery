package com.grocery.controller;

import com.grocery.dto.OrderRequest;
import com.grocery.dto.OrderResponse;
import com.grocery.entity.User;
import com.grocery.service.AuthService;
import com.grocery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order placement and customer order tracking")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Place a new grocery order from current shopping cart (COD)")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get order history for logged-in customer")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(orderService.getCustomerOrders(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by order id")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(orderService.getOrderById(id, user));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a PENDING order (customer action). Inventory is restored transactionally.")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(orderService.cancelOrder(id, user, "CUSTOMER"));
    }
}
