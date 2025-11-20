package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productVariantId", source = "productVariant.id")
    ProductImageDTO toDTO(ProductImage image);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    ProductImage toEntity(ProductImageDTO dto);
}

