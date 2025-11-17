package com.orchard.orchard_store_backend.modules.inventory.controller;

import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderAdminDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.PreOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pre-orders")
@RequiredArgsConstructor
public class PreOrderAdminController {

    private final PreOrderService preOrderService;

    @GetMapping
    public ResponseEntity<List<PreOrderAdminDTO>> getPreOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(preOrderService.getPreOrders(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PreOrderAdminDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(
                preOrderService.updateStatus(id, request.getStatus(), request.getConvertedOrderId())
        );
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
        private Long convertedOrderId;
    }
}

