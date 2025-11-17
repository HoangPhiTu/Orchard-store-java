package com.orchard.orchard_store_backend.modules.catalog.brand.mapper;

import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    @Mapping(target = "status", expression = "java(brand.getStatus().name())")
    BrandDTO toDTO(Brand brand);

    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Brand.Status.valueOf(dto.getStatus()) : Brand.Status.ACTIVE)")
    Brand toEntity(BrandDTO dto);
}

