package com.orchard.orchard_store_backend.modules.catalog.attribute.controller;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.ProductAttributeValueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products/{productId}/attributes")
@RequiredArgsConstructor
public class ProductAttributeValueController {

    private final ProductAttributeValueService productAttributeValueService;

    @GetMapping
    public ResponseEntity<List<ProductAttributeValueDTO>> getProductAttributes(@PathVariable Long productId) {
        return ResponseEntity.ok(productAttributeValueService.getAttributesForProduct(productId));
    }

    @PutMapping
    public ResponseEntity<List<ProductAttributeValueDTO>> saveProductAttributes(
            @PathVariable Long productId,
            @Valid @RequestBody List<ProductAttributeValueDTO> dtos
    ) {
        return ResponseEntity.ok(productAttributeValueService.saveAttributesForProduct(productId, dtos));
    }
}

