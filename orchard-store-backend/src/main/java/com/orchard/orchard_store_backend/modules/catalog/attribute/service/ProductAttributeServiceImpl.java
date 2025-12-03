package com.orchard.orchard_store_backend.modules.catalog.attribute.service;

import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.AttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.AttributeValueMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.mapper.ProductAttributeMapper;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.AttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductAttributeServiceImpl implements ProductAttributeService {

    private final ProductAttributeRepository productAttributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductAttributeMapper productAttributeMapper;
    private final AttributeValueMapper attributeValueMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductAttributeDTO> getAttributes(String keyword, String status, String domain, Pageable pageable) {
        Specification<ProductAttribute> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by keyword (search in attributeName, attributeNameEn, or attributeKey)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("attributeName")), searchPattern),
                        cb.like(cb.lower(root.get("attributeNameEn")), searchPattern),
                        cb.like(cb.lower(root.get("attributeKey")), searchPattern)
                ));
            }

            // Filter by status
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
            }

            // Filter by domain (PERFUME / COSMETICS / COMMON)
            if (domain != null && !domain.trim().isEmpty() && !domain.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("domain")), domain.toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productAttributeRepository.findAll(spec, pageable)
                .map(productAttributeMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductAttributeDTO> getAllAttributes() {
        return productAttributeRepository.findAll()
                .stream()
                .map(productAttributeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductAttributeDTO getAttribute(Long id) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductAttribute", id));
        return productAttributeMapper.toDTO(attribute);
    }

    @Override
    @Transactional
    public ProductAttributeDTO createAttribute(ProductAttributeDTO dto) {
        if (productAttributeRepository.existsByAttributeKey(dto.getAttributeKey())) {
            throw new ResourceAlreadyExistsException("ProductAttribute", "attributeKey", dto.getAttributeKey());
        }

        // Validation: Nếu is_variant_specific = TRUE, thì attribute_type phải là SELECT
        if (Boolean.TRUE.equals(dto.getVariantSpecific())) {
            if (!"SELECT".equalsIgnoreCase(dto.getAttributeType())) {
                throw new IllegalArgumentException(
                    "Thuộc tính dùng cho biến thể (is_variant_specific = true) chỉ có thể có loại SELECT. " +
                    "Một sản phẩm không thể có nhiều giá trị biến thể cùng lúc (ví dụ: không thể vừa 50ml vừa 100ml)."
                );
            }
        }

        ProductAttribute attribute = productAttributeMapper.toEntity(dto);
        if (!CollectionUtils.isEmpty(dto.getValues())) {
            List<AttributeValue> values = dto.getValues()
                    .stream()
                    .map(attributeValueMapper::toEntity)
                    .peek(value -> value.setAttribute(attribute))
                    .collect(Collectors.toList());
            attribute.setValues(values);
            
            // Validation: Chỉ cho phép 1 giá trị mặc định
            validateOnlyOneDefaultValue(attribute);
        }
        ProductAttribute saved = productAttributeRepository.save(attribute);
        log.info("Created attribute: {} with key: {}", saved.getAttributeName(), saved.getAttributeKey());
        return productAttributeMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProductAttributeDTO updateAttribute(Long id, ProductAttributeDTO dto) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductAttribute", id));

        // Cập nhật thông tin attribute cha
        if (dto.getAttributeName() != null) {
            attribute.setAttributeName(dto.getAttributeName());
        }
        if (dto.getAttributeNameEn() != null) {
            attribute.setAttributeNameEn(dto.getAttributeNameEn());
        }
        if (dto.getAttributeType() != null) {
            attribute.setAttributeType(ProductAttribute.AttributeType.valueOf(dto.getAttributeType().toUpperCase()));
        }
        if (dto.getDataType() != null) {
            attribute.setDataType(ProductAttribute.AttributeDataType.valueOf(dto.getDataType().toUpperCase()));
        }
        if (dto.getFilterable() != null) {
            attribute.setFilterable(dto.getFilterable());
        }
        if (dto.getSearchable() != null) {
            attribute.setSearchable(dto.getSearchable());
        }
        if (dto.getRequired() != null) {
            attribute.setRequired(dto.getRequired());
        }
        if (dto.getVariantSpecific() != null) {
            attribute.setVariantSpecific(dto.getVariantSpecific());
        }
        if (dto.getDisplayOrder() != null) {
            attribute.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getIconClass() != null) {
            attribute.setIconClass(dto.getIconClass());
        }
        if (dto.getColorCode() != null) {
            attribute.setColorCode(dto.getColorCode());
        }
        if (dto.getValidationRules() != null) {
            attribute.setValidationRules(dto.getValidationRules());
        }
        if (dto.getDescription() != null) {
            attribute.setDescription(dto.getDescription());
        }
        if (dto.getHelpText() != null) {
            attribute.setHelpText(dto.getHelpText());
        }
        if (dto.getUnit() != null) {
            attribute.setUnit(dto.getUnit());
        }
        if (dto.getDomain() != null) {
            attribute.setDomain(dto.getDomain());
        }
        if (dto.getStatus() != null) {
            attribute.setStatus(dto.getStatus());
        }

        // Validation: Nếu is_variant_specific = TRUE, thì attribute_type phải là SELECT
        if (Boolean.TRUE.equals(dto.getVariantSpecific())) {
            if (!ProductAttribute.AttributeType.SELECT.equals(attribute.getAttributeType())) {
                throw new IllegalArgumentException(
                    "Thuộc tính dùng cho biến thể (is_variant_specific = true) chỉ có thể có loại SELECT. " +
                    "Một sản phẩm không thể có nhiều giá trị biến thể cùng lúc (ví dụ: không thể vừa 50ml vừa 100ml)."
                );
            }
        }

        // Xử lý nested update cho values
        if (dto.getValues() != null) {
            updateAttributeValues(attribute, dto.getValues());
        }

        ProductAttribute saved = productAttributeRepository.save(attribute);
        log.info("Updated attribute: {} with key: {}", saved.getAttributeName(), saved.getAttributeKey());
        return productAttributeMapper.toDTO(saved);
    }

    /**
     * Xử lý nested update cho AttributeValues:
     * - Value không có ID => INSERT (mới)
     * - Value có ID và tồn tại trong DB => UPDATE
     * - Value tồn tại trong DB nhưng không có trong payload => DELETE (nếu không bị ràng buộc)
     */
    private void updateAttributeValues(ProductAttribute attribute, List<AttributeValueDTO> newValues) {
        // Lấy danh sách values hiện tại từ DB
        List<AttributeValue> existingValues = new ArrayList<>(attribute.getValues());
        Map<Long, AttributeValue> existingValuesMap = existingValues.stream()
                .collect(Collectors.toMap(AttributeValue::getId, Function.identity()));

        // Tạo map cho values mới từ payload (chỉ những cái có ID)
        Map<Long, AttributeValueDTO> newValuesMap = newValues.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(AttributeValueDTO::getId, Function.identity()));

        // Xóa các values không còn trong payload (orphan removal sẽ tự động xóa)
        List<AttributeValue> toDelete = existingValues.stream()
                .filter(existing -> !newValuesMap.containsKey(existing.getId()))
                .collect(Collectors.toList());

        // Kiểm tra ràng buộc trước khi xóa
        for (AttributeValue valueToDelete : toDelete) {
            if (attributeValueRepository.isUsedByProductAttributeValues(valueToDelete.getId())) {
                throw new OperationNotPermittedException(
                        String.format("Không thể xóa giá trị '%s' vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước.",
                                valueToDelete.getDisplayValue())
                );
            }
        }

        // Xóa các values không còn trong payload
        // Vì orphanRemoval = true, chỉ cần remove khỏi collection
        attribute.getValues().removeAll(toDelete);

        // Cập nhật hoặc thêm mới values
        for (AttributeValueDTO dto : newValues) {
            if (dto.getId() != null && existingValuesMap.containsKey(dto.getId())) {
                // UPDATE: Value có ID và tồn tại trong DB
                AttributeValue existingValue = existingValuesMap.get(dto.getId());
                updateAttributeValueFields(existingValue, dto);
            } else {
                // INSERT: Value không có ID hoặc ID không tồn tại trong DB
                AttributeValue newValue = attributeValueMapper.toEntity(dto);
                newValue.setAttribute(attribute);
                attribute.getValues().add(newValue);
            }
        }

        // Sau khi cập nhật/insert xong, xử lý logic isDefault
        // Tìm giá trị đầu tiên có isDefault = true
        AttributeValue defaultValue = attribute.getValues().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
                .findFirst()
                .orElse(null);

        // Nếu có giá trị mặc định, tắt tất cả các giá trị khác
        if (defaultValue != null) {
            attribute.getValues().forEach(v -> {
                if (v != defaultValue) {
                    v.setIsDefault(false);
                }
            });
        }

        // Validation: Chỉ cho phép 1 giá trị mặc định
        validateOnlyOneDefaultValue(attribute);
    }

    /**
     * Validation: Đảm bảo chỉ có 1 giá trị mặc định cho mỗi attribute
     */
    private void validateOnlyOneDefaultValue(ProductAttribute attribute) {
        long defaultCount = attribute.getValues().stream()
                .filter(value -> Boolean.TRUE.equals(value.getIsDefault()))
                .count();

        if (defaultCount > 1) {
            throw new IllegalArgumentException(
                    "Chỉ được phép có 1 giá trị mặc định cho mỗi thuộc tính. Hiện tại có " + defaultCount + " giá trị được đánh dấu là mặc định."
            );
        }
    }

    /**
     * Cập nhật các field của AttributeValue từ DTO
     */
    private void updateAttributeValueFields(AttributeValue value, AttributeValueDTO dto) {
        if (dto.getValue() != null) {
            value.setValue(dto.getValue());
        }
        if (dto.getDisplayValue() != null) {
            value.setDisplayValue(dto.getDisplayValue());
        }
        if (dto.getDisplayValueEn() != null) {
            value.setDisplayValueEn(dto.getDisplayValueEn());
        }
        if (dto.getColorCode() != null) {
            value.setColorCode(dto.getColorCode());
        }
        if (dto.getImageUrl() != null) {
            value.setImageUrl(dto.getImageUrl());
        }
        if (dto.getHexColor() != null) {
            value.setHexColor(dto.getHexColor());
        }
        if (dto.getDescription() != null) {
            value.setDescription(dto.getDescription());
        }
        if (dto.getDisplayOrder() != null) {
            value.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getIsDefault() != null) {
            value.setIsDefault(dto.getIsDefault());
        }
        if (dto.getSearchKeywords() != null) {
            value.setSearchKeywords(dto.getSearchKeywords());
        }
    }

    @Override
    @Transactional
    public void deleteAttribute(Long id) {
        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductAttribute", id));

        // Kiểm tra ràng buộc: nếu đã được sử dụng bởi ProductAttributeValue thì không cho xóa
        if (productAttributeRepository.isUsedByProductAttributeValues(id)) {
            throw new OperationNotPermittedException(
                    "Không thể xóa thuộc tính này vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước."
            );
        }

        productAttributeRepository.delete(attribute);
        log.info("Deleted attribute: {} (id: {})", attribute.getAttributeName(), id);
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
                .orElseThrow(() -> new ResourceNotFoundException("ProductAttribute", attributeId));

        // Validation: Nếu set isDefault = true, tắt tất cả các giá trị khác
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            attribute.getValues().forEach(value -> value.setIsDefault(false));
        }

        AttributeValue value = attributeValueMapper.toEntity(dto);
        value.setAttribute(attribute);
        AttributeValue saved = attributeValueRepository.save(value);
        log.info("Created attribute value: {} for attribute: {}", saved.getDisplayValue(), attribute.getAttributeName());
        return attributeValueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AttributeValueDTO updateAttributeValue(Long attributeId, Long valueId, AttributeValueDTO dto) {
        AttributeValue value = attributeValueRepository.findById(valueId)
                .orElseThrow(() -> new ResourceNotFoundException("AttributeValue", valueId));

        if (!value.getAttribute().getId().equals(attributeId)) {
            throw new OperationNotPermittedException("Attribute value does not belong to attribute");
        }

        // Validation: Nếu set isDefault = true, tắt tất cả các giá trị khác
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            ProductAttribute attribute = value.getAttribute();
            attribute.getValues().forEach(v -> {
                if (!v.getId().equals(valueId)) {
                    v.setIsDefault(false);
                }
            });
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
                .orElseThrow(() -> new ResourceNotFoundException("AttributeValue", valueId));

        if (!value.getAttribute().getId().equals(attributeId)) {
            throw new OperationNotPermittedException("Attribute value does not belong to attribute");
        }

        // Kiểm tra ràng buộc: nếu đã được sử dụng bởi ProductAttributeValue thì không cho xóa
        if (attributeValueRepository.isUsedByProductAttributeValues(valueId)) {
            throw new OperationNotPermittedException(
                    String.format("Không thể xóa giá trị '%s' vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước.",
                            value.getDisplayValue())
            );
        }

        attributeValueRepository.delete(value);
        log.info("Deleted attribute value: {} (id: {})", value.getDisplayValue(), valueId);
    }
}

