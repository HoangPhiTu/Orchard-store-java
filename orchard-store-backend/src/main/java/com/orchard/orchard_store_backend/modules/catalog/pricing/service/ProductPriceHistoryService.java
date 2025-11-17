package com.orchard.orchard_store_backend.modules.catalog.pricing.service;

import com.orchard.orchard_store_backend.modules.catalog.pricing.dto.ProductPriceHistoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ProductPriceHistoryService {

    /**
     * Tạo lịch sử giá mới
     */
    ProductPriceHistoryDTO createPriceHistory(ProductPriceHistoryDTO dto);

    /**
     * Lấy lịch sử giá theo variant ID (có phân trang)
     */
    Page<ProductPriceHistoryDTO> getPriceHistoryByVariant(Long variantId, Pageable pageable);

    /**
     * Lấy tất cả lịch sử giá theo variant ID
     */
    List<ProductPriceHistoryDTO> getAllPriceHistoryByVariant(Long variantId);

    /**
     * Lấy giá hiện tại của variant
     */
    ProductPriceHistoryDTO getCurrentPrice(Long variantId);

    /**
     * Lấy giá trong khoảng thời gian
     */
    List<ProductPriceHistoryDTO> getPricesInRange(Long variantId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy lịch sử giá theo promotion ID
     */
    List<ProductPriceHistoryDTO> getPriceHistoryByPromotion(Long promotionId);

    /**
     * Lấy lịch sử giá theo loại thay đổi
     */
    List<ProductPriceHistoryDTO> getPriceHistoryByChangeType(String changeType);

    /**
     * Tự động tạo lịch sử giá khi giá variant thay đổi
     */
    void recordPriceChange(Long variantId, BigDecimal oldPrice, BigDecimal newPrice, 
                          BigDecimal oldSalePrice, BigDecimal newSalePrice, Long changedById);

    /**
     * Xóa lịch sử giá
     */
    void deletePriceHistory(Long id);
}

