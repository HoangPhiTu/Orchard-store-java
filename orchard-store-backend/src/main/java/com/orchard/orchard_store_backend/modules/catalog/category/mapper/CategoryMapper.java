package com.orchard.orchard_store_backend.modules.catalog.category.mapper;

import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "children", ignore = true)
    CategoryDTO toDTO(Category category);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    Category toEntity(CategoryDTO dto);
}

