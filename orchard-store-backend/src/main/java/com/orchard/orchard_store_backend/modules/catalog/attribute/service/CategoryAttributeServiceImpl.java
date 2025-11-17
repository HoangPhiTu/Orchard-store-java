package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.CategoryAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.CategoryAttributeMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.CategoryAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryAttributeServiceImpl implements CategoryAttributeService {

    private final CategoryAttributeRepository categoryAttributeRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeMapper categoryAttributeMapper;

    @Override
    public List<CategoryAttributeDTO> getAttributesByCategory(Long categoryId) {
        return categoryAttributeRepository.findByCategoryId(categoryId)
                .stream()
                .map(categoryAttributeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryAttributeDTO assignAttributeToCategory(CategoryAttributeDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        ProductAttribute attribute = productAttributeRepository.findById(dto.getAttributeId())
                .orElseThrow(() -> new RuntimeException("Attribute not found"));

        if (categoryAttributeRepository.existsByCategoryIdAndAttributeId(category.getId(), attribute.getId())) {
            throw new RuntimeException("Attribute already assigned to category");
        }

        CategoryAttribute categoryAttribute = CategoryAttribute.builder()
                .category(category)
                .attribute(attribute)
                .required(Boolean.TRUE.equals(dto.getRequired()))
                .displayOrder(dto.getDisplayOrder() == null ? 0 : dto.getDisplayOrder())
                .build();

        CategoryAttribute saved = categoryAttributeRepository.save(categoryAttribute);
        return categoryAttributeMapper.toDTO(saved);
    }

    @Override
    public void removeAttributeFromCategory(Long categoryId, Long attributeId) {
        if (!categoryAttributeRepository.existsByCategoryIdAndAttributeId(categoryId, attributeId)) {
            throw new RuntimeException("Attribute assignment not found");
        }
        categoryAttributeRepository.deleteByCategoryIdAndAttributeId(categoryId, attributeId);
    }
}

