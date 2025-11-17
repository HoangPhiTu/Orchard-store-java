package com.orchard.orchard_store_backend.modules.catalog.bundle.controller;

import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.ProductBundleDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.service.ProductBundleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bundles")
@RequiredArgsConstructor
public class ProductBundleController {

    private final ProductBundleService bundleService;

    @PostMapping
    public ResponseEntity<ProductBundleDTO> createBundle(@Valid @RequestBody ProductBundleDTO dto) {
        ProductBundleDTO created = bundleService.createBundle(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductBundleDTO> getBundleById(@PathVariable Long id) {
        ProductBundleDTO bundle = bundleService.getBundleById(id);
        return ResponseEntity.ok(bundle);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductBundleDTO> getBundleBySlug(@PathVariable String slug) {
        ProductBundleDTO bundle = bundleService.getBundleBySlug(slug);
        return ResponseEntity.ok(bundle);
    }

    @GetMapping
    public ResponseEntity<Page<ProductBundleDTO>> getAllBundles(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<ProductBundleDTO> bundles = bundleService.getAllBundles(status, pageable);
        return ResponseEntity.ok(bundles);
    }

    @GetMapping("/type/{bundleType}")
    public ResponseEntity<List<ProductBundleDTO>> getBundlesByType(
            @PathVariable String bundleType,
            @RequestParam(required = false) String status) {
        List<ProductBundleDTO> bundles = bundleService.getBundlesByType(bundleType, status);
        return ResponseEntity.ok(bundles);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductBundleDTO>> getActiveBundles(
            @RequestParam(required = false) String status) {
        List<ProductBundleDTO> bundles = bundleService.getActiveBundles(status);
        return ResponseEntity.ok(bundles);
    }

    @GetMapping("/active/type/{bundleType}")
    public ResponseEntity<List<ProductBundleDTO>> getActiveBundlesByType(
            @PathVariable String bundleType,
            @RequestParam(required = false) String status) {
        List<ProductBundleDTO> bundles = bundleService.getActiveBundlesByType(bundleType, status);
        return ResponseEntity.ok(bundles);
    }

    @GetMapping("/top-discount")
    public ResponseEntity<Page<ProductBundleDTO>> getTopDiscountBundles(Pageable pageable) {
        Page<ProductBundleDTO> bundles = bundleService.getTopDiscountBundles(pageable);
        return ResponseEntity.ok(bundles);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductBundleDTO> updateBundle(
            @PathVariable Long id,
            @Valid @RequestBody ProductBundleDTO dto) {
        ProductBundleDTO updated = bundleService.updateBundle(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBundle(@PathVariable Long id) {
        bundleService.deleteBundle(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/calculate-price")
    public ResponseEntity<ProductBundleDTO> calculateBundlePrice(@PathVariable Long id) {
        ProductBundleDTO bundle = bundleService.calculateBundlePrice(id);
        return ResponseEntity.ok(bundle);
    }
}

