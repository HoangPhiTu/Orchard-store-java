package com.orchard.orchard_store_backend.modules.catalog.bundle.mapper;

import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.BundleItemDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.ProductBundleDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.BundleItem;
import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductBundleMapper {
    ProductBundleMapper INSTANCE = Mappers.getMapper(ProductBundleMapper.class);

    @Mapping(target = "bundleType", expression = "java(entity.getBundleType() != null ? entity.getBundleType().name() : null)")
    @Mapping(target = "status", expression = "java(entity.getStatus() != null ? entity.getStatus().name() : null)")
    @Mapping(target = "items", expression = "java(mapItems(entity.getItems()))")
    ProductBundleDTO toDTO(ProductBundle entity);

    @Mapping(target = "bundleType", expression = "java(dto.getBundleType() != null && !dto.getBundleType().isEmpty() ? com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle.BundleType.valueOf(dto.getBundleType().toUpperCase()) : null)")
    @Mapping(target = "status", expression = "java(dto.getStatus() != null && !dto.getStatus().isEmpty() ? com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle.Status.valueOf(dto.getStatus().toUpperCase()) : com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle.Status.ACTIVE)")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductBundle toEntity(ProductBundleDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bundleType", expression = "java(dto.getBundleType() != null && !dto.getBundleType().isEmpty() ? com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle.BundleType.valueOf(dto.getBundleType().toUpperCase()) : entity.getBundleType())")
    @Mapping(target = "status", expression = "java(dto.getStatus() != null && !dto.getStatus().isEmpty() ? com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle.Status.valueOf(dto.getStatus().toUpperCase()) : entity.getStatus())")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ProductBundleDTO dto, @MappingTarget ProductBundle entity);

    default List<BundleItemDTO> mapItems(List<BundleItem> items) {
        if (items == null || items.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());
    }

    default BundleItemDTO toItemDTO(BundleItem item) {
        if (item == null) {
            return null;
        }
        BundleItemDTO dto = new BundleItemDTO();
        dto.setId(item.getId());
        dto.setBundleId(item.getBundle() != null ? item.getBundle().getId() : null);
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setProductName(item.getProduct() != null ? item.getProduct().getName() : null);
        dto.setProductSlug(item.getProduct() != null ? item.getProduct().getSlug() : null);
        dto.setProductVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null);
        dto.setProductVariantName(item.getProductVariant() != null ? item.getProductVariant().getVariantName() : null);
        dto.setProductVariantSku(item.getProductVariant() != null ? item.getProductVariant().getSku() : null);
        dto.setQuantity(item.getQuantity());
        dto.setIsRequired(item.getIsRequired());
        dto.setDisplayOrder(item.getDisplayOrder());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }
}

