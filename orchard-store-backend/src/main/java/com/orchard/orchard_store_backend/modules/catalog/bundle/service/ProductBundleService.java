package com.orchard.orchard_store_backend.modules.catalog.bundle.service;

import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.ProductBundleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductBundleService {

    /**
     * Tạo bundle mới
     */
    ProductBundleDTO createBundle(ProductBundleDTO dto);

    /**
     * Lấy bundle theo ID
     */
    ProductBundleDTO getBundleById(Long id);

    /**
     * Lấy bundle theo slug
     */
    ProductBundleDTO getBundleBySlug(String slug);

    /**
     * Lấy tất cả bundles (có phân trang)
     */
    Page<ProductBundleDTO> getAllBundles(String status, Pageable pageable);

    /**
     * Lấy bundles theo loại
     */
    List<ProductBundleDTO> getBundlesByType(String bundleType, String status);

    /**
     * Lấy bundles đang active (trong thời gian hiệu lực)
     */
    List<ProductBundleDTO> getActiveBundles(String status);

    /**
     * Lấy bundles đang active theo loại
     */
    List<ProductBundleDTO> getActiveBundlesByType(String bundleType, String status);

    /**
     * Lấy top bundles có discount cao nhất
     */
    Page<ProductBundleDTO> getTopDiscountBundles(Pageable pageable);

    /**
     * Cập nhật bundle
     */
    ProductBundleDTO updateBundle(Long id, ProductBundleDTO dto);

    /**
     * Xóa bundle
     */
    void deleteBundle(Long id);

    /**
     * Tính toán giá bundle dựa trên items
     */
    ProductBundleDTO calculateBundlePrice(Long bundleId);
}

