package com.grocery.service;

import com.grocery.dto.OrderRequest;
import com.grocery.dto.OrderResponse;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.OrderRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OrderService â€” covers order placement, cancellation,
 * status gates, ownership enforcement, and inventory restoration.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private OrderService orderService;

    private User customer;
    private User vendorUser;
    private Vendor vendor;
    private Product product;
    private CartItem cartItem;
    private Order pendingOrder;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        customer = new User("Sarah Customer", "customer@test.com",
                "$2a$10$hash", Role.CUSTOMER, "123 Main St", "555-0100");
        setId(customer, 1L);
        customer.setActive(true);

        vendorUser = new User("Robert Green", "vendor@test.com",
                "$2a$10$hash", Role.VENDOR, "Farm Road", "555-0101");
        setId(vendorUser, 2L);

        vendor = new Vendor(vendorUser, "Fresh Farms", "555-0101", "Organic produce");
        setId(vendor, 1L);

        product = new Product("Fresh Apples", "Crisp apples", new BigDecimal("3.49"),
                vendor, 45, "Fruits & Vegetables",
                "https://example.com/apple.jpg");
        setId(product, 1L);

        cartItem = new CartItem(customer, product, 2);
        setId(cartItem, 1L);

        pendingOrder = new Order(customer, BigDecimal.ZERO, "123 Main St", "555-0100", "Sarah Customer");
        setId(pendingOrder, 10L);
        pendingOrder.setStatus(OrderStatus.PENDING);

        orderItem = new OrderItem(pendingOrder, product, 2, product.getPrice());
        setId(orderItem, 1L);
        pendingOrder.addItem(orderItem);
        pendingOrder.setTotalPrice(new BigDecimal("6.98"));
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // placeOrder
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Test
    @DisplayName("placeOrder â€” happy path: creates order, decrements stock, clears cart")
    void placeOrder_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            setId(o, 10L);
            return o;
        });

        OrderRequest request = new OrderRequest();
        request.setDeliveryAddress("123 Main St");
        request.setCustomerName("Sarah Customer");
        request.setCustomerPhone("555-0100");

        OrderResponse response = orderService.placeOrder(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(product.getStock()).isEqualTo(43); // 45 - 2
        verify(cartItemRepository).deleteByUserId(1L);
        verify(notificationService, atLeastOnce()).createNotification(any(), anyString(), anyString());
    }

    @Test
    @DisplayName("placeOrder â€” empty cart throws BadRequestException")
    void placeOrder_emptyCart_throwsBadRequest() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        OrderRequest request = new OrderRequest();
        request.setDeliveryAddress("123 Main St");

        assertThatThrownBy(() -> orderService.placeOrder(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("empty cart");
    }

    @Test
    @DisplayName("placeOrder â€” insufficient stock throws BadRequestException")
    void placeOrder_insufficientStock_throwsBadRequest() {
        product.setStock(1); // only 1 but cart has 2
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));

        OrderRequest request = new OrderRequest();
        request.setDeliveryAddress("123 Main St");

        assertThatThrownBy(() -> orderService.placeOrder(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    @DisplayName("placeOrder â€” inactive product throws BadRequestException")
    void placeOrder_inactiveProduct_throwsBadRequest() {
        product.setActive(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));

        OrderRequest request = new OrderRequest();
        request.setDeliveryAddress("123 Main St");

        assertThatThrownBy(() -> orderService.placeOrder(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no longer available");
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // cancelOrder â€” customer path
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Test
    @DisplayName("cancelOrder â€” customer cancels own PENDING order: stock restored")
    void cancelOrder_customer_pendingOrder_success() {
        int stockBefore = product.getStock(); // 45
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);

        OrderResponse response = orderService.cancelOrder(10L, customer, "CUSTOMER");

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStock()).isEqualTo(stockBefore + 2); // inventory restored
        verify(notificationService, atLeastOnce()).createNotification(eq(customer), anyString(), eq("ORDER_CANCELLED"));
    }

    @Test
    @DisplayName("cancelOrder â€” customer cannot cancel another customer's order")
    void cancelOrder_customer_wrongOwner_throwsBadRequest() {
        User otherCustomer = new User("Other User", "other@test.com", "hash", Role.CUSTOMER, "Addr", "555");
        setId(otherCustomer, 99L);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, otherCustomer, "CUSTOMER"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not authorized");
    }

    @Test
    @DisplayName("cancelOrder â€” double-cancel throws BadRequestException")
    void cancelOrder_alreadyCancelled_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, customer, "CUSTOMER"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    @DisplayName("cancelOrder â€” CONFIRMED order cannot be cancelled via normal flow")
    void cancelOrder_confirmedOrder_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.CONFIRMED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, customer, "CUSTOMER"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("CONFIRMED");
    }

    @Test
    @DisplayName("cancelOrder â€” SHIPPED order cannot be cancelled")
    void cancelOrder_shippedOrder_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.SHIPPED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, customer, "CUSTOMER"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("shipped");
    }

    @Test
    @DisplayName("cancelOrder â€” DELIVERED order cannot be cancelled")
    void cancelOrder_deliveredOrder_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, customer, "CUSTOMER"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("delivered");
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // cancelOrder â€” vendor path
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Test
    @DisplayName("cancelOrder â€” vendor rejects PENDING order with their item: stock restored")
    void cancelOrder_vendor_rejectsPendingOrder_success() {
        int stockBefore = product.getStock();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);

        OrderResponse response = orderService.cancelOrder(10L, vendorUser, "VENDOR");

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStock()).isEqualTo(stockBefore + 2);
    }

    @Test
    @DisplayName("cancelOrder â€” vendor cannot reject order that doesn't contain their items")
    void cancelOrder_vendor_noItemsInOrder_throwsBadRequest() {
        User otherVendorUser = new User("Other Vendor", "other-v@test.com", "hash", Role.VENDOR, "Addr", "555");
        setId(otherVendorUser, 50L);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(10L, otherVendorUser, "VENDOR"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not contain items");
    }

    @Test
    @DisplayName("cancelOrder â€” order not found throws ResourceNotFoundException")
    void cancelOrder_orderNotFound_throwsNotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.cancelOrder(999L, customer, "CUSTOMER"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Helper â€” reflection-based ID setter (entities don't expose setId via constructor)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @SuppressWarnings("SameParameterValue")
    private static void setId(Object entity, Long id) {
        try {
            // Walk superclass chain to find field named "id"
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
            throw new RuntimeException("No 'id' field found on " + entity.getClass().getName());
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
