package com.orchard.orchard_store_backend.modules.catalog.concentration.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.service.ConcentrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller cho Concentration
 * Dùng cho frontend dropdown, không cần authentication
 */
@RestController
@RequestMapping("/api/concentrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConcentrationPublicController {

    private final ConcentrationService concentrationService;

    /**
     * GET /api/concentrations - Lấy tất cả concentrations (public, không phân trang)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConcentrationDTO>>> getAllConcentrations(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        List<ConcentrationDTO> concentrations = activeOnly
                ? concentrationService.getActiveConcentrations()
                : concentrationService.getAllConcentrations();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nồng độ thành công", concentrations));
    }

    /**
     * GET /api/concentrations/{id} - Lấy concentration theo ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConcentrationDTO>> getConcentrationById(@PathVariable Long id) {
        ConcentrationDTO concentration = concentrationService.getConcentrationById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nồng độ thành công", concentration));
    }

    /**
     * GET /api/concentrations/slug/{slug} - Lấy concentration theo slug (public)
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ConcentrationDTO>> getConcentrationBySlug(@PathVariable String slug) {
        ConcentrationDTO concentration = concentrationService.getConcentrationBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nồng độ thành công", concentration));
    }
}

