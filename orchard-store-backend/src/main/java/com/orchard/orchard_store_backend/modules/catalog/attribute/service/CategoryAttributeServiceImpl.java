package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.CategoryAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.CategoryAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.CategoryAttributeMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.ProductAttributeMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.CategoryAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryAttributeServiceImpl implements CategoryAttributeService {

    private final CategoryAttributeRepository categoryAttributeRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeMapper categoryAttributeMapper;
    private final ProductAttributeMapper productAttributeMapper;

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
                .groupName(dto.getGroupName())
                .build();

        CategoryAttribute saved = categoryAttributeRepository.save(categoryAttribute);
        return categoryAttributeMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void removeAttributeFromCategory(Long categoryId, Long attributeId) {
        // Idempotent delete: nếu binding không tồn tại thì coi như đã xóa xong
        if (categoryAttributeRepository.existsByCategoryIdAndAttributeId(categoryId, attributeId)) {
            categoryAttributeRepository.deleteByCategoryIdAndAttributeId(categoryId, attributeId);
        }
    }

    @Override
    @Transactional
    public CategoryAttributeDTO updateCategoryAttributeMetadata(Long categoryId, Long attributeId, CategoryAttributeDTO dto) {
        CategoryAttribute categoryAttribute = categoryAttributeRepository
                .findByCategoryIdAndAttributeId(categoryId, attributeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CategoryAttribute",
                        String.format("categoryId=%d, attributeId=%d", categoryId, attributeId)
                ));

        // Update metadata fields
        if (dto.getRequired() != null) {
            categoryAttribute.setRequired(dto.getRequired());
        }
        if (dto.getDisplayOrder() != null) {
            categoryAttribute.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getGroupName() != null) {
            categoryAttribute.setGroupName(dto.getGroupName().trim().isEmpty() ? null : dto.getGroupName().trim());
        }

        CategoryAttribute saved = categoryAttributeRepository.save(categoryAttribute);
        return categoryAttributeMapper.toDTO(saved);
    }

    @Override
    public Map<String, List<ProductAttributeDTO>> getAttributesForProduct(Long categoryId) {
        List<CategoryAttribute> hierarchyAttributes = getHierarchyCategoryAttributes(categoryId);

        Map<Long, ProductAttributeDTO> mergedByAttribute = new LinkedHashMap<>();
        hierarchyAttributes.stream()
                .filter(ca -> !Boolean.TRUE.equals(ca.getAttribute().getVariantSpecific()))
                .forEach(ca -> {
                    ProductAttributeDTO dto = productAttributeMapper.toDTO(ca.getAttribute());
                    dto.setRequired(ca.getRequired());
                    dto.setDisplayOrder(ca.getDisplayOrder());
                    dto.setGroupName(ca.getGroupName());
                    mergedByAttribute.put(dto.getId(), dto);
                });

        Map<String, List<ProductAttributeDTO>> grouped = mergedByAttribute.values().stream()
                .collect(Collectors.groupingBy(dto -> {
                    if (dto.getGroupName() != null && !dto.getGroupName().trim().isEmpty()) {
                        return dto.getGroupName();
                    }
                    return dto.getDomain() != null ? dto.getDomain() : "COMMON";
                }, LinkedHashMap::new, Collectors.toList()));

        grouped.forEach((groupName, attributes) -> attributes.sort(Comparator.comparing(
                ProductAttributeDTO::getDisplayOrder,
                Comparator.nullsLast(Comparator.naturalOrder())
        )));

        return grouped;
    }

    @Override
    public List<ProductAttributeDTO> getVariantAttributesForCategory(Long categoryId) {
        List<CategoryAttribute> hierarchyAttributes = getHierarchyCategoryAttributes(categoryId);

        Map<Long, ProductAttributeDTO> mergedByAttribute = new LinkedHashMap<>();
        hierarchyAttributes.stream()
                .filter(ca -> Boolean.TRUE.equals(ca.getAttribute().getVariantSpecific()))
                .forEach(ca -> {
                    ProductAttributeDTO dto = productAttributeMapper.toDTO(ca.getAttribute());
                    dto.setRequired(ca.getRequired());
                    dto.setDisplayOrder(ca.getDisplayOrder());
                    dto.setGroupName(ca.getGroupName());
                    mergedByAttribute.put(dto.getId(), dto);
                });

        return new ArrayList<>(mergedByAttribute.values());
    }

    private List<CategoryAttribute> getHierarchyCategoryAttributes(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        List<Long> hierarchyIds = buildHierarchyIds(category);
        if (hierarchyIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> depthOrder = new HashMap<>();
        for (int i = 0; i < hierarchyIds.size(); i++) {
            depthOrder.put(hierarchyIds.get(i), i);
        }

        List<CategoryAttribute> attributes = categoryAttributeRepository.findByCategoryIdIn(hierarchyIds);
        attributes.sort(Comparator
                .comparing((CategoryAttribute ca) -> depthOrder.getOrDefault(ca.getCategory().getId(), Integer.MAX_VALUE))
                .thenComparing(CategoryAttribute::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder()))
        );

        return attributes;
    }

    private List<Long> buildHierarchyIds(Category category) {
        List<Long> hierarchyIds = new ArrayList<>();
        String path = category.getPath();
        if (path != null && !path.isBlank()) {
            Arrays.stream(path.split("/"))
                    .filter(part -> !part.isBlank())
                    .map(Long::valueOf)
                    .forEach(hierarchyIds::add);
        }
        if (hierarchyIds.isEmpty() || !hierarchyIds.get(hierarchyIds.size() - 1).equals(category.getId())) {
            hierarchyIds.add(category.getId());
        }
        return hierarchyIds;
    }
}

