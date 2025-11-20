package com.orchard.orchard_store_backend.modules.catalog.concentration.service;

import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;

import java.util.List;

public interface ConcentrationService {

    List<ConcentrationDTO> getAllConcentrations();

    List<ConcentrationDTO> getActiveConcentrations();

    ConcentrationDTO getConcentrationById(Long id);

    ConcentrationDTO getConcentrationBySlug(String slug);

    ConcentrationDTO createConcentration(ConcentrationDTO concentrationDTO);

    ConcentrationDTO updateConcentration(Long id, ConcentrationDTO concentrationDTO);

    void deleteConcentration(Long id);
}

