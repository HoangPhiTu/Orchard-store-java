package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    Page<ProductDTO> getAllProducts(Pageable pageable);

    ProductDTO getProductById(Long id);

    ProductDTO getProductBySlug(String slug);

    Page<ProductDTO> searchProducts(Long brandId, Long categoryId,
                                    BigDecimal minPrice, BigDecimal maxPrice,
                                    String searchTerm, Pageable pageable);

    List<ProductDTO> getFeaturedProducts();

    Page<ProductDTO> getNewProducts(Pageable pageable);

    Page<ProductDTO> getBestsellerProducts(Pageable pageable);

    Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable);

    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    void deleteProduct(Long id);
}

