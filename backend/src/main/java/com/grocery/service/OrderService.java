package com.grocery.service;

import com.grocery.dto.OrderItemResponse;
import com.grocery.dto.OrderRequest;
import com.grocery.dto.OrderResponse;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        Set<User> vendorsToNotify = new HashSet<>();

        // Validate stock
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStock());
            }
        }

        String customerName = (request.getCustomerName() != null && !request.getCustomerName().isBlank())
                ? request.getCustomerName() : customer.getName();
        String customerPhone = (request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank())
                ? request.getCustomerPhone() : customer.getPhone();

        Order order = new Order(
                customer,
                BigDecimal.ZERO,
                request.getDeliveryAddress(),
                customerPhone,
                customerName
        );

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);

            // Decrement inventory
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(order, product, item.getQuantity(), product.getPrice());
            order.addItem(orderItem);

            if (product.getVendor() != null && product.getVendor().getUser() != null) {
                vendorsToNotify.add(product.getVendor().getUser());
            }
        }

        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        // FR9.1: Notification to vendors
        for (User vendorUser : vendorsToNotify) {
            notificationService.createNotification(
                    vendorUser,
                    "New Order #" + savedOrder.getId() + " placed containing your products. Total: $" + savedOrder.getTotalPrice(),
                    "NEW_ORDER"
            );
        }

        // Notification to customer
        notificationService.createNotification(
                customer,
                "Your order #" + savedOrder.getId() + " has been placed successfully via Cash on Delivery.",
                "ORDER_PLACED"
        );

        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getCustomerOrders(Long userId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Cancels an order, restoring inventory for all items atomically.
     *
     * Business rules (Phase 1 decisions):
     *  - PENDING  â†’ CANCELLED  : allowed for both customer and vendor.
     *  - CONFIRMED â†’ CANCELLED : blocked. Must be escalated to support.
     *  - SHIPPED  â†’ CANCELLED  : blocked (goods in transit).
     *  - DELIVEREDâ†’ CANCELLED  : blocked (goods received).
     *
     * @param orderId    the order to cancel
     * @param requestingUser the authenticated user making the request
     * @param actorRole  "CUSTOMER" or "VENDOR" â€” controls authorization checks and notification text
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, User requestingUser, String actorRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // â”€â”€ Authorization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if ("CUSTOMER".equals(actorRole)) {
            if (!order.getCustomer().getId().equals(requestingUser.getId())) {
                throw new BadRequestException("You are not authorized to cancel this order.");
            }
        } else if ("VENDOR".equals(actorRole)) {
            boolean hasVendorProduct = order.getItems().stream().anyMatch(i ->
                    i.getProduct().getVendor() != null &&
                    i.getProduct().getVendor().getUser().getId().equals(requestingUser.getId())
            );
            if (!hasVendorProduct) {
                throw new BadRequestException("This order does not contain items from your store.");
            }
        }

        // â”€â”€ Status gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        switch (order.getStatus()) {
            case CANCELLED:
                throw new BadRequestException("Order #" + orderId + " is already cancelled.");
            case CONFIRMED:
                throw new BadRequestException(
                        "Order #" + orderId + " is CONFIRMED and cannot be cancelled through the standard flow. " +
                        "Please contact customer support.");
            case SHIPPED:
                throw new BadRequestException(
                        "Order #" + orderId + " has already been shipped and cannot be cancelled.");
            case DELIVERED:
                throw new BadRequestException(
                        "Order #" + orderId + " has been delivered and cannot be cancelled.");
            case PENDING:
                break; // allowed â€” fall through
        }

        // â”€â”€ Restore inventory (exactly once, inside this transaction) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        // â”€â”€ Update status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        String customerMsg;
        if ("VENDOR".equals(actorRole)) {
            customerMsg = "Your order #" + orderId + " has been rejected by the vendor and cancelled. " +
                          "Your items are back in stock.";
        } else {
            customerMsg = "Your order #" + orderId + " has been cancelled successfully. " +
                          "Items have been returned to stock.";
        }
        notificationService.createNotification(order.getCustomer(), customerMsg, "ORDER_CANCELLED");

        // Notify each unique vendor whose items were in this order
        Set<User> vendorUsers = new HashSet<>();
        for (OrderItem item : order.getItems()) {
            if (item.getProduct().getVendor() != null && item.getProduct().getVendor().getUser() != null) {
                vendorUsers.add(item.getProduct().getVendor().getUser());
            }
        }
        for (User vendorUser : vendorUsers) {
            String vendorMsg = "CUSTOMER".equals(actorRole)
                    ? "Customer cancelled order #" + orderId + ". Stock has been restored."
                    : "You rejected order #" + orderId + ". Stock has been restored.";
            notificationService.createNotification(vendorUser, vendorMsg, "ORDER_CANCELLED");
        }

        return mapToOrderResponse(saved);
    }

    public OrderResponse getOrderById(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check authorization
        boolean isCustomer = order.getCustomer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isVendorOfItem = order.getItems().stream().anyMatch(i ->
                i.getProduct().getVendor() != null &&
                i.getProduct().getVendor().getUser().getId().equals(currentUser.getId())
        );

        if (!isCustomer && !isAdmin && !isVendorOfItem) {
            throw new BadRequestException("Not authorized to view this order");
        }

        return mapToOrderResponse(order);
    }

    public OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            Long vendorId = item.getProduct().getVendor() != null ? item.getProduct().getVendor().getId() : null;
            String vendorName = item.getProduct().getVendor() != null ? item.getProduct().getVendor().getName() : "Unknown";

            return new OrderItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getProduct().getCategory(),
                    item.getProduct().getImageUrl(),
                    item.getQuantity(),
                    item.getPrice(),
                    itemTotal,
                    vendorId,
                    vendorName
            );
        }).collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomerName() != null ? order.getCustomerName() : order.getCustomer().getName(),
                order.getCustomer().getEmail(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses
        );
    }
}
