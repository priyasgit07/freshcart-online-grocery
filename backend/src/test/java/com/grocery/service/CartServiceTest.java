package com.grocery.service;

import com.grocery.dto.CartItemRequest;
import com.grocery.dto.CartSummaryResponse;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CartService â€” covers add to cart, stock limits,
 * quantity updates, ownership validation, item removal, and clearing.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private CartService cartService;

    private User customer;
    private Product activeProduct;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        customer = new User("Sarah Customer", "customer@test.com", "hash", Role.CUSTOMER, "123 Main St", "555");
        setId(customer, 1L);

        Vendor vendor = new Vendor(null, "Organic Store", "555", "Desc");
        setId(vendor, 1L);

        activeProduct = new Product("Milk", "Fresh milk", new BigDecimal("4.00"), vendor, 10, "Dairy", "url");
        setId(activeProduct, 1L);

        cartItem = new CartItem(customer, activeProduct, 2);
        setId(cartItem, 100L);
    }

    @Test
    @DisplayName("addToCart â€” adds new item when none in cart")
    void addToCart_newItem_success() {
        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(3);

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(new CartItem(customer, activeProduct, 3)));

        CartSummaryResponse summary = cartService.addToCart(1L, req);

        verify(cartItemRepository).save(any(CartItem.class));
        assertThat(summary.getTotalItems()).isEqualTo(3);
        assertThat(summary.getTotalPrice()).isEqualByComparingTo("12.00");
    }

    @Test
    @DisplayName("addToCart â€” increments quantity when item already in cart")
    void addToCart_existingItem_incrementsQuantity() {
        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(cartItem));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));

        cartService.addToCart(1L, req);

        assertThat(cartItem.getQuantity()).isEqualTo(4); // 2 + 2
        verify(cartItemRepository).save(cartItem);
    }

    @Test
    @DisplayName("addToCart â€” throws BadRequestException if product is inactive")
    void addToCart_inactiveProduct_throwsBadRequest() {
        activeProduct.setActive(false);
        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));

        assertThatThrownBy(() -> cartService.addToCart(1L, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("unavailable");
    }

    @Test
    @DisplayName("addToCart â€” throws BadRequestException if stock is insufficient")
    void addToCart_exceedsStock_throwsBadRequest() {
        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(15); // stock is 10

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));

        assertThatThrownBy(() -> cartService.addToCart(1L, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("available stock");
    }

    @Test
    @DisplayName("updateQuantity â€” cannot update item owned by another user")
    void updateQuantity_wrongUser_throwsBadRequest() {
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        assertThatThrownBy(() -> cartService.updateQuantity(99L, 100L, 5))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not belong to user");
    }

    @Test
    @DisplayName("updateQuantity â€” quantity 0 removes item from cart")
    void updateQuantity_zero_removesItem() {
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of());

        cartService.updateQuantity(1L, 100L, 0);

        verify(cartItemRepository).delete(cartItem);
    }

    @Test
    @DisplayName("removeItem â€” cannot remove item belonging to different user")
    void removeItem_wrongUser_throwsBadRequest() {
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        assertThatThrownBy(() -> cartService.removeItem(99L, 100L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not belong to user");
    }

    @Test
    @DisplayName("clearCart â€” deletes all items for user")
    void clearCart_success() {
        cartService.clearCart(1L);
        verify(cartItemRepository).deleteByUserId(1L);
    }

    private static void setId(Object entity, Long id) {
        try {
            Class<?> clazz = entity.getClass();
            while (clazz != null) {
                try {
                    var field = clazz.getDeclaredField("id");
                    field.setAccessible(true);
                    field.set(entity, id);
                    return;
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
