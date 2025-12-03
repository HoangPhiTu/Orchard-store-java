package com.orchard.orchard_store_backend.modules.inventory.mapper;

import com.orchard.orchard_store_backend.modules.inventory.dto.WarehouseDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.Warehouse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    @Mapping(target = "status", expression = "java(warehouse.getStatus().name())")
    WarehouseDTO toDTO(Warehouse warehouse);

    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Warehouse.Status.valueOf(dto.getStatus().toUpperCase()) : Warehouse.Status.ACTIVE)")
    Warehouse toEntity(WarehouseDTO dto);
}

