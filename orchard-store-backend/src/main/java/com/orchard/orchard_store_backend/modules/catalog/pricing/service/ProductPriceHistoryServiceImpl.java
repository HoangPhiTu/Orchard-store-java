package com.orchard.orchard_store_backend.modules.catalog.pricing.service;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.catalog.pricing.dto.ProductPriceHistoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.pricing.entity.ProductPriceHistory;
import com.orchard.orchard_store_backend.modules.catalog.pricing.mapper.ProductPriceHistoryMapper;
import com.orchard.orchard_store_backend.modules.catalog.pricing.repository.ProductPriceHistoryRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductPriceHistoryServiceImpl implements ProductPriceHistoryService {

    private final ProductPriceHistoryRepository priceHistoryRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final ProductPriceHistoryMapper priceHistoryMapper;

    @Override
    @Transactional
    public ProductPriceHistoryDTO createPriceHistory(ProductPriceHistoryDTO dto) {
        ProductVariant variant = variantRepository.findById(dto.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Product variant not found: " + dto.getProductVariantId()));

        ProductPriceHistory entity = priceHistoryMapper.toEntity(dto);
        entity.setProductVariant(variant);

        if (dto.getChangedById() != null) {
            User changedBy = userRepository.findById(dto.getChangedById())
                    .orElse(null);
            entity.setChangedBy(changedBy);
        }

        if (entity.getEffectiveFrom() == null) {
            entity.setEffectiveFrom(LocalDateTime.now());
        }

        ProductPriceHistory saved = priceHistoryRepository.save(entity);
        return priceHistoryMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductPriceHistoryDTO> getPriceHistoryByVariant(Long variantId, Pageable pageable) {
        return priceHistoryRepository.findByProductVariantIdOrderByCreatedAtDesc(variantId, pageable)
                .map(priceHistoryMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPriceHistoryDTO> getAllPriceHistoryByVariant(Long variantId) {
        return priceHistoryRepository.findByProductVariantIdOrderByCreatedAtDesc(variantId)
                .stream()
                .map(priceHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductPriceHistoryDTO getCurrentPrice(Long variantId) {
        return priceHistoryRepository.findCurrentPrice(variantId, LocalDateTime.now())
                .map(priceHistoryMapper::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPriceHistoryDTO> getPricesInRange(Long variantId, LocalDateTime startDate, LocalDateTime endDate) {
        return priceHistoryRepository.findPricesInRange(variantId, startDate, endDate)
                .stream()
                .map(priceHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPriceHistoryDTO> getPriceHistoryByPromotion(Long promotionId) {
        return priceHistoryRepository.findByPromotionIdOrderByCreatedAtDesc(promotionId)
                .stream()
                .map(priceHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPriceHistoryDTO> getPriceHistoryByChangeType(String changeType) {
        if (changeType == null || changeType.isEmpty()) {
            throw new RuntimeException("Change type cannot be null or empty");
        }
        ProductPriceHistory.PriceChangeType type = ProductPriceHistory.PriceChangeType.valueOf(changeType.toUpperCase());
        return priceHistoryRepository.findByPriceChangeTypeOrderByCreatedAtDesc(type)
                .stream()
                .map(priceHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void recordPriceChange(Long variantId, BigDecimal oldPrice, BigDecimal newPrice,
                                 BigDecimal oldSalePrice, BigDecimal newSalePrice, Long changedById) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Product variant not found: " + variantId));

        // Xác định loại thay đổi
        ProductPriceHistory.PriceChangeType changeType = determineChangeType(oldPrice, newPrice);

        // Tính toán thay đổi
        BigDecimal changeAmount = newPrice.subtract(oldPrice);
        BigDecimal changePercentage = oldPrice.compareTo(BigDecimal.ZERO) > 0
                ? changeAmount.divide(oldPrice, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Đóng giá cũ (nếu có)
        priceHistoryRepository.findCurrentPrice(variantId, LocalDateTime.now())
                .ifPresent(currentPrice -> {
                    currentPrice.setEffectiveTo(LocalDateTime.now());
                    priceHistoryRepository.save(currentPrice);
                });

        // Tạo lịch sử giá mới
        ProductPriceHistory newHistory = ProductPriceHistory.builder()
                .productVariant(variant)
                .price(newPrice)
                .salePrice(newSalePrice)
                .previousPrice(oldPrice)
                .priceChangeType(changeType)
                .changeAmount(changeAmount)
                .changePercentage(changePercentage)
                .effectiveFrom(LocalDateTime.now())
                .build();

        if (changedById != null) {
            userRepository.findById(changedById).ifPresent(newHistory::setChangedBy);
        }

        priceHistoryRepository.save(newHistory);
        log.debug("Recorded price change for variant {}: {} -> {}", variantId, oldPrice, newPrice);
    }

    @Override
    @Transactional
    public void deletePriceHistory(Long id) {
        priceHistoryRepository.deleteById(id);
    }

    private ProductPriceHistory.PriceChangeType determineChangeType(BigDecimal oldPrice, BigDecimal newPrice) {
        if (oldPrice == null || newPrice == null) {
            return ProductPriceHistory.PriceChangeType.REGULAR;
        }

        int comparison = newPrice.compareTo(oldPrice);
        if (comparison > 0) {
            return ProductPriceHistory.PriceChangeType.INCREASE;
        } else if (comparison < 0) {
            return ProductPriceHistory.PriceChangeType.DECREASE;
        } else {
            return ProductPriceHistory.PriceChangeType.REGULAR;
        }
    }
}

