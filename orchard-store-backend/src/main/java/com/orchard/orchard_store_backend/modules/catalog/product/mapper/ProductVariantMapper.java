package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductVariantDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "concentrationId", source = "concentration.id")
    @Mapping(target = "concentrationName", source = "concentration.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "status", expression = "java(variant.getStatus().name())")
    @Mapping(target = "stockStatus", expression = "java(variant.getStockStatus() != null ? variant.getStockStatus().name() : null)")
    @Mapping(target = "cachedAttributes", source = "cachedAttributes")
    ProductVariantDTO toDTO(ProductVariant variant);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "concentration", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "cachedAttributes", source = "cachedAttributes")
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? ProductVariant.Status.valueOf(dto.getStatus().toUpperCase()) : ProductVariant.Status.ACTIVE)")
    @Mapping(target = "stockStatus", expression = "java(dto.getStockStatus() != null ? ProductVariant.StockStatus.valueOf(dto.getStockStatus().toUpperCase()) : ProductVariant.StockStatus.IN_STOCK)")
    ProductVariant toEntity(ProductVariantDTO dto);
}

