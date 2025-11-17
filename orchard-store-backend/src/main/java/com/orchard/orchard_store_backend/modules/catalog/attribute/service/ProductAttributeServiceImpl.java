package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.AttributeValueMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.ProductAttributeMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.AttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductAttributeServiceImpl implements ProductAttributeService {

    private final ProductAttributeRepository productAttributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductAttributeMapper productAttributeMapper;
    private final AttributeValueMapper attributeValueMapper;

    @Override
    public List<ProductAttributeDTO> getAllAttributes() {
        return productAttributeRepository.findAll()
                .stream()
                .map(productAttributeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductAttributeDTO getAttribute(Long id) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));
        return productAttributeMapper.toDTO(attribute);
    }

    @Override
    @Transactional
    public ProductAttributeDTO createAttribute(ProductAttributeDTO dto) {
        if (productAttributeRepository.existsByAttributeKey(dto.getAttributeKey())) {
            throw new RuntimeException("Attribute key already exists");
        }

        ProductAttribute attribute = productAttributeMapper.toEntity(dto);
        if (!CollectionUtils.isEmpty(dto.getValues())) {
            List<AttributeValue> values = dto.getValues()
                    .stream()
                    .map(attributeValueMapper::toEntity)
                    .peek(value -> value.setAttribute(attribute))
                    .collect(Collectors.toList());
            attribute.setValues(values);
        }
        ProductAttribute saved = productAttributeRepository.save(attribute);
        return productAttributeMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProductAttributeDTO updateAttribute(Long id, ProductAttributeDTO dto) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));

        attribute.setAttributeName(dto.getAttributeName());
        attribute.setAttributeNameEn(dto.getAttributeNameEn());
        if (dto.getAttributeType() != null) {
            attribute.setAttributeType(ProductAttribute.AttributeType.valueOf(dto.getAttributeType().toUpperCase()));
        }
        if (dto.getDataType() != null) {
            attribute.setDataType(ProductAttribute.AttributeDataType.valueOf(dto.getDataType().toUpperCase()));
        }
        attribute.setFilterable(dto.getFilterable());
        attribute.setSearchable(dto.getSearchable());
        attribute.setRequired(dto.getRequired());
        attribute.setVariantSpecific(dto.getVariantSpecific());
        attribute.setDisplayOrder(dto.getDisplayOrder());
        attribute.setIconClass(dto.getIconClass());
        attribute.setColorCode(dto.getColorCode());
        attribute.setValidationRules(dto.getValidationRules());
        attribute.setDescription(dto.getDescription());
        attribute.setHelpText(dto.getHelpText());
        attribute.setStatus(Optional.ofNullable(dto.getStatus()).orElse(attribute.getStatus()));

        ProductAttribute saved = productAttributeRepository.save(attribute);
        return productAttributeMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAttribute(Long id) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));
        productAttributeRepository.delete(attribute);
    }

    @Override
    public List<AttributeValueDTO> getAttributeValues(Long attributeId) {
        return attributeValueRepository.findByAttributeId(attributeId)
                .stream()
                .map(attributeValueMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttributeValueDTO createAttributeValue(Long attributeId, AttributeValueDTO dto) {
        ProductAttribute attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));

        AttributeValue value = attributeValueMapper.toEntity(dto);
        value.setAttribute(attribute);
        AttributeValue saved = attributeValueRepository.save(value);
        return attributeValueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AttributeValueDTO updateAttributeValue(Long attributeId, Long valueId, AttributeValueDTO dto) {
        AttributeValue value = attributeValueRepository.findById(valueId)
                .orElseThrow(() -> new RuntimeException("Attribute value not found"));

        if (!value.getAttribute().getId().equals(attributeId)) {
            throw new RuntimeException("Attribute value does not belong to attribute");
        }

        value.setValue(dto.getValue());
        value.setDisplayValue(dto.getDisplayValue());
        value.setDisplayValueEn(dto.getDisplayValueEn());
        value.setColorCode(dto.getColorCode());
        value.setImageUrl(dto.getImageUrl());
        value.setHexColor(dto.getHexColor());
        value.setDescription(dto.getDescription());
        value.setDisplayOrder(dto.getDisplayOrder());
        value.setIsDefault(dto.getIsDefault());
        value.setSearchKeywords(dto.getSearchKeywords());

        AttributeValue saved = attributeValueRepository.save(value);
        return attributeValueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAttributeValue(Long attributeId, Long valueId) {
        AttributeValue value = attributeValueRepository.findById(valueId)
                .orElseThrow(() -> new RuntimeException("Attribute value not found"));

        if (!value.getAttribute().getId().equals(attributeId)) {
            throw new RuntimeException("Attribute value does not belong to attribute");
        }

        attributeValueRepository.delete(value);
    }
}

