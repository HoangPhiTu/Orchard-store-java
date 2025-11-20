package com.orchard.orchard_store_backend.modules.catalog.concentration.service;

import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import com.orchard.orchard_store_backend.modules.catalog.concentration.mapper.ConcentrationMapper;
import com.orchard.orchard_store_backend.modules.catalog.concentration.repository.ConcentrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ConcentrationServiceImpl implements ConcentrationService {

    private final ConcentrationRepository concentrationRepository;
    private final ConcentrationMapper concentrationMapper;

    @Override
    public List<ConcentrationDTO> getAllConcentrations() {
        return concentrationRepository.findAll()
                .stream()
                .map(concentrationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConcentrationDTO> getActiveConcentrations() {
        return concentrationRepository.findAllActiveConcentrations()
                .stream()
                .map(concentrationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ConcentrationDTO getConcentrationById(Long id) {
        Concentration concentration = concentrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Concentration not found with id: " + id));
        return concentrationMapper.toDTO(concentration);
    }

    @Override
    public ConcentrationDTO getConcentrationBySlug(String slug) {
        Concentration concentration = concentrationRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Concentration not found with slug: " + slug));
        return concentrationMapper.toDTO(concentration);
    }

    @Override
    public ConcentrationDTO createConcentration(ConcentrationDTO concentrationDTO) {
        if (concentrationRepository.existsBySlug(concentrationDTO.getSlug())) {
            throw new RuntimeException("Concentration with slug already exists: " + concentrationDTO.getSlug());
        }

        Concentration concentration = concentrationMapper.toEntity(concentrationDTO);
        Concentration saved = concentrationRepository.save(concentration);
        return concentrationMapper.toDTO(saved);
    }

    @Override
    public ConcentrationDTO updateConcentration(Long id, ConcentrationDTO concentrationDTO) {
        Concentration concentration = concentrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Concentration not found with id: " + id));

        if (concentrationRepository.existsBySlugAndIdNot(concentrationDTO.getSlug(), id)) {
            throw new RuntimeException("Concentration with slug already exists: " + concentrationDTO.getSlug());
        }

        concentration.setName(concentrationDTO.getName());
        concentration.setSlug(concentrationDTO.getSlug());
        concentration.setDescription(concentrationDTO.getDescription());
        concentration.setIntensityLevel(concentrationDTO.getIntensityLevel());
        concentration.setDisplayOrder(concentrationDTO.getDisplayOrder());
        if (concentrationDTO.getStatus() != null) {
            concentration.setStatus(Concentration.Status.valueOf(concentrationDTO.getStatus().toUpperCase()));
        }

        Concentration updated = concentrationRepository.save(concentration);
        return concentrationMapper.toDTO(updated);
    }

    @Override
    public void deleteConcentration(Long id) {
        if (!concentrationRepository.existsById(id)) {
            throw new RuntimeException("Concentration not found with id: " + id);
        }
        concentrationRepository.deleteById(id);
    }
}

