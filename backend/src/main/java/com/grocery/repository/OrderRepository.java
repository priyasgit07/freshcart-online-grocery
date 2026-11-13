package com.grocery.repository;

import com.grocery.entity.Order;
import com.grocery.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId ORDER BY o.createdAt DESC")
    List<Order> findOrdersByVendorId(@Param("vendorId") Long vendorId);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(i.quantity * i.price), 0) FROM OrderItem i WHERE i.product.vendor.id = :vendorId")
    BigDecimal sumVendorRevenue(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(DISTINCT o.id) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId")
    long countVendorOrders(@Param("vendorId") Long vendorId);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItem i WHERE i.product.vendor.id = :vendorId")
    long sumVendorItemsSold(@Param("vendorId") Long vendorId);
}
