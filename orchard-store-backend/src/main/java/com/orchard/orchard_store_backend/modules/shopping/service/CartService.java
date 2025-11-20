package com.orchard.orchard_store_backend.modules.shopping.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductImage;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.shopping.dto.CartDetailsDTO;
import com.orchard.orchard_store_backend.modules.shopping.dto.CartItemDTO;
import com.orchard.orchard_store_backend.modules.shopping.dto.CartItemDetailDTO;
import com.orchard.orchard_store_backend.modules.shopping.entity.Cart;
import com.orchard.orchard_store_backend.modules.shopping.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public CartDetailsDTO addToCart(String sessionId, Long customerId, CartItemDTO item) {
        validateCartOwner(sessionId, customerId);

        ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", item.getProductVariantId()));

        Cart cart;
        if (customerId != null) {
            cart = cartRepository.findByCustomerIdAndProductVariantId(customerId, variant.getId()).orElse(null);
            if (cart == null) {
                Customer customer = customerRepository.findById(customerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
                cart = Cart.builder()
                        .customer(customer)
                        .productVariant(variant)
                        .quantity(item.getQuantity())
                        .build();
            } else {
                cart.setQuantity(cart.getQuantity() + item.getQuantity());
            }
        } else {
            cart = cartRepository.findBySessionIdAndProductVariantId(sessionId, variant.getId()).orElse(null);
            if (cart == null) {
                cart = Cart.builder()
                        .sessionId(sessionId)
                        .productVariant(variant)
                        .quantity(item.getQuantity())
                        .build();
            } else {
                cart.setQuantity(cart.getQuantity() + item.getQuantity());
            }
        }

        cartRepository.save(cart);
        return getCartDetails(sessionId, customerId);
    }

    @Transactional
    public void mergeCart(String sessionId, Long customerId) {
        if (!StringUtils.hasText(sessionId) || customerId == null) {
            return;
        }

        List<Cart> sessionCarts = cartRepository.findBySessionId(sessionId);
        if (sessionCarts.isEmpty()) {
            return;
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        for (Cart sessionCart : sessionCarts) {
            Optional<Cart> existing = cartRepository.findByCustomerIdAndProductVariantId(customerId,
                    sessionCart.getProductVariant().getId());

            if (existing.isPresent()) {
                Cart customerCart = existing.get();
                customerCart.setQuantity(customerCart.getQuantity() + sessionCart.getQuantity());
                cartRepository.delete(sessionCart);
            } else {
                sessionCart.setCustomer(customer);
                sessionCart.setSessionId(null);
                cartRepository.save(sessionCart);
            }
        }

        cartRepository.deleteBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public CartDetailsDTO getCartDetails(String sessionId, Long customerId) {
        validateCartOwner(sessionId, customerId);

        List<Cart> carts;
        if (customerId != null) {
            carts = cartRepository.findByCustomerId(customerId);
        } else {
            carts = cartRepository.findBySessionId(sessionId);
        }

        List<CartItemDetailDTO> items = carts.stream()
                .sorted(Comparator.comparing(Cart::getCreatedAt))
                .map(this::mapCartItem)
                .collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartItemDetailDTO::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = items.stream()
                .mapToInt(CartItemDetailDTO::getQuantity)
                .sum();

        return CartDetailsDTO.builder()
                .items(items)
                .subtotal(subtotal)
                .totalQuantity(totalQuantity)
                .build();
    }

    @Transactional
    public void clearCart(String sessionId, Long customerId) {
        if (customerId != null) {
            cartRepository.deleteByCustomerId(customerId);
        }
        if (StringUtils.hasText(sessionId)) {
            cartRepository.deleteBySessionId(sessionId);
        }
    }

    private CartItemDetailDTO mapCartItem(Cart cart) {
        ProductVariant variant = cart.getProductVariant();
        BigDecimal unitPrice = resolveUnitPrice(variant);
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cart.getQuantity()));

        String imageUrl = null;
        if (variant.getProduct() != null && variant.getProduct().getImages() != null) {
            imageUrl = variant.getProduct().getImages().stream()
                    .sorted((a, b) -> Boolean.compare(Boolean.TRUE.equals(b.getIsPrimary()), Boolean.TRUE.equals(a.getIsPrimary())))
                    .map(ProductImage::getImageUrl)
                    .filter(StringUtils::hasText)
                    .findFirst()
                    .orElse(null);
        }

        return CartItemDetailDTO.builder()
                .cartItemId(cart.getId())
                .productVariantId(variant.getId())
                .productName(variant.getProduct() != null ? variant.getProduct().getName() : null)
                .variantName(variant.getVariantName())
                .sku(variant.getSku())
                .thumbnailUrl(imageUrl)
                .unitPrice(unitPrice)
                .quantity(cart.getQuantity())
                .lineTotal(lineTotal)
                .build();
    }

    private BigDecimal resolveUnitPrice(ProductVariant variant) {
        if (variant.getSalePrice() != null && variant.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
            return variant.getSalePrice();
        }
        return variant.getPrice();
    }

    private void validateCartOwner(String sessionId, Long customerId) {
        if (customerId == null && !StringUtils.hasText(sessionId)) {
            throw new IllegalArgumentException("sessionId hoặc customerId phải được cung cấp");
        }
    }
}

