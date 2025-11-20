package com.orchard.orchard_store_backend.modules.catalog.attribute.mapper;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductAttributeValueMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeKey", source = "attribute.attributeKey")
    @Mapping(target = "attributeName", source = "attribute.attributeName")
    @Mapping(target = "attributeValueId", source = "attributeValue.id")
    @Mapping(target = "attributeValueDisplay", source = "attributeValue.displayValue")
    @Mapping(target = "scope", expression = "java(entity.getScope() != null ? entity.getScope().name() : null)")
    ProductAttributeValueDTO toDTO(ProductAttributeValue entity);
}

