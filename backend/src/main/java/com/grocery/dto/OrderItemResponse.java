package com.grocery.dto;

import java.math.BigDecimal;

public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productCategory;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal itemTotal;
    private Long vendorId;
    private String vendorName;

    public OrderItemResponse() {
    }

    public OrderItemResponse(Long id, Long productId, String productName, String productCategory,
                             String productImageUrl, Integer quantity, BigDecimal price,
                             BigDecimal itemTotal, Long vendorId, String vendorName) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productCategory = productCategory;
        this.productImageUrl = productImageUrl;
        this.quantity = quantity;
        this.price = price;
        this.itemTotal = itemTotal;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
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

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(BigDecimal itemTotal) {
        this.itemTotal = itemTotal;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }
}
