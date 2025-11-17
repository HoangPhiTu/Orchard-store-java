package com.orchard.orchard_store_backend.modules.inventory.mapper;

import com.orchard.orchard_store_backend.modules.inventory.dto.StockAlertDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.StockAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockAlertMapper {

    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "productVariantSku", source = "productVariant.sku")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "alertType", source = "alertType")
    StockAlertDTO toDTO(StockAlert entity);
}

