package com.grocery.repository;

import com.grocery.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByVendorId(Long vendorId);

    List<Product> findByVendorUserId(Long userId);

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category)) " +
           "AND (:vendorId IS NULL OR p.vendor.id = :vendorId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findProductsWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("vendorId") Long vendorId,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.active = true AND p.category IS NOT NULL ORDER BY p.category ASC")
    List<String> findDistinctCategories();

    long countByVendorId(Long vendorId);

    long countByVendorIdAndStockLessThan(Long vendorId, int threshold);
}
