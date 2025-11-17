package com.orchard.orchard_store_backend.modules.catalog.attribute.mapper;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;

@Mapper(componentModel = "spring", uses = AttributeValueMapper.class)
public interface ProductAttributeMapper {

    @Mapping(target = "attributeType", source = "attributeType")
    @Mapping(target = "dataType", source = "dataType")
    ProductAttributeDTO toDTO(ProductAttribute entity);

    @Mapping(target = "attributeType", expression = "java(stringToAttributeType(dto.getAttributeType()))")
    @Mapping(target = "dataType", expression = "java(stringToDataType(dto.getDataType()))")
    @Mapping(target = "values", ignore = true)
    ProductAttribute toEntity(ProductAttributeDTO dto);

    default ProductAttribute.AttributeType stringToAttributeType(String type) {
        if (type == null) {
            return ProductAttribute.AttributeType.SELECT;
        }
        return ProductAttribute.AttributeType.valueOf(type.toUpperCase());
    }

    default ProductAttribute.AttributeDataType stringToDataType(String type) {
        if (type == null) {
            return ProductAttribute.AttributeDataType.STRING;
        }
        return ProductAttribute.AttributeDataType.valueOf(type.toUpperCase());
    }

    @AfterMapping
    default void ensureValues(@MappingTarget ProductAttribute attribute) {
        if (attribute.getValues() == null) {
            attribute.setValues(Collections.emptyList());
        }
    }
}

