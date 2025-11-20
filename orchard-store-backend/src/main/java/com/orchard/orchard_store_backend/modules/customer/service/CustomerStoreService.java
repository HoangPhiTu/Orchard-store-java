package com.orchard.orchard_store_backend.modules.customer.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.customer.dto.CustomerProfileDTO;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.entity.MemberPricingTier;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.customer.repository.MemberPricingTierRepository;
import com.orchard.orchard_store_backend.modules.order.entity.Order;
import com.orchard.orchard_store_backend.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CustomerStoreService {

    private final CustomerRepository customerRepository;
    private final MemberPricingTierRepository memberPricingTierRepository;
    private final OrderRepository orderRepository;

    public CustomerProfileDTO getCustomerProfile() {
        Customer customer = getCurrentCustomer();
        BigDecimal totalPurchase = Optional.ofNullable(customer.getTotalPurchaseAmount()).orElse(BigDecimal.ZERO);

        List<MemberPricingTier> tiers = memberPricingTierRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(MemberPricingTier::getTierLevel))
                .collect(Collectors.toList());

        MemberPricingTier currentTier = resolveCurrentTier(customer, totalPurchase, tiers);
        MemberPricingTier nextTier = resolveNextTier(currentTier, tiers);

        CustomerProfileDTO.VipInfo vipInfo = buildVipInfo(currentTier, nextTier, totalPurchase);
        List<CustomerProfileDTO.OrderSummaryDTO> recentOrders = mapOrders(
                orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
        );

        return CustomerProfileDTO.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .availablePoints(customer.getAvailablePoints())
                .totalPurchaseAmount(totalPurchase)
                .vipInfo(vipInfo)
                .recentOrders(recentOrders)
                .build();
    }

    public org.springframework.data.domain.Page<CustomerProfileDTO.OrderSummaryDTO> getCustomerOrders(org.springframework.data.domain.Pageable pageable) {
        Customer customer = getCurrentCustomer();
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId(), pageable)
                .map(this::mapOrder);
    }

    private List<CustomerProfileDTO.OrderSummaryDTO> mapOrders(List<Order> orders) {
        return orders.stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());
    }

    private CustomerProfileDTO.OrderSummaryDTO mapOrder(Order order) {
        return CustomerProfileDTO.OrderSummaryDTO.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private Customer getCurrentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Customer", "anonymous");
        }
        String email = authentication.getName();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", email));
    }

    private MemberPricingTier resolveCurrentTier(Customer customer, BigDecimal totalPurchase, List<MemberPricingTier> tiers) {
        if (customer.getCurrentVipTierId() != null) {
            return memberPricingTierRepository.findById(customer.getCurrentVipTierId()).orElse(null);
        }
        return memberPricingTierRepository.findHighestTierByPurchaseAmount(totalPurchase).orElse(null);
    }

    private MemberPricingTier resolveNextTier(MemberPricingTier currentTier, List<MemberPricingTier> tiers) {
        int currentLevel = currentTier != null ? currentTier.getTierLevel() : 0;
        return tiers.stream()
                .filter(tier -> tier.getTierLevel() > currentLevel)
                .findFirst()
                .orElse(null);
    }

    private CustomerProfileDTO.VipInfo buildVipInfo(MemberPricingTier currentTier,
                                                    MemberPricingTier nextTier,
                                                    BigDecimal totalPurchase) {
        BigDecimal discount = currentTier != null
                ? Optional.ofNullable(currentTier.getDiscountPercentage()).orElse(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        BigDecimal spendToNext = BigDecimal.ZERO;
        Double progressPercent = 100.0;

        if (nextTier != null) {
            BigDecimal minNext = Optional.ofNullable(nextTier.getMinPurchaseAmount()).orElse(BigDecimal.ZERO);
            spendToNext = minNext.subtract(totalPurchase).max(BigDecimal.ZERO);

            BigDecimal base = currentTier != null
                    ? Optional.ofNullable(currentTier.getMinPurchaseAmount()).orElse(BigDecimal.ZERO)
                    : BigDecimal.ZERO;

            BigDecimal range = minNext.subtract(base);
            if (range.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal progress = totalPurchase.subtract(base)
                        .max(BigDecimal.ZERO)
                        .divide(range, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                progressPercent = Math.min(100.0, progress.doubleValue());
            } else {
                progressPercent = Math.min(100.0, totalPurchase.divide(minNext, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue());
            }
        }

        return CustomerProfileDTO.VipInfo.builder()
                .currentTier(currentTier != null ? currentTier.getTierDisplayName() : "Standard")
                .discountRate(discount)
                .nextTier(nextTier != null ? nextTier.getTierDisplayName() : null)
                .spendToNextTier(spendToNext.max(BigDecimal.ZERO))
                .progressPercent(progressPercent)
                .build();
    }
}

