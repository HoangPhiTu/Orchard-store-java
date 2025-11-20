package com.orchard.orchard_store_backend.modules.promotion.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.order.entity.Order;
import com.orchard.orchard_store_backend.modules.promotion.entity.Promotion;
import com.orchard.orchard_store_backend.modules.promotion.entity.PromotionUsage;
import com.orchard.orchard_store_backend.modules.promotion.repository.PromotionRepository;
import com.orchard.orchard_store_backend.modules.promotion.repository.PromotionUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public PromotionValidationResult validatePromotion(String code, BigDecimal orderTotal, Long customerId) {
        if (!StringUtils.hasText(code)) {
            return PromotionValidationResult.empty();
        }

        Promotion promotion = promotionRepository.findByCodeAndStatus(code.trim().toUpperCase(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", code));

        LocalDateTime now = LocalDateTime.now();
        if (promotion.getStartDate().isAfter(now) || promotion.getEndDate().isBefore(now)) {
            throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn.");
        }

        if (promotion.getUsageLimit() != null
                && promotion.getUsageCount() >= promotion.getUsageLimit()) {
            throw new IllegalArgumentException("Mã khuyến mãi đã được sử dụng hết.");
        }

        BigDecimal minPurchase = Optional.ofNullable(promotion.getMinPurchaseAmount()).orElse(BigDecimal.ZERO);
        if (orderTotal == null || orderTotal.compareTo(minPurchase) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đạt mức tối thiểu để dùng mã.");
        }

        if (customerId != null) {
            long usageByCustomer = promotionUsageRepository.countByPromotionIdAndCustomerId(promotion.getId(), customerId);
            if (usageByCustomer >= promotion.getUsageLimitPerUser()) {
                throw new IllegalArgumentException("Bạn đã sử dụng mã này quá số lần cho phép.");
            }
        }

        BigDecimal discountAmount = calculateDiscountAmount(promotion, orderTotal);
        return PromotionValidationResult.builder()
                .promotion(promotion)
                .discountAmount(discountAmount)
                .build();
    }

    @Transactional
    public void recordPromotionUsage(Promotion promotion, BigDecimal discountAmount, Long customerId, Order order) {
        Promotion lockedPromotion = promotionRepository.findById(promotion.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", promotion.getId()));

        if (lockedPromotion.getUsageLimit() != null
                && lockedPromotion.getUsageCount() >= lockedPromotion.getUsageLimit()) {
            throw new IllegalArgumentException("Mã khuyến mãi đã đạt giới hạn sử dụng. Vui lòng chọn mã khác.");
        }

        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
            long usageByCustomer = promotionUsageRepository.countByPromotionIdAndCustomerId(promotion.getId(), customerId);
            if (usageByCustomer >= lockedPromotion.getUsageLimitPerUser()) {
                throw new IllegalArgumentException("Bạn đã sử dụng mã này quá số lần cho phép.");
            }
        }

        lockedPromotion.setUsageCount(lockedPromotion.getUsageCount() + 1);
        promotionRepository.save(lockedPromotion);

        PromotionUsage usage = PromotionUsage.builder()
                .promotion(lockedPromotion)
                .customer(customer)
                .order(order)
                .discountAmount(discountAmount)
                .build();
        promotionUsageRepository.save(usage);
    }

    private BigDecimal calculateDiscountAmount(Promotion promotion, BigDecimal orderTotal) {
        if (orderTotal == null || orderTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal discountValue = Optional.ofNullable(promotion.getDiscountValue()).orElse(BigDecimal.ZERO);
        BigDecimal discountAmount = BigDecimal.ZERO;

        switch (promotion.getDiscountType()) {
            case "PERCENTAGE":
                discountAmount = orderTotal.multiply(discountValue)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                break;
            case "FIXED_AMOUNT":
                discountAmount = discountValue;
                break;
            default:
                discountAmount = BigDecimal.ZERO;
        }

        BigDecimal maxDiscount = Optional.ofNullable(promotion.getMaxDiscountAmount()).orElse(null);
        if (maxDiscount != null && discountAmount.compareTo(maxDiscount) > 0) {
            discountAmount = maxDiscount;
        }

        if (discountAmount.compareTo(orderTotal) > 0) {
            discountAmount = orderTotal;
        }

        return discountAmount.max(BigDecimal.ZERO);
    }

    @lombok.Data
    @lombok.Builder
    public static class PromotionValidationResult {
        private Promotion promotion;
        private BigDecimal discountAmount;

        public static PromotionValidationResult empty() {
            return PromotionValidationResult.builder()
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        public boolean isApplied() {
            return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0 && promotion != null;
        }
    }
}

