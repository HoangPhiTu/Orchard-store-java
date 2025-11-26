package com.orchard.orchard_store_backend.modules.catalog.category.mapper;

import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryAdminMapper {

    @Mapping(target = "status", expression = "java(category.getStatus().name())")
    @Mapping(target = "parentId", source = "parentId")
    @Mapping(target = "parentName", expression = "java(category.getParent() != null ? category.getParent().getName() : null)")
    CategoryDTO toDTO(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug được set trong service
    @Mapping(target = "status", ignore = true) // Status được set trong service
    @Mapping(target = "displayOrder", ignore = true) // DisplayOrder có thể null trong create
    @Mapping(target = "parent", ignore = true) // Parent được set trong service
    @Mapping(target = "parentId", ignore = true) // ParentId được set trong service
    @Mapping(target = "children", ignore = true) // Children không cần map từ request
    @Mapping(target = "level", ignore = true) // Level được tính trong service
    @Mapping(target = "path", ignore = true) // Path được tính trong service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Category toEntity(CategoryCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug được xử lý trong service
    @Mapping(target = "parent", ignore = true) // Parent được set trong service
    @Mapping(target = "parentId", ignore = true) // ParentId được set trong service
    @Mapping(target = "children", ignore = true) // Children không cần map từ request
    @Mapping(target = "level", ignore = true) // Level được tính trong service
    @Mapping(target = "path", ignore = true) // Path được tính trong service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Category toEntity(CategoryUpdateRequest request);
}

