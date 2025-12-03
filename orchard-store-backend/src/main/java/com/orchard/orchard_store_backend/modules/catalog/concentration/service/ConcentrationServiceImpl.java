package com.orchard.orchard_store_backend.modules.catalog.concentration.service;

import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import com.orchard.orchard_store_backend.modules.catalog.concentration.mapper.ConcentrationMapper;
import com.orchard.orchard_store_backend.modules.catalog.concentration.repository.ConcentrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConcentrationServiceImpl implements ConcentrationService {

    private final ConcentrationRepository concentrationRepository;
    private final ConcentrationMapper concentrationMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ConcentrationDTO> getConcentrations(String keyword, String status, Pageable pageable) {
        Specification<Concentration> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by keyword (search in name or slug)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("slug")), searchPattern)
                ));
            }

            // Filter by status
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                try {
                    Concentration.Status concentrationStatus = Concentration.Status.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), concentrationStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status filter: {}", status);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return concentrationRepository.findAll(spec, pageable)
                .map(concentrationMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public ConcentrationDTO getConcentrationById(Long id) {
        Concentration concentration = concentrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concentration", id));
        return concentrationMapper.toDTO(concentration);
    }

    @Override
    @Transactional(readOnly = true)
    public ConcentrationDTO getConcentrationBySlug(String slug) {
        Concentration concentration = concentrationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Concentration", slug));
        return concentrationMapper.toDTO(concentration);
    }

    @Override
    public ConcentrationDTO createConcentration(ConcentrationDTO concentrationDTO) {
        // Kiểm tra trùng name
        if (concentrationRepository.existsByName(concentrationDTO.getName())) {
            throw new ResourceAlreadyExistsException("Concentration", "name", concentrationDTO.getName());
        }

        // Kiểm tra trùng slug
        if (concentrationRepository.existsBySlug(concentrationDTO.getSlug())) {
            throw new ResourceAlreadyExistsException("Concentration", "slug", concentrationDTO.getSlug());
        }

        Concentration concentration = concentrationMapper.toEntity(concentrationDTO);
        if (concentrationDTO.getStatus() != null) {
            concentration.setStatus(Concentration.Status.valueOf(concentrationDTO.getStatus().toUpperCase()));
        } else {
            concentration.setStatus(Concentration.Status.ACTIVE); // Mặc định ACTIVE
        }

        Concentration saved = concentrationRepository.save(concentration);
        log.info("Created concentration: {} with slug: {}", saved.getName(), saved.getSlug());
        return concentrationMapper.toDTO(saved);
    }

    @Override
    public ConcentrationDTO updateConcentration(Long id, ConcentrationDTO concentrationDTO) {
        Concentration concentration = concentrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concentration", id));

        // Kiểm tra trùng name (nếu có thay đổi)
        if (concentrationDTO.getName() != null && !concentrationDTO.getName().equals(concentration.getName())) {
            if (concentrationRepository.existsByNameAndIdNot(concentrationDTO.getName(), id)) {
                throw new ResourceAlreadyExistsException("Concentration", "name", concentrationDTO.getName());
            }
            concentration.setName(concentrationDTO.getName());
        }

        // Kiểm tra trùng slug (nếu có thay đổi)
        if (concentrationDTO.getSlug() != null && !concentrationDTO.getSlug().equals(concentration.getSlug())) {
            if (concentrationRepository.existsBySlugAndIdNot(concentrationDTO.getSlug(), id)) {
                throw new ResourceAlreadyExistsException("Concentration", "slug", concentrationDTO.getSlug());
            }
            concentration.setSlug(concentrationDTO.getSlug());
        }

        // Cập nhật các field khác
        if (concentrationDTO.getDescription() != null) {
            concentration.setDescription(concentrationDTO.getDescription());
        }
        if (concentrationDTO.getIntensityLevel() != null) {
            concentration.setIntensityLevel(concentrationDTO.getIntensityLevel());
        }
        if (concentrationDTO.getDisplayOrder() != null) {
            concentration.setDisplayOrder(concentrationDTO.getDisplayOrder());
        }
        if (concentrationDTO.getStatus() != null) {
            concentration.setStatus(Concentration.Status.valueOf(concentrationDTO.getStatus().toUpperCase()));
        }

        Concentration updated = concentrationRepository.save(concentration);
        log.info("Updated concentration: {} with slug: {}", updated.getName(), updated.getSlug());
        return concentrationMapper.toDTO(updated);
    }

    @Override
    public void deleteConcentration(Long id) {
        Concentration concentration = concentrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concentration", id));

        // Kiểm tra ràng buộc: nếu đã được sử dụng bởi product_variants thì không cho xóa
        if (concentrationRepository.isUsedByProductVariants(id)) {
            throw new OperationNotPermittedException(
                    "Không thể xóa nồng độ này vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước."
            );
        }

        concentrationRepository.delete(concentration);
        log.info("Deleted concentration: {} (id: {})", concentration.getName(), id);
    }
}

