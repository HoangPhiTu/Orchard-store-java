package com.orchard.orchard_store_backend.modules.catalog.brand.mapper;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BrandAdminMapper {

    @Mapping(target = "status", expression = "java(brand.getStatus().name())")
    BrandDTO toDTO(Brand brand);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug được set trong service
    @Mapping(target = "status", ignore = true) // Status được set trong service
    @Mapping(target = "displayOrder", ignore = true) // DisplayOrder có thể null trong create
    @Mapping(target = "websiteUrl", source = "website")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Brand toEntity(BrandCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug được xử lý trong service
    @Mapping(target = "websiteUrl", source = "website")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Brand toEntity(BrandUpdateRequest request);
}

