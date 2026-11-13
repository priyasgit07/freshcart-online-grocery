package com.grocery.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class DashboardMetricsResponse {
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long totalOrders = 0;
    private long totalProducts = 0;
    private long totalVendors = 0;
    private long totalCustomers = 0;
    private long totalUsers = 0;
    private long lowStockProducts = 0;
    private Map<String, Long> ordersByStatus = new HashMap<>();

    public DashboardMetricsResponse() {
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    /** Total registered users across all roles */
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }
}
