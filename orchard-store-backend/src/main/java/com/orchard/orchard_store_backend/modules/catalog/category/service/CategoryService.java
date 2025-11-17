package com.orchard.orchard_store_backend.modules.catalog.category.service;

import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {

    List<CategoryDTO> getAllRootCategories();

    List<CategoryDTO> getAllCategories();

    CategoryDTO getCategoryById(Long id);

    CategoryDTO getCategoryBySlug(String slug);

    List<CategoryDTO> getChildrenCategories(Long parentId);

    CategoryDTO createCategory(CategoryDTO categoryDTO);

    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);

    void deleteCategory(Long id);
}

