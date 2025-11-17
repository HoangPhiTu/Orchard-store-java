package com.orchard.orchard_store_backend.modules.inventory.controller;

import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderRequestDTO;
import com.orchard.orchard_store_backend.modules.inventory.service.PreOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pre-orders")
@RequiredArgsConstructor
public class PreOrderPublicController {

    private final PreOrderService preOrderService;

    @PostMapping
    public ResponseEntity<Void> createPreOrder(@Valid @RequestBody PreOrderRequestDTO dto) {
        preOrderService.createPreOrder(dto);
        return ResponseEntity.ok().build();
    }
}

