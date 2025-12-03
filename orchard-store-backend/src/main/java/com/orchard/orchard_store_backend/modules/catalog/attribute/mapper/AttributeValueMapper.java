package com.orchard.orchard_store_backend.modules.catalog.attribute.mapper;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface AttributeValueMapper {

    @Mapping(target = "attributeId", source = "attribute.id")
    AttributeValueDTO toDTO(AttributeValue entity);

    @Mapping(target = "attribute", ignore = true)
    AttributeValue toEntity(AttributeValueDTO dto);
}

