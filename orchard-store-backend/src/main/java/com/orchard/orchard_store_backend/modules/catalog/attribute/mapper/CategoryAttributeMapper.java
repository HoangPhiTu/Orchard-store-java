package com.orchard.orchard_store_backend.modules.catalog.attribute.mapper;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.CategoryAttribute;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryAttributeMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeName", source = "attribute.attributeName")
    @Mapping(target = "attributeKey", source = "attribute.attributeKey")
    CategoryAttributeDTO toDTO(CategoryAttribute entity);
}

