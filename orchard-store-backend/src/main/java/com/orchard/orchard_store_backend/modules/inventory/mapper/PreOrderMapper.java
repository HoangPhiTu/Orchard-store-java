package com.orchard.orchard_store_backend.modules.inventory.mapper;

import com.orchard.orchard_store_backend.modules.inventory.dto.PreOrderAdminDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.PreOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PreOrderMapper {

    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "productVariantSku", source = "productVariant.sku")
    @Mapping(target = "productName", source = "productVariant.product.name")
    PreOrderAdminDTO toAdminDTO(PreOrder preOrder);
}

