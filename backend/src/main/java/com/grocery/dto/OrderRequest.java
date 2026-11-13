package com.grocery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @NotBlank(message = "Delivery address is required")
    @Size(max = 500, message = "Delivery address must not exceed 500 characters")
    private String deliveryAddress;

    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String customerPhone;

    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    public OrderRequest() {
    }

    public OrderRequest(String deliveryAddress, String customerPhone, String customerName) {
        this.deliveryAddress = deliveryAddress;
        this.customerPhone = customerPhone;
        this.customerName = customerName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}
