package com.grocery.service;

import com.grocery.dto.ProductRequest;
import com.grocery.dto.ProductResponse;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VendorService â€” covers product CRUD ownership enforcement,
 * stock updates, and order status transition gates.
 */
@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock private VendorRepository vendorRepository;
    @Mock private ProductRepository productRepository;
    @Mock private com.grocery.repository.OrderRepository orderRepository;
    @Mock private ProductService productService;
    @Mock private OrderService orderService;
    @Mock private NotificationService notificationService;

    @InjectMocks private VendorService vendorService;

    private User vendorUser;
    private User otherVendorUser;
    private Vendor vendor;
    private Vendor otherVendor;
    private Product product;

    @BeforeEach
    void setUp() {
        vendorUser = new User("Robert Green", "vendor@test.com", "hash", Role.VENDOR, "Farm Rd", "555-0101");
        setId(vendorUser, 2L);
        otherVendorUser = new User("Other Vendor", "other@test.com", "hash", Role.VENDOR, "Other Rd", "555-0102");
        setId(otherVendorUser, 3L);

        vendor = new Vendor(vendorUser, "Fresh Farms", "555-0101", "Organic produce");
        setId(vendor, 1L);
        otherVendor = new Vendor(otherVendorUser, "Other Farm", "555-0102", "Other produce");
        setId(otherVendor, 2L);

        product = new Product("Fresh Apples", "Crisp apples", new BigDecimal("3.49"),
                vendor, 45, "Fruits & Vegetables", "https://example.com/apple.jpg");
        setId(product, 1L);
    }

    @Test
    @DisplayName("createProduct â€” vendor can create a product under their own vendor profile")
    void createProduct_success() {
        ProductRequest request = new ProductRequest();
        request.setName("Organic Bananas");
        request.setDescription("Sweet bananas");
        request.setPrice(new BigDecimal("1.99"));
        request.setStock(60);
        request.setCategory("Fruits & Vegetables");

        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            setId(p, 99L);
            return p;
        });
        ProductResponse mockResponse = new ProductResponse(99L, "Organic Bananas", "Sweet bananas",
                new BigDecimal("1.99"), 60, "Fruits & Vegetables", null, 1L, "Fresh Farms", true, null);
        when(productService.mapToProductResponse(any())).thenReturn(mockResponse);

        ProductResponse result = vendorService.createProduct(2L, request);

        assertThat(result.getName()).isEqualTo("Organic Bananas");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("updateProduct â€” vendor cannot update a product owned by another vendor")
    void updateProduct_wrongOwner_throwsBadRequest() {
        when(vendorRepository.findByUserId(3L)).thenReturn(Optional.of(otherVendor));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductRequest request = new ProductRequest();
        request.setName("Modified Name");
        request.setPrice(new BigDecimal("9.99"));
        request.setStock(10);
        request.setCategory("Other");

        assertThatThrownBy(() -> vendorService.updateProduct(3L, 1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("deleteProduct â€” vendor soft-deletes their own product")
    void deleteProduct_success() {
        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        vendorService.deleteProduct(2L, 1L);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("deleteProduct â€” vendor cannot delete another vendor's product")
    void deleteProduct_wrongOwner_throwsBadRequest() {
        when(vendorRepository.findByUserId(3L)).thenReturn(Optional.of(otherVendor));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> vendorService.deleteProduct(3L, 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("updateStock â€” vendor can update stock for their own product")
    void updateStock_success() {
        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        ProductResponse mockResponse = new ProductResponse(1L, "Fresh Apples", "Crisp apples",
                new BigDecimal("3.49"), 100, "Fruits & Vegetables", null, 1L, "Fresh Farms", true, null);
        when(productService.mapToProductResponse(any())).thenReturn(mockResponse);

        ProductResponse result = vendorService.updateStock(2L, 1L, 100);

        assertThat(result.getStock()).isEqualTo(100);
    }

    @Test
    @DisplayName("updateOrderStatus â€” PENDING to CONFIRMED is allowed")
    void updateOrderStatus_pendingToConfirmed_allowed() {
        User customer = new User("Sarah", "sarah@test.com", "hash", Role.CUSTOMER, "Addr", "555");
        setId(customer, 1L);
        Order order = new Order(customer, new BigDecimal("6.98"), "123 Main St", "555-0100", "Sarah");
        setId(order, 10L);
        order.setStatus(OrderStatus.PENDING);
        OrderItem item = new OrderItem(order, product, 2, product.getPrice());
        setId(item, 1L);
        order.addItem(item);

        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderService.mapToOrderResponse(any())).thenReturn(null);

        // Should not throw
        assertThatCode(() -> vendorService.updateOrderStatus(2L, 10L, OrderStatus.CONFIRMED))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("updateOrderStatus â€” PENDING to DELIVERED is not allowed (must go CONFIRMEDâ†’SHIPPEDâ†’DELIVERED)")
    void updateOrderStatus_pendingToDelivered_throwsBadRequest() {
        User customer = new User("Sarah", "sarah@test.com", "hash", Role.CUSTOMER, "Addr", "555");
        setId(customer, 1L);
        Order order = new Order(customer, new BigDecimal("6.98"), "123 Main St", "555-0100", "Sarah");
        setId(order, 10L);
        order.setStatus(OrderStatus.PENDING);
        OrderItem item = new OrderItem(order, product, 2, product.getPrice());
        setId(item, 1L);
        order.addItem(item);

        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> vendorService.updateOrderStatus(2L, 10L, OrderStatus.DELIVERED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    @DisplayName("updateOrderStatus â€” setting CANCELLED via status endpoint is blocked (must use cancel endpoint)")
    void updateOrderStatus_setCancelled_throwsBadRequest() {
        User customer = new User("Sarah", "sarah@test.com", "hash", Role.CUSTOMER, "Addr", "555");
        setId(customer, 1L);
        Order order = new Order(customer, new BigDecimal("6.98"), "123 Main St", "555-0100", "Sarah");
        setId(order, 10L);
        order.setStatus(OrderStatus.PENDING);
        OrderItem item = new OrderItem(order, product, 2, product.getPrice());
        setId(item, 1L);
        order.addItem(item);

        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> vendorService.updateOrderStatus(2L, 10L, OrderStatus.CANCELLED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancel endpoint");
    }

    @Test
    @DisplayName("updateOrderStatus â€” vendor cannot update an order with none of their items")
    void updateOrderStatus_vendorHasNoItemsInOrder_throwsBadRequest() {
        User customer = new User("Sarah", "sarah@test.com", "hash", Role.CUSTOMER, "Addr", "555");
        setId(customer, 1L);
        Order order = new Order(customer, new BigDecimal("6.98"), "123 Main St", "555-0100", "Sarah");
        setId(order, 10L);
        order.setStatus(OrderStatus.PENDING);
        // Order has a product from otherVendor, not from vendor
        Product otherProduct = new Product("Other Item", "Desc", new BigDecimal("5.00"), otherVendor, 10, "Other", null);
        setId(otherProduct, 2L);
        OrderItem item = new OrderItem(order, otherProduct, 1, otherProduct.getPrice());
        setId(item, 1L);
        order.addItem(item);

        when(vendorRepository.findByUserId(2L)).thenReturn(Optional.of(vendor));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> vendorService.updateOrderStatus(2L, 10L, OrderStatus.CONFIRMED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not contain items from your store");
    }

    // Helper
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
