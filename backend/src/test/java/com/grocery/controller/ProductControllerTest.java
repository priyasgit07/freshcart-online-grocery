package com.grocery.controller;

import com.grocery.dto.ProductResponse;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.GlobalExceptionHandler;
import com.grocery.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private ProductResponse sampleProduct;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleProduct = new ProductResponse(
                1L, "Fresh Organic Apples", "Crisp apples", new BigDecimal("3.49"),
                100, "Fruits & Vegetables", "https://example.com/apples.jpg",
                1L, "Fresh Farms Organics", true, LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /api/products?size=4&sortBy=createdAt&sortDir=desc â€” controller returns products successfully")
    void getProducts_newestFirst_returns200() {
        when(productService.getProducts(isNull(), isNull(), isNull(), eq(0), eq(4), eq("createdAt"), eq("desc")))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        var response = productController.getProducts(null, null, null, 0, 4, "createdAt", "desc");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).hasSize(1);
        assertThat(response.getBody().getContent().get(0).getName()).isEqualTo("Fresh Organic Apples");
        assertThat(response.getBody().getContent().get(0).getPrice()).isEqualTo(new BigDecimal("3.49"));

        verify(productService).getProducts(isNull(), isNull(), isNull(), eq(0), eq(4), eq("createdAt"), eq("desc"));
    }

    @Test
    @DisplayName("GET /api/products with all 5 category filters â€” controller returns filtered products")
    void getProducts_fiveCategories_returns200() {
        List<String> categories = List.of(
                "Fruits & Vegetables",
                "Dairy & Eggs",
                "Bakery",
                "Beverages",
                "Pantry Staples"
        );

        for (String cat : categories) {
            ProductResponse catProduct = new ProductResponse(
                    2L, cat + " Item", "Sample", new BigDecimal("4.99"),
                    50, cat, "url", 1L, "Fresh Farms", true, LocalDateTime.now()
            );
            when(productService.getProducts(isNull(), eq(cat), isNull(), eq(0), eq(12), eq("createdAt"), eq("desc")))
                    .thenReturn(new PageImpl<>(List.of(catProduct)));

            var response = productController.getProducts(null, cat, null, 0, 12, "createdAt", "desc");
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getContent().get(0).getCategory()).isEqualTo(cat);
        }
    }

    @Test
    @DisplayName("GET /api/products?vendorId=1 â€” filters products by vendor successfully")
    void getProducts_vendorFilter_returns200() {
        when(productService.getProducts(isNull(), isNull(), eq(1L), eq(0), eq(12), eq("createdAt"), eq("desc")))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        var response = productController.getProducts(null, null, 1L, 0, 12, "createdAt", "desc");
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent().get(0).getVendorId()).isEqualTo(1L);
        assertThat(response.getBody().getContent().get(0).getVendorName()).isEqualTo("Fresh Farms Organics");

        verify(productService).getProducts(isNull(), isNull(), eq(1L), eq(0), eq(12), eq("createdAt"), eq("desc"));
    }

    @Test
    @DisplayName("GET /api/products with price sorting (asc and desc) â€” passes to service")
    void getProducts_priceSorting_returns200() {
        when(productService.getProducts(isNull(), isNull(), isNull(), eq(0), eq(12), eq("price"), eq("asc")))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        var response = productController.getProducts(null, null, null, 0, 12, "price", "asc");
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();

        verify(productService).getProducts(isNull(), isNull(), isNull(), eq(0), eq(12), eq("price"), eq("asc"));
    }

    @Test
    @DisplayName("GET /api/products with name sorting (asc and desc) â€” passes to service")
    void getProducts_nameSorting_returns200() {
        when(productService.getProducts(isNull(), isNull(), isNull(), eq(0), eq(12), eq("name"), eq("asc")))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        var response = productController.getProducts(null, null, null, 0, 12, "name", "asc");
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();

        verify(productService).getProducts(isNull(), isNull(), isNull(), eq(0), eq(12), eq("name"), eq("asc"));
    }

    @Test
    @DisplayName("GET /api/products?sortBy=id&sortDir=desc â€” rejected with HTTP 400 Bad Request by whitelist")
    void getProducts_sortByFieldId_returns400() throws Exception {
        when(productService.getProducts(any(), any(), any(), anyInt(), anyInt(), eq("id"), any()))
                .thenThrow(new BadRequestException("Invalid sort field 'id'. Allowed: [createdAt, category, price, stock, name]"));

        mockMvc.perform(get("/api/products")
                        .param("sortBy", "id")
                        .param("sortDir", "desc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid sort field 'id'")));
    }
}
