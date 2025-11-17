package com.orchard.orchard_store_backend.modules.catalog.category.service;

import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.mapper.CategoryMapper;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryDTO> getAllRootCategories() {
        return categoryRepository.findAllActiveRootCategories()
                .stream()
                .map(this::mapWithChildren)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapWithChildren)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapWithChildren(category);
    }

    @Override
    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
        return mapWithChildren(category);
    }

    @Override
    public List<CategoryDTO> getChildrenCategories(Long parentId) {
        return categoryRepository.findActiveChildrenByParentId(parentId)
                .stream()
                .map(this::mapWithChildren)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsBySlug(categoryDTO.getSlug())) {
            throw new RuntimeException("Category with slug already exists: " + categoryDTO.getSlug());
        }

        Category category = categoryMapper.toEntity(categoryDTO);

        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + categoryDTO.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }

        Category saved = categoryRepository.save(category);
        return mapWithChildren(saved);
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        if (categoryRepository.existsBySlugAndIdNot(categoryDTO.getSlug(), id)) {
            throw new RuntimeException("Category with slug already exists: " + categoryDTO.getSlug());
        }

        Category updatedEntity = categoryMapper.toEntity(categoryDTO);
        category.setName(updatedEntity.getName());
        category.setSlug(updatedEntity.getSlug());
        category.setDescription(updatedEntity.getDescription());
        category.setImageUrl(updatedEntity.getImageUrl());
        category.setDisplayOrder(updatedEntity.getDisplayOrder());
        category.setStatus(updatedEntity.getStatus());

        if (categoryDTO.getParentId() != null) {
            if (category.getParent() == null || !category.getParent().getId().equals(categoryDTO.getParentId())) {
                Category parent = categoryRepository.findById(categoryDTO.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + categoryDTO.getParentId()));
                category.setParent(parent);
                category.setLevel(parent.getLevel() + 1);
            }
        } else {
            category.setParent(null);
            category.setLevel(0);
        }

        Category updated = categoryRepository.save(category);
        return mapWithChildren(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDTO mapWithChildren(Category category) {
        CategoryDTO dto = categoryMapper.toDTO(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildren(category.getChildren().stream()
                    .map(this::mapWithChildren)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}

