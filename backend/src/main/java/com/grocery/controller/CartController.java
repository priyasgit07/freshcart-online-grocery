package com.grocery.controller;

import com.grocery.dto.CartItemRequest;
import com.grocery.dto.CartSummaryResponse;
import com.grocery.entity.User;
import com.grocery.service.AuthService;
import com.grocery.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Shopping Cart", description = "Customer shopping cart management")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    public CartController(CartService cartService, AuthService authService) {
        this.cartService = cartService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get user's current shopping cart with line items and subtotal")
    public ResponseEntity<CartSummaryResponse> getCart() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Add an item to the shopping cart with quantity and stock check")
    public ResponseEntity<CartSummaryResponse> addToCart(@Valid @RequestBody CartItemRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(cartService.addToCart(user.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<CartSummaryResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(cartService.updateQuantity(user.getId(), id, quantity));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<CartSummaryResponse> removeItem(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(cartService.removeItem(user.getId(), id));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from user cart")
    public ResponseEntity<Void> clearCart() {
        User user = authService.getCurrentAuthenticatedUser();
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
