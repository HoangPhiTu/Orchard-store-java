package com.orchard.orchard_store_backend.modules.shopping.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.entity.MemberPricingTier;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.customer.repository.MemberPricingTierRepository;
import com.orchard.orchard_store_backend.modules.inventory.dto.InventoryTransactionDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.InventoryService;
import com.orchard.orchard_store_backend.modules.order.entity.Order;
import com.orchard.orchard_store_backend.modules.order.entity.OrderItem;
import com.orchard.orchard_store_backend.modules.order.repository.OrderRepository;
import com.orchard.orchard_store_backend.modules.promotion.service.PromotionService;
import com.orchard.orchard_store_backend.modules.promotion.service.PromotionService.PromotionValidationResult;
import com.orchard.orchard_store_backend.modules.shopping.dto.CheckoutItemDTO;
import com.orchard.orchard_store_backend.modules.shopping.dto.CheckoutRequest;
import com.orchard.orchard_store_backend.modules.shopping.dto.CheckoutSummaryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final ProductVariantRepository productVariantRepository;
    private final CustomerRepository customerRepository;
    private final MemberPricingTierRepository memberPricingTierRepository;
    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final PromotionService promotionService;

    @Transactional(readOnly = true)
    public CheckoutSummaryDTO calculateCheckout(CheckoutRequest request) {
        return calculate(request).summary;
    }

    private CalculationResult calculate(CheckoutRequest request) {
        if (CollectionUtils.isEmpty(request.getItems())) {
            throw new IllegalArgumentException("Danh sách sản phẩm không được để trống");
        }

        List<CheckoutSummaryDTO.ItemSummary> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CheckoutItemDTO item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", item.getProductVariantId()));

            BigDecimal unitPrice = resolveUnitPrice(variant);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            items.add(CheckoutSummaryDTO.ItemSummary.builder()
                    .productVariantId(variant.getId())
                    .productName(variant.getProduct().getName())
                    .variantName(variant.getVariantName())
                    .sku(variant.getSku())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build());
        }

        VipContext vipContext = resolveVipContext(request);
        BigDecimal vipDiscountAmount = subtotal
                .multiply(vipContext.discountRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal amountAfterVip = subtotal.subtract(vipDiscountAmount).max(BigDecimal.ZERO);
        Long customerId = request.getCustomer() != null ? request.getCustomer().getCustomerId() : null;
        PromotionValidationResult promoResult = promotionService.validatePromotion(
                request.getVoucherCode(), amountAfterVip, customerId);

        BigDecimal voucherDiscount = promoResult.getDiscountAmount();
        BigDecimal shippingFee = Optional.ofNullable(request.getShippingFee()).orElse(BigDecimal.ZERO);

        BigDecimal finalAmount = subtotal
                .subtract(vipDiscountAmount)
                .subtract(voucherDiscount)
                .add(shippingFee)
                .max(BigDecimal.ZERO);

        CheckoutSummaryDTO summary = CheckoutSummaryDTO.builder()
                .items(items)
                .subtotal(subtotal)
                .vipDiscountRate(vipContext.discountRate)
                .vipDiscountAmount(vipDiscountAmount)
                .voucherDiscount(voucherDiscount)
                .voucherCode(request.getVoucherCode())
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .currentTier(vipContext.currentTierName)
                .nextTier(vipContext.nextTierName)
                .spendToNextTier(vipContext.spendToNextTier)
                .progressPercent(vipContext.progressPercent)
                .build();
        return new CalculationResult(summary, promoResult);
    }

    @Transactional
    public Order placeOrder(CheckoutRequest request) {
        CalculationResult calc = calculate(request);
        CheckoutSummaryDTO summary = calc.summary;
        PromotionValidationResult promoResult = calc.promotionResult;

        Customer customer = resolveOrCreateCustomer(request);
        VipContext vipContext = resolveVipContext(request);

        validateInventory(request.getItems());

        Order order = buildOrderEntity(request, summary, customer, vipContext, promoResult);
        List<OrderItem> orderItems = buildOrderItems(request.getItems(), order);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        adjustInventory(orderItems, savedOrder.getId());

        cartService.clearCart(request.getSessionId(), customer != null ? customer.getId() : null);

        return savedOrder;
    }

    private void validateInventory(List<CheckoutItemDTO> items) {
        for (CheckoutItemDTO item : items) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", item.getProductVariantId()));
            Integer stock = Optional.ofNullable(variant.getStockQuantity()).orElse(0);
            if (stock < item.getQuantity()) {
                throw new IllegalStateException("Sản phẩm " + variant.getVariantName() + " không đủ tồn kho");
            }
        }
    }

    private void adjustInventory(List<OrderItem> orderItems, Long orderId) {
        orderItems.forEach(item -> {
            if (item.getProductVariant() != null) {
                inventoryService.adjustStock(
                        item.getProductVariant().getId(),
                        item.getQuantity(),
                        InventoryTransactionDTO.InventoryTransactionType.OUT,
                        "ORDER",
                        orderId,
                        "Checkout order " + orderId
                );
            }
        });
    }

    private Order buildOrderEntity(CheckoutRequest request,
                                   CheckoutSummaryDTO summary,
                                   Customer customer,
                                   VipContext vipContext,
                                   PromotionValidationResult promoResult) {
        CheckoutRequest.CheckoutCustomerInfo customerInfo = request.getCustomer();

        String customerName = customerInfo != null ? customerInfo.getFullName()
                : customer != null ? customer.getFullName() : "Guest";
        String customerEmail = customerInfo != null ? customerInfo.getEmail()
                : customer != null ? customer.getEmail() : "guest@example.com";
        String customerPhone = customerInfo != null ? customerInfo.getPhone()
                : customer != null ? customer.getPhone() : "N/A";

        return Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .verificationCode(generateVerificationCode())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingDistrict(request.getShippingDistrict())
                .shippingWard(request.getShippingWard())
                .shippingPostalCode(request.getShippingPostalCode())
                .paymentMethod(request.getPaymentMethod())
                .shippingMethod(request.getShippingMethod())
                .subtotal(summary.getSubtotal())
                .vipDiscountAmount(summary.getVipDiscountAmount())
                .discountAmount(summary.getVoucherDiscount())
                .vipDiscountPercentage(summary.getVipDiscountRate())
                .shippingFee(summary.getShippingFee())
                .totalAmount(summary.getFinalAmount())
                .customerVipTierName(vipContext.currentTierName)
                .promotionCode(summary.getVoucherCode())
                .promotionId(promoResult != null && promoResult.getPromotion() != null
                        ? promoResult.getPromotion().getId() : null)
                .build();
    }

    private List<OrderItem> buildOrderItems(List<CheckoutItemDTO> items, Order order) {
        return items.stream()
                .map(item -> {
                    ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", item.getProductVariantId()));

                    BigDecimal unitPrice = resolveUnitPrice(variant);
                    BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                    return OrderItem.builder()
                            .order(order)
                            .product(variant.getProduct())
                            .productVariant(variant)
                            .productName(variant.getProduct().getName())
                            .variantName(variant.getVariantName())
                            .sku(variant.getSku())
                            .quantity(item.getQuantity())
                            .unitPrice(unitPrice)
                            .salePrice(variant.getSalePrice())
                            .subtotal(lineTotal)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private VipContext resolveVipContext(CheckoutRequest request) {
        VipContext context = new VipContext();

        if (request.getCustomer() != null && request.getCustomer().getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomer().getCustomerId())
                    .orElse(null);
            if (customer != null) {
                BigDecimal totalPurchase = Optional.ofNullable(customer.getTotalPurchaseAmount()).orElse(BigDecimal.ZERO);
                MemberPricingTier currentTier = null;
                if (customer.getCurrentVipTierId() != null) {
                    currentTier = memberPricingTierRepository.findById(customer.getCurrentVipTierId()).orElse(null);
                } else {
                    currentTier = memberPricingTierRepository.findHighestTierByPurchaseAmount(totalPurchase).orElse(null);
                }
                List<MemberPricingTier> tiers = memberPricingTierRepository.findAll()
                        .stream()
                        .sorted((a, b) -> Integer.compare(a.getTierLevel(), b.getTierLevel()))
                        .collect(Collectors.toList());
                MemberPricingTier nextTier = resolveNextTier(currentTier, tiers);
                fillVipContext(context, currentTier, nextTier, totalPurchase);
            }
        }

        return context;
    }

    private void fillVipContext(VipContext context,
                                MemberPricingTier currentTier,
                                MemberPricingTier nextTier,
                                BigDecimal totalPurchase) {
        context.currentTierName = currentTier != null ? currentTier.getTierDisplayName() : "Standard";
        context.discountRate = currentTier != null
                ? Optional.ofNullable(currentTier.getDiscountPercentage()).orElse(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        if (nextTier != null) {
            BigDecimal minNext = Optional.ofNullable(nextTier.getMinPurchaseAmount()).orElse(BigDecimal.ZERO);
            BigDecimal spend = minNext.subtract(totalPurchase).max(BigDecimal.ZERO);
            context.nextTierName = nextTier.getTierDisplayName();
            context.spendToNextTier = spend;
            BigDecimal base = currentTier != null
                    ? Optional.ofNullable(currentTier.getMinPurchaseAmount()).orElse(BigDecimal.ZERO)
                    : BigDecimal.ZERO;
            BigDecimal range = minNext.subtract(base);
            if (range.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal progress = totalPurchase.subtract(base)
                        .max(BigDecimal.ZERO)
                        .divide(range, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                context.progressPercent = Math.min(100.0, progress.doubleValue());
            }
        }
    }

    private MemberPricingTier resolveNextTier(MemberPricingTier currentTier, List<MemberPricingTier> tiers) {
        int currentLevel = currentTier != null ? currentTier.getTierLevel() : 0;
        return tiers.stream()
                .filter(tier -> tier.getTierLevel() > currentLevel)
                .findFirst()
                .orElse(null);
    }

    private Customer resolveOrCreateCustomer(CheckoutRequest request) {
        if (request.getCustomer() == null) {
            return null;
        }

        CheckoutRequest.CheckoutCustomerInfo info = request.getCustomer();

        if (info.getCustomerId() != null) {
            return customerRepository.findById(info.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", info.getCustomerId()));
        }

        return customerRepository.findByEmail(info.getEmail())
                .orElseGet(() -> customerRepository.save(Customer.builder()
                        .email(info.getEmail())
                        .phone(info.getPhone())
                        .fullName(info.getFullName())
                        .status(Customer.Status.ACTIVE)
                        .build()));
    }

    private BigDecimal resolveUnitPrice(ProductVariant variant) {
        if (variant.getSalePrice() != null && variant.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
            return variant.getSalePrice();
        }
        return variant.getPrice();
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private String generateVerificationCode() {
        return String.valueOf(100000 + (int) (Math.random() * 900000));
    }

    private static class VipContext {
        private BigDecimal discountRate = BigDecimal.ZERO;
        private String currentTierName = "Standard";
        private String nextTierName;
        private BigDecimal spendToNextTier = BigDecimal.ZERO;
        private Double progressPercent = 100.0;
    }

    private static class CalculationResult {
        private final CheckoutSummaryDTO summary;
        private final PromotionValidationResult promotionResult;

        private CalculationResult(CheckoutSummaryDTO summary, PromotionValidationResult promotionResult) {
            this.summary = summary;
            this.promotionResult = promotionResult;
        }
    }
}

