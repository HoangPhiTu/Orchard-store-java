package com.orchard.orchard_store_backend.modules.catalog.brand.service;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import com.orchard.orchard_store_backend.modules.catalog.brand.mapper.BrandMapper;
import com.orchard.orchard_store_backend.modules.catalog.brand.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Override
    public List<BrandDTO> getAllActiveBrands() {
        return brandRepository.findAllActiveBrands()
                .stream()
                .map(brandMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(brandMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        return brandMapper.toDTO(brand);
    }

    @Override
    public BrandDTO getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Brand not found with slug: " + slug));
        return brandMapper.toDTO(brand);
    }

    @Override
    public BrandDTO createBrand(BrandDTO brandDTO) {
        if (brandRepository.existsBySlug(brandDTO.getSlug())) {
            throw new RuntimeException("Brand with slug already exists: " + brandDTO.getSlug());
        }

        Brand brand = brandMapper.toEntity(brandDTO);
        Brand saved = brandRepository.save(brand);
        return brandMapper.toDTO(saved);
    }

    @Override
    public BrandDTO updateBrand(Long id, BrandDTO brandDTO) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

        if (brandRepository.existsBySlugAndIdNot(brandDTO.getSlug(), id)) {
            throw new RuntimeException("Brand with slug already exists: " + brandDTO.getSlug());
        }

        brand.setName(brandDTO.getName());
        brand.setSlug(brandDTO.getSlug());
        brand.setDescription(brandDTO.getDescription());
        brand.setLogoUrl(brandDTO.getLogoUrl());
        brand.setCountry(brandDTO.getCountry());
        brand.setWebsiteUrl(brandDTO.getWebsiteUrl());
        brand.setDisplayOrder(brandDTO.getDisplayOrder());
        if (brandDTO.getStatus() != null) {
            brand.setStatus(Brand.Status.valueOf(brandDTO.getStatus()));
        }

        Brand updated = brandRepository.save(brand);
        return brandMapper.toDTO(updated);
    }

    @Override
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }
}

