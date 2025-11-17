package com.orchard.orchard_store_backend.modules.catalog.brand.controller;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands(
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly
    ) {
        List<BrandDTO> brands = activeOnly
                ? brandService.getAllActiveBrands()
                : brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Long id) {
        BrandDTO brand = brandService.getBrandById(id);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<BrandDTO> getBrandBySlug(@PathVariable String slug) {
        BrandDTO brand = brandService.getBrandBySlug(slug);
        return ResponseEntity.ok(brand);
    }

    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandDTO brandDTO) {
        BrandDTO created = brandService.createBrand(brandDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandDTO brandDTO) {
        BrandDTO updated = brandService.updateBrand(id, brandDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}

