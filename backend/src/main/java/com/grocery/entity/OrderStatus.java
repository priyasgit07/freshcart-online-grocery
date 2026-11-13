package com.grocery.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    /**
     * CANCELLED: Set when a customer cancels a PENDING order, or when a vendor
     * rejects a PENDING order. Inventory is restored transactionally.
     * SHIPPED and DELIVERED orders cannot be cancelled through the normal flow.
     */
    CANCELLED
}
