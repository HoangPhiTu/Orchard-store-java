package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.ProductAttributeValueMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.AttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductAttributeValueServiceImpl implements ProductAttributeValueService {

    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductAttributeValueMapper productAttributeValueMapper;

    @Override
    public List<ProductAttributeValueDTO> getAttributesForProduct(Long productId) {
        return productAttributeValueRepository.findByProductId(productId)
                .stream()
                .map(productAttributeValueMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ProductAttributeValueDTO> saveAttributesForProduct(Long productId, List<ProductAttributeValueDTO> values) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productAttributeValueRepository.deleteByProductId(productId);

        if (values == null || values.isEmpty()) {
            return List.of();
        }

        List<ProductAttributeValue> entities = new ArrayList<>();
        for (ProductAttributeValueDTO dto : values) {
            ProductAttribute attribute = productAttributeRepository.findById(dto.getAttributeId())
                    .orElseThrow(() -> new RuntimeException("Attribute not found"));

            AttributeValue attributeValue = null;
            if (dto.getAttributeValueId() != null) {
                attributeValue = attributeValueRepository.findById(dto.getAttributeValueId())
                        .orElseThrow(() -> new RuntimeException("Attribute value not found"));
                if (!attributeValue.getAttribute().getId().equals(attribute.getId())) {
                    throw new RuntimeException("Attribute value does not belong to attribute");
                }
            }

            ProductVariant variant = null;
            if (dto.getProductVariantId() != null) {
                variant = productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Product variant not found"));
                if (!variant.getProduct().getId().equals(productId)) {
                    throw new RuntimeException("Variant does not belong to product");
                }
            }

            ProductAttributeValue entity = ProductAttributeValue.builder()
                    .product(product)
                    .productVariant(variant)
                    .attribute(attribute)
                    .attributeValue(attributeValue)
                    .customValue(dto.getCustomValue())
                    .numericValue(dto.getNumericValue())
                    .displayOrder(dto.getDisplayOrder() == null ? 0 : dto.getDisplayOrder())
                    .primary(Boolean.TRUE.equals(dto.getPrimary()))
                    .scope(variant != null ? ProductAttributeValue.Scope.VARIANT : ProductAttributeValue.Scope.PRODUCT)
                    .build();
            entities.add(entity);
        }

        return productAttributeValueRepository.saveAll(entities)
                .stream()
                .map(productAttributeValueMapper::toDTO)
                .collect(Collectors.toList());
    }
}

