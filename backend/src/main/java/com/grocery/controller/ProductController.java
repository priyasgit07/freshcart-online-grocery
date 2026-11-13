package com.grocery.controller;

import com.grocery.dto.ProductResponse;
import com.grocery.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Public endpoints for catalog browsing, searching, and filtering")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Browse and search products with pagination, category filter, and vendor filter")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(productService.getProducts(search, category, vendorId, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single product details by id")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get distinct product categories list")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping("/vendors")
    @Operation(summary = "Get list of vendors for catalog filtering")
    public ResponseEntity<List<Map<String, Object>>> getVendors() {
        return ResponseEntity.ok(productService.getPublicVendors());
    }
}
