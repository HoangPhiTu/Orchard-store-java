package com.orchard.orchard_store_backend.service;

import com.orchard.orchard_store_backend.dto.CategoryDTO;
import com.orchard.orchard_store_backend.entity.Category;
import com.orchard.orchard_store_backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public List<CategoryDTO> getAllRootCategories() {
        return categoryRepository.findAllActiveRootCategories()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return toDTO(category);
    }
    
    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
        return toDTO(category);
    }
    
    public List<CategoryDTO> getChildrenCategories(Long parentId) {
        return categoryRepository.findActiveChildrenByParentId(parentId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsBySlug(categoryDTO.getSlug())) {
            throw new RuntimeException("Category with slug already exists: " + categoryDTO.getSlug());
        }
        
        Category category = toEntity(categoryDTO);
        
        // Set parent if provided
        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + categoryDTO.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }
        
        Category saved = categoryRepository.save(category);
        return toDTO(saved);
    }
    
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (categoryRepository.existsBySlugAndIdNot(categoryDTO.getSlug(), id)) {
            throw new RuntimeException("Category with slug already exists: " + categoryDTO.getSlug());
        }
        
        category.setName(categoryDTO.getName());
        category.setSlug(categoryDTO.getSlug());
        category.setDescription(categoryDTO.getDescription());
        category.setImageUrl(categoryDTO.getImageUrl());
        category.setDisplayOrder(categoryDTO.getDisplayOrder());
        if (categoryDTO.getStatus() != null) {
            category.setStatus(Category.Status.valueOf(categoryDTO.getStatus()));
        }
        
        // Update parent if changed
        if (categoryDTO.getParentId() != null && 
            (category.getParent() == null || !category.getParent().getId().equals(categoryDTO.getParentId()))) {
            Category parent = categoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + categoryDTO.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        }
        
        Category updated = categoryRepository.save(category);
        return toDTO(updated);
    }
    
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
    
    private CategoryDTO toDTO(Category category) {
        CategoryDTO dto = CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .level(category.getLevel())
                .displayOrder(category.getDisplayOrder())
                .status(category.getStatus().name())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
        
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
            dto.setParentName(category.getParent().getName());
        }
        
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildren(category.getChildren().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private Category toEntity(CategoryDTO dto) {
        return Category.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .status(dto.getStatus() != null ? Category.Status.valueOf(dto.getStatus()) : Category.Status.ACTIVE)
                .build();
    }
}

