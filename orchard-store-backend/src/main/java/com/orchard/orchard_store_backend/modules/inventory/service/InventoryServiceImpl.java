package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import com.orchard.orchard_store_backend.modules.inventory.dto.InventoryTransactionDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction;
import com.orchard.orchard_store_backend.modules.inventory.mapper.InventoryTransactionMapper;
import com.orchard.orchard_store_backend.modules.inventory.repository.InventoryTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryTransactionMapper inventoryTransactionMapper;
    private final StockAlertService stockAlertService;
    private final PreOrderService preOrderService;

    @Override
    public List<InventoryTransactionDTO> getTransactionsForVariant(Long variantId) {
        return inventoryTransactionRepository.findByProductVariantIdOrderByCreatedAtDesc(variantId)
                .stream()
                .map(inventoryTransactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryTransactionDTO createTransaction(InventoryTransactionDTO dto) {
        ProductVariant variant = productVariantRepository.findById(dto.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        int quantity = dto.getQuantity() == null ? 0 : dto.getQuantity();
        int[] stockChange = adjustVariantStock(variant, quantity, dto.getTransactionType());

        InventoryTransaction transaction = InventoryTransaction.builder()
                .productVariant(variant)
                .transactionType(InventoryTransaction.TransactionType.valueOf(dto.getTransactionType().name()))
                .quantity(quantity)
                .referenceType(dto.getReferenceType())
                .referenceId(dto.getReferenceId())
                .stockBefore(stockChange[0])
                .stockAfter(stockChange[1])
                .notes(dto.getNotes())
                .createdBy(dto.getCreatedBy())
                .build();

        InventoryTransaction saved = inventoryTransactionRepository.save(transaction);
        postStockUpdate(variant);
        return inventoryTransactionMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void adjustStock(Long variantId, int quantity, InventoryTransactionDTO.InventoryTransactionType type, String referenceType, Long referenceId, String notes) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        int[] stockChange = adjustVariantStock(variant, quantity, type);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .productVariant(variant)
                .transactionType(InventoryTransaction.TransactionType.valueOf(type.name()))
                .quantity(quantity)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .stockBefore(stockChange[0])
                .stockAfter(stockChange[1])
                .notes(notes)
                .build();
        inventoryTransactionRepository.save(transaction);
        postStockUpdate(variant);
    }

    private int[] adjustVariantStock(ProductVariant variant, int quantity, InventoryTransactionDTO.InventoryTransactionType type) {
        int stockBefore = variant.getStockQuantity();
        switch (type) {
            case IN -> variant.setStockQuantity(variant.getStockQuantity() + quantity);
            case OUT, DAMAGED -> variant.setStockQuantity(Math.max(0, variant.getStockQuantity() - quantity));
            case ADJUSTMENT -> variant.setStockQuantity(Math.max(0, quantity));
            case RESERVE -> variant.setReservedQuantity(variant.getReservedQuantity() + quantity);
            case RELEASE -> variant.setReservedQuantity(Math.max(0, variant.getReservedQuantity() - quantity));
            case RETURN -> variant.setStockQuantity(variant.getStockQuantity() + quantity);
            default -> throw new IllegalArgumentException("Unsupported transaction type");
        }
        variant.calculateAvailableQuantity();
        productVariantRepository.save(variant);
        return new int[]{stockBefore, variant.getStockQuantity()};
    }

    private void postStockUpdate(ProductVariant variant) {
        stockAlertService.evaluateVariantStock(variant);
        if (variant.getAvailableQuantity() > 0) {
            preOrderService.processRestock(variant);
        }
    }
}

