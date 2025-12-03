package com.orchard.orchard_store_backend.modules.catalog.concentration.mapper;

import com.orchard.orchard_store_backend.modules.catalog.concentration.dto.ConcentrationDTO;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConcentrationMapper {

    @Mapping(target = "status", expression = "java(concentration.getStatus().name())")
    @Mapping(target = "displayName", expression = "java(concentration.getDisplayName())")
    ConcentrationDTO toDTO(Concentration concentration);

    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Concentration.Status.valueOf(dto.getStatus().toUpperCase()) : Concentration.Status.ACTIVE)")
    Concentration toEntity(ConcentrationDTO dto);
}

