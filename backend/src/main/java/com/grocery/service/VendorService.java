package com.grocery.service;

import com.grocery.dto.DashboardMetricsResponse;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.ProductRequest;
import com.grocery.dto.ProductResponse;
import com.grocery.entity.*;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final OrderService orderService;
    private final NotificationService notificationService;

    public VendorService(VendorRepository vendorRepository,
                         ProductRepository productRepository,
                         OrderRepository orderRepository,
                         ProductService productService,
                         OrderService orderService,
                         NotificationService notificationService) {
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.orderService = orderService;
        this.notificationService = notificationService;
    }

    public Vendor getVendorByUserId(Long userId) {
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for user id: " + userId));
    }

    public List<ProductResponse> getVendorProducts(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        return productRepository.findByVendorId(vendor.getId())
                .stream()
                .filter(Product::isActive)
                .map(productService::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(Long userId, ProductRequest request) {
        Vendor vendor = getVendorByUserId(userId);

        Product product = new Product(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                vendor,
                request.getStock(),
                request.getCategory(),
                request.getImageUrl()
        );

        Product saved = productRepository.save(product);
        return productService.mapToProductResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long userId, Long productId, ProductRequest request) {
        Vendor vendor = getVendorByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new BadRequestException("You do not have permission to modify this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            product.setImageUrl(request.getImageUrl());
        }

        Product updated = productRepository.save(product);
        return productService.mapToProductResponse(updated);
    }

    @Transactional
    public ProductResponse updateStock(Long userId, Long productId, Integer newStock) {
        Vendor vendor = getVendorByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new BadRequestException("You do not have permission to modify this product");
        }

        product.setStock(newStock);
        Product updated = productRepository.save(product);
        return productService.mapToProductResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        Vendor vendor = getVendorByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new BadRequestException("You do not have permission to delete this product");
        }

        // Soft delete
        product.setActive(false);
        productRepository.save(product);
    }

    public List<OrderResponse> getVendorOrders(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        return orderRepository.findOrdersByVendorId(vendor.getId())
                .stream()
                .map(orderService::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long userId, Long orderId, OrderStatus newStatus) {
        Vendor vendor = getVendorByUserId(userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        boolean hasVendorProduct = order.getItems().stream().anyMatch(i ->
                i.getProduct().getVendor() != null &&
                i.getProduct().getVendor().getId().equals(vendor.getId())
        );

        if (!hasVendorProduct) {
            throw new BadRequestException("Order does not contain items from your store");
        }

        // â”€â”€ Status transition gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Allowed progression: PENDING â†’ CONFIRMED â†’ SHIPPED â†’ DELIVERED
        // CANCELLED must go through the dedicated cancel endpoint (which restores inventory).
        OrderStatus current = order.getStatus();
        boolean transitionAllowed = switch (current) {
            case PENDING    -> newStatus == OrderStatus.CONFIRMED;
            case CONFIRMED  -> newStatus == OrderStatus.SHIPPED;
            case SHIPPED    -> newStatus == OrderStatus.DELIVERED;
            default         -> false; // DELIVERED and CANCELLED are terminal
        };

        if (!transitionAllowed) {
            throw new BadRequestException(
                "Invalid status transition from " + current + " to " + newStatus +
                ". Allowed: PENDINGâ†’CONFIRMEDâ†’SHIPPEDâ†’DELIVERED. " +
                "To cancel/reject an order use the cancel endpoint."
            );
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        // FR9.2: Customer notification on order status change
        notificationService.createNotification(
                order.getCustomer(),
                "Your order #" + order.getId() + " status has been updated to: " + newStatus,
                "ORDER_STATUS_UPDATE"
        );

        return orderService.mapToOrderResponse(updatedOrder);
    }

    public DashboardMetricsResponse getVendorDashboardMetrics(Long userId) {
        Vendor vendor = getVendorByUserId(userId);

        BigDecimal revenue = orderRepository.sumVendorRevenue(vendor.getId());
        long orderCount = orderRepository.countVendorOrders(vendor.getId());
        long productCount = productRepository.countByVendorId(vendor.getId());
        long lowStockCount = productRepository.countByVendorIdAndStockLessThan(vendor.getId(), 10);

        List<Order> vendorOrders = orderRepository.findOrdersByVendorId(vendor.getId());
        Map<String, Long> statusCounts = new HashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            statusCounts.put(s.name(), 0L);
        }
        for (Order o : vendorOrders) {
            statusCounts.put(o.getStatus().name(), statusCounts.getOrDefault(o.getStatus().name(), 0L) + 1);
        }

        DashboardMetricsResponse metrics = new DashboardMetricsResponse();
        metrics.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
        metrics.setTotalOrders(orderCount);
        metrics.setTotalProducts(productCount);
        metrics.setLowStockProducts(lowStockCount);
        metrics.setOrdersByStatus(statusCounts);

        return metrics;
    }
}
