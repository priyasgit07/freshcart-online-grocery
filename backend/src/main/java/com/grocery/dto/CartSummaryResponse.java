package com.grocery.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartSummaryResponse {
    private List<CartItemResponse> items = new ArrayList<>();
    private BigDecimal totalPrice = BigDecimal.ZERO;
    private int totalItems = 0;

    public CartSummaryResponse() {
    }

    public CartSummaryResponse(List<CartItemResponse> items, BigDecimal totalPrice, int totalItems) {
        this.items = items;
        this.totalPrice = totalPrice;
        this.totalItems = totalItems;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
}
