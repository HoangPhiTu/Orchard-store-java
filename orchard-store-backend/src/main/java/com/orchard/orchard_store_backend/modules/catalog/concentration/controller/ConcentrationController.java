package com.orchard.orchard_store_backend.modules.catalog.concentration.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.service.ConcentrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/concentrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ConcentrationController {

    private final ConcentrationService concentrationService;

    /**
     * GET /api/admin/concentrations - Lấy danh sách với phân trang và tìm kiếm (Admin)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ConcentrationDTO>>> getConcentrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ConcentrationDTO> concentrations = concentrationService.getConcentrations(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nồng độ thành công", concentrations));
    }

    /**
     * GET /api/admin/concentrations/all - Lấy tất cả (không phân trang - dành cho dropdown)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ConcentrationDTO>>> getAllConcentrations(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        List<ConcentrationDTO> concentrations = activeOnly
                ? concentrationService.getActiveConcentrations()
                : concentrationService.getAllConcentrations();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nồng độ thành công", concentrations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConcentrationDTO>> getConcentrationById(@PathVariable Long id) {
        ConcentrationDTO concentration = concentrationService.getConcentrationById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nồng độ thành công", concentration));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ConcentrationDTO>> getConcentrationBySlug(@PathVariable String slug) {
        ConcentrationDTO concentration = concentrationService.getConcentrationBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nồng độ thành công", concentration));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConcentrationDTO>> createConcentration(@Valid @RequestBody ConcentrationDTO concentrationDTO) {
        ConcentrationDTO created = concentrationService.createConcentration(concentrationDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo nồng độ thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConcentrationDTO>> updateConcentration(
            @PathVariable Long id,
            @Valid @RequestBody ConcentrationDTO concentrationDTO
    ) {
        ConcentrationDTO updated = concentrationService.updateConcentration(id, concentrationDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nồng độ thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConcentration(@PathVariable Long id) {
        concentrationService.deleteConcentration(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nồng độ thành công", null));
    }
}

