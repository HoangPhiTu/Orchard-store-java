package com.orchard.orchard_store_backend.modules.inventory.mapper;

import com.orchard.orchard_store_backend.modules.inventory.dto.InventoryTransactionDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "productVariantSku", source = "productVariant.sku")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "transactionType", source = "transactionType")
    InventoryTransactionDTO toDTO(InventoryTransaction entity);
}

