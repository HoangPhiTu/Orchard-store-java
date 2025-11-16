package com.orchard.orchard_store_backend.service;

import com.orchard.orchard_store_backend.dto.BrandDTO;
import com.orchard.orchard_store_backend.entity.Brand;
import com.orchard.orchard_store_backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrandService {
    
    private final BrandRepository brandRepository;
    
    public List<BrandDTO> getAllActiveBrands() {
        return brandRepository.findAllActiveBrands()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        return toDTO(brand);
    }
    
    public BrandDTO getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Brand not found with slug: " + slug));
        return toDTO(brand);
    }
    
    public BrandDTO createBrand(BrandDTO brandDTO) {
        if (brandRepository.existsBySlug(brandDTO.getSlug())) {
            throw new RuntimeException("Brand with slug already exists: " + brandDTO.getSlug());
        }
        
        Brand brand = toEntity(brandDTO);
        Brand saved = brandRepository.save(brand);
        return toDTO(saved);
    }
    
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
        return toDTO(updated);
    }
    
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }
    
    private BrandDTO toDTO(Brand brand) {
        return BrandDTO.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .description(brand.getDescription())
                .logoUrl(brand.getLogoUrl())
                .country(brand.getCountry())
                .websiteUrl(brand.getWebsiteUrl())
                .displayOrder(brand.getDisplayOrder())
                .status(brand.getStatus().name())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }
    
    private Brand toEntity(BrandDTO dto) {
        return Brand.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .logoUrl(dto.getLogoUrl())
                .country(dto.getCountry())
                .websiteUrl(dto.getWebsiteUrl())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .status(dto.getStatus() != null ? Brand.Status.valueOf(dto.getStatus()) : Brand.Status.ACTIVE)
                .build();
    }
}

