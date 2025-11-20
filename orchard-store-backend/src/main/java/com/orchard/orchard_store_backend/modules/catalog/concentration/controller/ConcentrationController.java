package com.orchard.orchard_store_backend.modules.catalog.concentration.controller;

import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.service.ConcentrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/concentrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class ConcentrationController {

    private final ConcentrationService concentrationService;

    @GetMapping
    public ResponseEntity<List<ConcentrationDTO>> getAllConcentrations(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        List<ConcentrationDTO> concentrations = activeOnly
                ? concentrationService.getActiveConcentrations()
                : concentrationService.getAllConcentrations();
        return ResponseEntity.ok(concentrations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConcentrationDTO> getConcentrationById(@PathVariable Long id) {
        ConcentrationDTO concentration = concentrationService.getConcentrationById(id);
        return ResponseEntity.ok(concentration);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ConcentrationDTO> getConcentrationBySlug(@PathVariable String slug) {
        ConcentrationDTO concentration = concentrationService.getConcentrationBySlug(slug);
        return ResponseEntity.ok(concentration);
    }

    @PostMapping
    public ResponseEntity<ConcentrationDTO> createConcentration(@Valid @RequestBody ConcentrationDTO concentrationDTO) {
        ConcentrationDTO created = concentrationService.createConcentration(concentrationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConcentrationDTO> updateConcentration(
            @PathVariable Long id,
            @Valid @RequestBody ConcentrationDTO concentrationDTO
    ) {
        ConcentrationDTO updated = concentrationService.updateConcentration(id, concentrationDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConcentration(@PathVariable Long id) {
        concentrationService.deleteConcentration(id);
        return ResponseEntity.noContent().build();
    }
}

