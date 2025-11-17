package com.orchard.orchard_store_backend.modules.catalog.attribute.controller;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.ProductAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
public class ProductAttributeController {

    private final ProductAttributeService productAttributeService;

    @GetMapping
    public ResponseEntity<List<ProductAttributeDTO>> getAttributes() {
        return ResponseEntity.ok(productAttributeService.getAllAttributes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductAttributeDTO> getAttribute(@PathVariable Long id) {
        return ResponseEntity.ok(productAttributeService.getAttribute(id));
    }

    @PostMapping
    public ResponseEntity<ProductAttributeDTO> createAttribute(@Valid @RequestBody ProductAttributeDTO dto) {
        return ResponseEntity.ok(productAttributeService.createAttribute(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductAttributeDTO> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        return ResponseEntity.ok(productAttributeService.updateAttribute(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttribute(@PathVariable Long id) {
        productAttributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/values")
    public ResponseEntity<List<AttributeValueDTO>> getAttributeValues(@PathVariable Long id) {
        return ResponseEntity.ok(productAttributeService.getAttributeValues(id));
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<AttributeValueDTO> createAttributeValue(
            @PathVariable Long id,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        return ResponseEntity.ok(productAttributeService.createAttributeValue(id, dto));
    }

    @PutMapping("/{id}/values/{valueId}")
    public ResponseEntity<AttributeValueDTO> updateAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        return ResponseEntity.ok(productAttributeService.updateAttributeValue(id, valueId, dto));
    }

    @DeleteMapping("/{id}/values/{valueId}")
    public ResponseEntity<Void> deleteAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId
    ) {
        productAttributeService.deleteAttributeValue(id, valueId);
        return ResponseEntity.noContent().build();
    }
}

