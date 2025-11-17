package com.orchard.orchard_store_backend.modules.catalog.brand.service;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;

import java.util.List;

public interface BrandService {

    List<BrandDTO> getAllActiveBrands();

    List<BrandDTO> getAllBrands();

    BrandDTO getBrandById(Long id);

    BrandDTO getBrandBySlug(String slug);

    BrandDTO createBrand(BrandDTO brandDTO);

    BrandDTO updateBrand(Long id, BrandDTO brandDTO);

    void deleteBrand(Long id);
}

