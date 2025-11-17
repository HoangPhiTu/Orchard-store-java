package com.orchard.orchard_store_backend.modules.inventory.controller;

import com.orchard.orchard_store_backend.modules.inventory.dto.StockAlertDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory/alerts")
@RequiredArgsConstructor
public class StockAlertController {

    private final StockAlertService stockAlertService;

    @GetMapping
    public ResponseEntity<List<StockAlertDTO>> getActiveAlerts() {
        return ResponseEntity.ok(stockAlertService.getActiveAlerts());
    }

    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<StockAlertDTO> resolveAlert(@PathVariable Long alertId) {
        return ResponseEntity.ok(stockAlertService.markAsResolved(alertId));
    }
}

