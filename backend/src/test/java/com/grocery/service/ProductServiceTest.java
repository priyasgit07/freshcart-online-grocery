package com.grocery.service;

import com.grocery.dto.ProductResponse;
import com.grocery.entity.Product;
import com.grocery.entity.Vendor;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProductService â€” covers product retrieval, sorting whitelist,
 * category listing, and validation.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private VendorRepository vendorRepository;

    @InjectMocks private ProductService productService;

    private Product product;

    @BeforeEach
    void setUp() {
        Vendor vendor = new Vendor(null, "Fresh Store", "555-0100", "Fresh produce");
        setId(vendor, 1L);

        product = new Product("Gala Apples", "Crisp apples", new BigDecimal("2.99"), vendor, 50, "Fruits", "url");
        setId(product, 1L);
    }

    @Test
    @DisplayName("getProducts â€” allowed sortBy field passes through to repository")
    void getProducts_validSortBy_success() {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.findProductsWithFilters(any(), any(), any(), any(Pageable.class))).thenReturn(page);

        Page<ProductResponse> result = productService.getProducts("Apple", "Fruits", 1L, 0, 10, "price", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Gala Apples");
    }

    @Test
    @DisplayName("getProducts â€” newest first sort with createdAt desc passes through to repository")
    void getProducts_newestFirstSortByCreatedAtDesc_success() {
        Page<Product> page = new PageImpl<>(List.of(product));
        org.mockito.ArgumentCaptor<Pageable> pageableCaptor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        when(productRepository.findProductsWithFilters(isNull(), isNull(), isNull(), pageableCaptor.capture())).thenReturn(page);

        Page<ProductResponse> result = productService.getProducts(null, null, null, 0, 4, "createdAt", "desc");

        assertThat(result.getContent()).hasSize(1);
        Pageable capturedPageable = pageableCaptor.getValue();
        assertThat(capturedPageable.getPageSize()).isEqualTo(4);
        assertThat(capturedPageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(capturedPageable.getSort().getOrderFor("createdAt").isDescending()).isTrue();
    }

    @Test
    @DisplayName("getProducts â€” category and vendor filters pass through to repository")
    void getProducts_filtersPassThrough_success() {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.findProductsWithFilters(eq("Organic"), eq("Fruits & Vegetables"), eq(2L), any(Pageable.class))).thenReturn(page);

        Page<ProductResponse> result = productService.getProducts("Organic", "Fruits & Vegetables", 2L, 0, 12, "name", "asc");

        assertThat(result.getContent()).hasSize(1);
        verify(productRepository).findProductsWithFilters(eq("Organic"), eq("Fruits & Vegetables"), eq(2L), any(Pageable.class));
    }

    @Test
    @DisplayName("getProducts â€” sorting by id is rejected by whitelist")
    void getProducts_idSortBy_throwsBadRequest() {
        assertThatThrownBy(() -> productService.getProducts(null, null, null, 0, 10, "id", "desc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sort field 'id'");
    }

    @Test
    @DisplayName("getProducts â€” invalid sortBy field throws BadRequestException (SQL injection / property exposure guard)")
    void getProducts_invalidSortBy_throwsBadRequest() {
        assertThatThrownBy(() -> productService.getProducts(null, null, null, 0, 10, "creditCardNumber", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sort field");
    }

    @Test
    @DisplayName("getProductById â€” existing product returns mapped DTO")
    void getProductById_existing_returnsProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Gala Apples");
        assertThat(response.getVendorName()).isEqualTo("Fresh Store");
    }

    @Test
    @DisplayName("getProductById â€” missing product throws ResourceNotFoundException")
    void getProductById_notFound_throwsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    @DisplayName("getCategories â€” returns distinct category list")
    void getCategories_returnsList() {
        when(productRepository.findDistinctCategories()).thenReturn(List.of("Fruits", "Bakery", "Dairy"));

        List<String> categories = productService.getCategories();

        assertThat(categories).containsExactly("Fruits", "Bakery", "Dairy");
    }

    private static void setId(Object entity, Long id) {
        try {
            Class<?> clazz = entity.getClass();
            while (clazz != null) {
                try {
                    var field = clazz.getDeclaredField("id");
                    field.setAccessible(true);
                    field.set(entity, id);
                    return;
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
