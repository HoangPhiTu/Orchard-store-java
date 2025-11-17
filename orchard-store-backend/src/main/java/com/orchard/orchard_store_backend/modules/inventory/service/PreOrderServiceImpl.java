package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderAdminDTO;
import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderRequestDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.PreOrder;
import com.orchard.orchard_store_backend.modules.inventory.mapper.PreOrderMapper;
import com.orchard.orchard_store_backend.modules.inventory.repository.PreOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreOrderServiceImpl implements PreOrderService {

    private final PreOrderRepository preOrderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PreOrderMapper preOrderMapper;

    @Override
    @Transactional
    public void createPreOrder(PreOrderRequestDTO dto) {
        ProductVariant variant = productVariantRepository.findById(dto.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        PreOrder preOrder = PreOrder.builder()
                .productVariant(variant)
                .quantity(dto.getQuantity() == null ? 1 : dto.getQuantity())
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .notes(dto.getNotes())
                .status(PreOrder.PreOrderStatus.PENDING)
                .build();

        preOrderRepository.save(preOrder);
    }

    @Override
    public List<PreOrderAdminDTO> getPreOrders(String status) {
        List<PreOrder> orders;
        if (StringUtils.hasText(status)) {
            PreOrder.PreOrderStatus st = PreOrder.PreOrderStatus.valueOf(status.toUpperCase());
            orders = preOrderRepository.findByStatusOrderByCreatedAtAsc(st);
        } else {
            orders = preOrderRepository.findAll();
        }
        return orders.stream()
                .map(preOrderMapper::toAdminDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PreOrderAdminDTO updateStatus(Long preOrderId, String status, Long convertedOrderId) {
        PreOrder preOrder = preOrderRepository.findById(preOrderId)
                .orElseThrow(() -> new RuntimeException("Pre-order not found"));
        PreOrder.PreOrderStatus newStatus = PreOrder.PreOrderStatus.valueOf(status.toUpperCase());
        preOrder.setStatus(newStatus);

        if (convertedOrderId != null) {
            preOrder.setConvertedOrderId(convertedOrderId);
        }

        if (newStatus == PreOrder.PreOrderStatus.NOTIFIED) {
            preOrder.setNotificationSent(true);
            preOrder.setNotificationSentAt(LocalDateTime.now());
        }

        return preOrderMapper.toAdminDTO(preOrderRepository.save(preOrder));
    }

    @Override
    @Transactional
    public void processRestock(ProductVariant variant) {
        int availableQty = variant.getAvailableQuantity();
        if (availableQty <= 0) {
            return;
        }

        List<PreOrder> pendingOrders = preOrderRepository.findByProductVariantIdAndStatus(
                variant.getId(),
                PreOrder.PreOrderStatus.PENDING
        );

        if (pendingOrders.isEmpty()) {
            return;
        }

        for (PreOrder order : pendingOrders) {
            order.setStatus(PreOrder.PreOrderStatus.NOTIFIED);
            order.setNotificationSent(true);
            order.setNotificationSentAt(LocalDateTime.now());
            // TODO: integrate email notification service
        }

        preOrderRepository.saveAll(pendingOrders);
    }
}

