package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductSeoUrlDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductSeoUrl;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductSeoUrlMapper {

    @Mapping(target = "productId", source = "product.id")
    ProductSeoUrlDTO toDTO(ProductSeoUrl seoUrl);

    @Mapping(target = "product", ignore = true)
    ProductSeoUrl toEntity(ProductSeoUrlDTO dto);
}

