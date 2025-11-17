package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {ProductVariantMapper.class, ProductImageMapper.class})
public interface ProductMapper {

    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    ProductDTO toDTO(Product product);

    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus()) : Product.Status.ACTIVE)")
    Product toEntity(ProductDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus()) : product.getStatus())")
    void updateProductFromDto(ProductDTO dto, @MappingTarget Product product);
}

