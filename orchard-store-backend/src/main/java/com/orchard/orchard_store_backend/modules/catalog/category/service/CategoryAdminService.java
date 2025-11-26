package com.orchard.orchard_store_backend.modules.catalog.category.service;

import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryAdminService {

    Page<CategoryDTO> getCategories(String keyword, String status, Pageable pageable);

    List<CategoryDTO> getCategoriesTree(); // Trả về cây danh mục (Tree structure)

    CategoryDTO getCategoryById(Long id);

    CategoryDTO createCategory(CategoryCreateRequest request);

    CategoryDTO updateCategory(Long id, CategoryUpdateRequest request);

    void deleteCategory(Long id);
}

