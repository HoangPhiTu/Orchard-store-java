package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service to sync product attributes from EAV model to JSONB cached_attributes column
 * for optimized filtering and searching.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductVariantAttributeCacheService {

    private final ProductVariantRepository variantRepository;
    private final ProductAttributeValueRepository attributeValueRepository;

    /**
     * Sync attributes for a single variant from EAV to JSONB cache
     */
    public void syncVariantAttributes(Long variantId) {
        if (variantId == null) {
            throw new IllegalArgumentException("Variant ID cannot be null");
        }
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + variantId));

        Map<String, Object> cachedAttributes = buildCachedAttributes(variant);
        variant.setCachedAttributes(cachedAttributes);
        variantRepository.save(variant);

        log.debug("Synced attributes for variant {}: {}", variantId, cachedAttributes);
    }

    /**
     * Sync attributes for all variants of a product
     */
    public void syncProductVariants(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductId(productId);
        variants.forEach(variant -> {
            Map<String, Object> cachedAttributes = buildCachedAttributes(variant);
            variant.setCachedAttributes(cachedAttributes);
        });
        variantRepository.saveAll(variants);
        log.info("Synced attributes for {} variants of product {}", variants.size(), productId);
    }

    /**
     * Sync all variants (use with caution - can be slow for large datasets)
     */
    public void syncAllVariants() {
        List<ProductVariant> allVariants = variantRepository.findAll();
        allVariants.forEach(variant -> {
            Map<String, Object> cachedAttributes = buildCachedAttributes(variant);
            variant.setCachedAttributes(cachedAttributes);
        });
        variantRepository.saveAll(allVariants);
        log.info("Synced attributes for {} variants", allVariants.size());
    }

    /**
     * Build cached attributes map from EAV model
     */
    private Map<String, Object> buildCachedAttributes(ProductVariant variant) {
        Map<String, Object> cachedAttributes = new HashMap<>();

        // Get variant-specific attributes
        List<ProductAttributeValue> variantAttributes = attributeValueRepository
                .findByProductVariantId(variant.getId());

        for (ProductAttributeValue pav : variantAttributes) {
            ProductAttribute attribute = pav.getAttribute();
            AttributeValue attributeValue = pav.getAttributeValue();

            Map<String, Object> attrData = new HashMap<>();
            attrData.put("type", attribute.getAttributeType().name());
            attrData.put("dataType", attribute.getDataType().name());

            if (attributeValue != null) {
                attrData.put("value", attributeValue.getValue());
                attrData.put("display", attributeValue.getDisplayValue());
            } else if (pav.getCustomValue() != null) {
                attrData.put("value", pav.getCustomValue());
                attrData.put("display", pav.getCustomValue());
            }

            if (pav.getNumericValue() != null) {
                attrData.put("numericValue", pav.getNumericValue());
            }

            cachedAttributes.put(attribute.getAttributeKey(), attrData);
        }

        // Get product-level attributes (if variant doesn't have variant-specific override)
        if (variant.getProduct() != null) {
            List<ProductAttributeValue> productAttributes = attributeValueRepository
                    .findByProductIdAndScope(variant.getProduct().getId(), ProductAttributeValue.Scope.PRODUCT);

            for (ProductAttributeValue pav : productAttributes) {
                ProductAttribute attribute = pav.getAttribute();
                
                // Only add if variant doesn't already have this attribute
                if (!cachedAttributes.containsKey(attribute.getAttributeKey())) {
                    AttributeValue attributeValue = pav.getAttributeValue();

                    Map<String, Object> attrData = new HashMap<>();
                    attrData.put("type", attribute.getAttributeType().name());
                    attrData.put("dataType", attribute.getDataType().name());

                    if (attributeValue != null) {
                        attrData.put("value", attributeValue.getValue());
                        attrData.put("display", attributeValue.getDisplayValue());
                    } else if (pav.getCustomValue() != null) {
                        attrData.put("value", pav.getCustomValue());
                        attrData.put("display", pav.getCustomValue());
                    }

                    if (pav.getNumericValue() != null) {
                        attrData.put("numericValue", pav.getNumericValue());
                    }

                    cachedAttributes.put(attribute.getAttributeKey(), attrData);
                }
            }
        }

        return cachedAttributes;
    }
}

