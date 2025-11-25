package com.orchard.orchard_store_backend.modules.catalog.brand.service;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BrandAdminService {

    Page<BrandDTO> getBrands(String keyword, String status, Pageable pageable);

    BrandDTO getBrandById(Long id);

    BrandDTO createBrand(BrandCreateRequest request);

    BrandDTO updateBrand(Long id, BrandUpdateRequest request);

    void deleteBrand(Long id);
}

