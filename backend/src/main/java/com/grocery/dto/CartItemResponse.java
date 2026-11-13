package com.grocery.dto;

import java.math.BigDecimal;

public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productCategory;
    private BigDecimal productPrice;
    private String productImageUrl;
    private Integer availableStock;
    private Integer quantity;
    private BigDecimal itemTotal;

    public CartItemResponse() {
    }

    public CartItemResponse(Long id, Long productId, String productName, String productCategory,
                            BigDecimal productPrice, String productImageUrl, Integer availableStock,
                            Integer quantity, BigDecimal itemTotal) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productCategory = productCategory;
        this.productPrice = productPrice;
        this.productImageUrl = productImageUrl;
        this.availableStock = availableStock;
        this.quantity = quantity;
        this.itemTotal = itemTotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(Integer availableStock) {
        this.availableStock = availableStock;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(BigDecimal itemTotal) {
        this.itemTotal = itemTotal;
    }
}
