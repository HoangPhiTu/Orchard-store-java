package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductVariantDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "status", expression = "java(variant.getStatus().name())")
    @Mapping(target = "stockStatus", expression = "java(calculateStockStatus(variant))")
    ProductVariantDTO toDTO(ProductVariant variant);

    default String calculateStockStatus(ProductVariant variant) {
        if (variant == null || variant.getAvailableQuantity() == null) {
            return "UNKNOWN";
        }
        int available = variant.getAvailableQuantity();
        int threshold = variant.getLowStockThreshold() != null ? variant.getLowStockThreshold() : 10;
        
        if (available == 0) {
            return "OUT_OF_STOCK";
        } else if (available <= threshold) {
            return "LOW_STOCK";
        } else {
            return "IN_STOCK";
        }
    }

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? ProductVariant.Status.valueOf(dto.getStatus()) : ProductVariant.Status.ACTIVE)")
    ProductVariant toEntity(ProductVariantDTO dto);
}

