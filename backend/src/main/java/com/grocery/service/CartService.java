package com.grocery.service;

import com.grocery.dto.CartItemRequest;
import com.grocery.dto.CartItemResponse;
import com.grocery.dto.CartSummaryResponse;
import com.grocery.entity.CartItem;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartSummaryResponse getCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        List<CartItemResponse> responses = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cartItems) {
            Product p = item.getProduct();
            BigDecimal itemTotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
            totalItems += item.getQuantity();

            responses.add(new CartItemResponse(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getCategory(),
                    p.getPrice(),
                    p.getImageUrl(),
                    p.getStock(),
                    item.getQuantity(),
                    itemTotal
            ));
        }

        return new CartSummaryResponse(responses, totalPrice, totalItems);
    }

    @Transactional
    public CartSummaryResponse addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        if (product.getStock() <= 0) {
            throw new BadRequestException("Product '" + product.getName() + "' is out of stock");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStock()) {
                throw new BadRequestException("Cannot add more than available stock (" + product.getStock() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > product.getStock()) {
                throw new BadRequestException("Cannot add more than available stock (" + product.getStock() + ")");
            }
            CartItem newItem = new CartItem(user, product, request.getQuantity());
            cartItemRepository.save(newItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartSummaryResponse updateQuantity(Long userId, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStock()) {
                throw new BadRequestException("Cannot request more than available stock (" + item.getProduct().getStock() + ")");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(userId);
    }

    @Transactional
    public CartSummaryResponse removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
