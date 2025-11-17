package com.orchard.orchard_store_backend.modules.catalog.bundle.mapper;

import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.BundleItemDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.BundleItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface BundleItemMapper {
    BundleItemMapper INSTANCE = Mappers.getMapper(BundleItemMapper.class);

    @Mapping(target = "bundleId", expression = "java(entity.getBundle() != null ? entity.getBundle().getId() : null)")
    @Mapping(target = "productId", expression = "java(entity.getProduct() != null ? entity.getProduct().getId() : null)")
    @Mapping(target = "productName", expression = "java(entity.getProduct() != null ? entity.getProduct().getName() : null)")
    @Mapping(target = "productSlug", expression = "java(entity.getProduct() != null ? entity.getProduct().getSlug() : null)")
    @Mapping(target = "productVariantId", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getId() : null)")
    @Mapping(target = "productVariantName", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getVariantName() : null)")
    @Mapping(target = "productVariantSku", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getSku() : null)")
    BundleItemDTO toDTO(BundleItem entity);

    @Mapping(target = "bundle", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    BundleItem toEntity(BundleItemDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bundle", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(BundleItemDTO dto, @MappingTarget BundleItem entity);
}

