package com.orchard.orchard_store_backend.modules.catalog.pricing.controller;

import com.orchard.orchard_store_backend.modules.catalog.pricing.dto.ProductPriceHistoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.pricing.service.ProductPriceHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing/history")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ProductPriceHistoryController {

    private final ProductPriceHistoryService priceHistoryService;

    /**
     * Tạo lịch sử giá mới
     */
    @PostMapping
    public ResponseEntity<ProductPriceHistoryDTO> createPriceHistory(
            @Valid @RequestBody ProductPriceHistoryDTO dto) {
        ProductPriceHistoryDTO created = priceHistoryService.createPriceHistory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Lấy lịch sử giá theo variant ID (có phân trang)
     */
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<Page<ProductPriceHistoryDTO>> getPriceHistoryByVariant(
            @PathVariable Long variantId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductPriceHistoryDTO> history = priceHistoryService.getPriceHistoryByVariant(variantId, pageable);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy tất cả lịch sử giá theo variant ID
     */
    @GetMapping("/variant/{variantId}/all")
    public ResponseEntity<List<ProductPriceHistoryDTO>> getAllPriceHistoryByVariant(
            @PathVariable Long variantId) {
        List<ProductPriceHistoryDTO> history = priceHistoryService.getAllPriceHistoryByVariant(variantId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy giá hiện tại của variant
     */
    @GetMapping("/variant/{variantId}/current")
    public ResponseEntity<ProductPriceHistoryDTO> getCurrentPrice(@PathVariable Long variantId) {
        ProductPriceHistoryDTO current = priceHistoryService.getCurrentPrice(variantId);
        if (current == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(current);
    }

    /**
     * Lấy giá trong khoảng thời gian
     */
    @GetMapping("/variant/{variantId}/range")
    public ResponseEntity<List<ProductPriceHistoryDTO>> getPricesInRange(
            @PathVariable Long variantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<ProductPriceHistoryDTO> history = priceHistoryService.getPricesInRange(variantId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy lịch sử giá theo promotion ID
     */
    @GetMapping("/promotion/{promotionId}")
    public ResponseEntity<List<ProductPriceHistoryDTO>> getPriceHistoryByPromotion(
            @PathVariable Long promotionId) {
        List<ProductPriceHistoryDTO> history = priceHistoryService.getPriceHistoryByPromotion(promotionId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy lịch sử giá theo loại thay đổi
     */
    @GetMapping("/change-type/{changeType}")
    public ResponseEntity<List<ProductPriceHistoryDTO>> getPriceHistoryByChangeType(
            @PathVariable String changeType) {
        List<ProductPriceHistoryDTO> history = priceHistoryService.getPriceHistoryByChangeType(changeType);
        return ResponseEntity.ok(history);
    }

    /**
     * Xóa lịch sử giá
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePriceHistory(@PathVariable Long id) {
        priceHistoryService.deletePriceHistory(id);
        return ResponseEntity.noContent().build();
    }
}

