package com.grocery.service;

import com.grocery.dto.ProductResponse;
import com.grocery.entity.Product;
import com.grocery.entity.Vendor;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("name", "price", "createdAt", "stock", "category");

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    public ProductService(ProductRepository productRepository, VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    public Page<ProductResponse> getProducts(String search, String category, Long vendorId,
                                             int page, int size, String sortBy, String sortDir) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException("Invalid sort field '" + sortBy + "'. Allowed: " + ALLOWED_SORT_FIELDS);
        }
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productsPage = productRepository.findProductsWithFilters(search, category, vendorId, pageable);
        return productsPage.map(this::mapToProductResponse);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    public List<Map<String, Object>> getPublicVendors() {
        return vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && v.getUser().isActive())
                .map(v -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("description", v.getDescription());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public ProductResponse mapToProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategory(),
                product.getImageUrl(),
                product.getVendor().getId(),
                product.getVendor().getName(),
                product.isActive(),
                product.getCreatedAt()
        );
    }
}
