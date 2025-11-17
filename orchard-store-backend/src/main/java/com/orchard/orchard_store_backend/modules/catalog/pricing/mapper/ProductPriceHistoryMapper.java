package com.orchard.orchard_store_backend.modules.catalog.pricing.mapper;

import com.orchard.orchard_store_backend.modules.catalog.pricing.dto.ProductPriceHistoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.pricing.entity.ProductPriceHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductPriceHistoryMapper {
    ProductPriceHistoryMapper INSTANCE = Mappers.getMapper(ProductPriceHistoryMapper.class);

    @Mapping(target = "productVariantId", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getId() : null)")
    @Mapping(target = "productVariantName", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getVariantName() : null)")
    @Mapping(target = "productVariantSku", expression = "java(entity.getProductVariant() != null ? entity.getProductVariant().getSku() : null)")
    @Mapping(target = "priceChangeType", expression = "java(entity.getPriceChangeType() != null ? entity.getPriceChangeType().name() : null)")
    @Mapping(target = "changedById", expression = "java(entity.getChangedBy() != null ? entity.getChangedBy().getId() : null)")
    @Mapping(target = "changedByName", expression = "java(entity.getChangedBy() != null ? entity.getChangedBy().getFullName() : null)")
    ProductPriceHistoryDTO toDTO(ProductPriceHistory entity);

    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "priceChangeType", expression = "java(dto.getPriceChangeType() != null && !dto.getPriceChangeType().isEmpty() ? ProductPriceHistory.PriceChangeType.valueOf(dto.getPriceChangeType().toUpperCase()) : null)")
    @Mapping(target = "changedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ProductPriceHistory toEntity(ProductPriceHistoryDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "priceChangeType", expression = "java(dto.getPriceChangeType() != null && !dto.getPriceChangeType().isEmpty() ? ProductPriceHistory.PriceChangeType.valueOf(dto.getPriceChangeType().toUpperCase()) : entity.getPriceChangeType())")
    @Mapping(target = "changedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(ProductPriceHistoryDTO dto, @MappingTarget ProductPriceHistory entity);
}

