package com.orchard.orchard_store_backend.modules.catalog.concentration.service;

import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ConcentrationService {

    /**
     * Lấy danh sách concentrations có phân trang và tìm kiếm (dành cho admin)
     */
    Page<ConcentrationDTO> getConcentrations(String keyword, String status, Pageable pageable);

    /**
     * Lấy tất cả concentrations (không phân trang - dành cho dropdown)
     */
    List<ConcentrationDTO> getAllConcentrations();

    /**
     * Lấy danh sách concentrations đang active (không phân trang - dành cho dropdown)
     */
    List<ConcentrationDTO> getActiveConcentrations();

    ConcentrationDTO getConcentrationById(Long id);

    ConcentrationDTO getConcentrationBySlug(String slug);

    ConcentrationDTO createConcentration(ConcentrationDTO concentrationDTO);

    ConcentrationDTO updateConcentration(Long id, ConcentrationDTO concentrationDTO);

    void deleteConcentration(Long id);
}

