package com.orchard.orchard_store_backend.modules.inventory.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.inventory.dto.StockAlertDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.StockAlert;
import com.orchard.orchard_store_backend.modules.inventory.mapper.StockAlertMapper;
import com.orchard.orchard_store_backend.modules.inventory.repository.StockAlertRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockAlertServiceImpl implements StockAlertService {

    private final StockAlertRepository stockAlertRepository;
    private final StockAlertMapper stockAlertMapper;

    @Override
    public List<StockAlertDTO> getActiveAlerts() {
        return stockAlertRepository.findByResolvedFalseOrderByCreatedAtAsc()
                .stream()
                .map(stockAlertMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockAlertDTO markAsResolved(Long alertId) {
        StockAlert alert = stockAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Stock alert not found"));
        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        return stockAlertMapper.toDTO(stockAlertRepository.save(alert));
    }

    @Override
    @Transactional
    public void evaluateVariantStock(ProductVariant variant) {
        int currentQty = variant.getStockQuantity();
        int threshold = Optional.ofNullable(variant.getLowStockThreshold()).orElse(10);

        Optional<StockAlert> existingAlertOpt = stockAlertRepository
                .findFirstByProductVariantIdAndResolvedFalseOrderByCreatedAtDesc(variant.getId());

        if (currentQty <= 0) {
            if (existingAlertOpt.isPresent() && existingAlertOpt.get().getAlertType() == StockAlert.AlertType.OUT_OF_STOCK) {
                updateAlert(existingAlertOpt.get(), currentQty);
            } else {
                resolveExisting(existingAlertOpt);
                createAlert(variant, StockAlert.AlertType.OUT_OF_STOCK, threshold, currentQty);
            }
        } else if (currentQty <= threshold) {
            if (existingAlertOpt.isPresent() && existingAlertOpt.get().getAlertType() == StockAlert.AlertType.LOW_STOCK) {
                updateAlert(existingAlertOpt.get(), currentQty);
            } else {
                resolveExisting(existingAlertOpt);
                createAlert(variant, StockAlert.AlertType.LOW_STOCK, threshold, currentQty);
            }
        } else {
            resolveExisting(existingAlertOpt);
        }
    }

    private void createAlert(ProductVariant variant, StockAlert.AlertType type, Integer threshold, Integer currentQty) {
        StockAlert alert = StockAlert.builder()
                .productVariant(variant)
                .alertType(type)
                .thresholdQuantity(threshold)
                .currentQuantity(currentQty)
                .notified(false)
                .resolved(false)
                .build();
        stockAlertRepository.save(alert);
    }

    private void updateAlert(StockAlert alert, Integer currentQty) {
        alert.setCurrentQuantity(currentQty);
        stockAlertRepository.save(alert);
    }

    private void resolveExisting(Optional<StockAlert> alertOpt) {
        alertOpt.ifPresent(alert -> {
            alert.setResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            stockAlertRepository.save(alert);
        });
    }
}

