package com.orchard.orchard_store_backend.modules.catalog.attribute.controller;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.CategoryAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/category-attributes")
@RequiredArgsConstructor
public class CategoryAttributeController {

    private final CategoryAttributeService categoryAttributeService;

    @GetMapping("/{categoryId}")
    public ResponseEntity<List<CategoryAttributeDTO>> getCategoryAttributes(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryAttributeService.getAttributesByCategory(categoryId));
    }

    @PostMapping
    public ResponseEntity<CategoryAttributeDTO> assignAttribute(@Valid @RequestBody CategoryAttributeDTO dto) {
        return ResponseEntity.ok(categoryAttributeService.assignAttributeToCategory(dto));
    }

    @DeleteMapping("/{categoryId}/{attributeId}")
    public ResponseEntity<Void> removeAttribute(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId
    ) {
        categoryAttributeService.removeAttributeFromCategory(categoryId, attributeId);
        return ResponseEntity.noContent().build();
    }
}

