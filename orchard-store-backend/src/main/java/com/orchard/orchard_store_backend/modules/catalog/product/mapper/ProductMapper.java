package com.orchard.orchard_store_backend.modules.catalog.product.mapper;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Mapper(componentModel = "spring", uses = {ProductVariantMapper.class, ProductImageMapper.class, ProductSeoUrlMapper.class})
public interface ProductMapper {

    /**
     * Map Product to ProductDTO (for listing)
     * Only includes basic info and thumbnail/primary image
     */
    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "updatedById", source = "updatedBy.id")
    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "primaryImageUrl", ignore = true)
    ProductDTO toDTO(Product product);

    /**
     * Map Product to ProductDetailDTO (for detail page)
     * Includes variants, images, seoUrls, and calculated fields (totalStock, priceRange)
     */
    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "updatedById", source = "updatedBy.id")
    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    @Mapping(target = "variants", source = "variants")
    @Mapping(target = "images", source = "images")
    @Mapping(target = "seoUrls", source = "seoUrls")
    @Mapping(target = "totalStock", ignore = true)
    @Mapping(target = "priceRange", ignore = true)
    @Mapping(target = "minPrice", ignore = true)
    @Mapping(target = "maxPrice", ignore = true)
    ProductDetailDTO toDetailDTO(Product product);

    /**
     * After mapping Product to ProductDTO, set thumbnail and primary image URLs
     */
    @AfterMapping
    default void setThumbnailAndPrimaryImage(Product product, @MappingTarget ProductDTO dto) {
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            // Find primary image first
            product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .ifPresentOrElse(
                            primaryImg -> {
                                dto.setPrimaryImageUrl(primaryImg.getImageUrl());
                                dto.setThumbnailUrl(primaryImg.getThumbnailUrl() != null 
                                        ? primaryImg.getThumbnailUrl() 
                                        : primaryImg.getImageUrl());
                            },
                            // If no primary image, use first image
                            () -> {
                                var firstImg = product.getImages().get(0);
                                dto.setPrimaryImageUrl(firstImg.getImageUrl());
                                dto.setThumbnailUrl(firstImg.getThumbnailUrl() != null 
                                        ? firstImg.getThumbnailUrl() 
                                        : firstImg.getImageUrl());
                            }
                    );
        }
    }

    /**
     * After mapping Product to ProductDetailDTO, calculate totalStock and priceRange
     */
    @AfterMapping
    default void calculateStockAndPriceRange(Product product, @MappingTarget ProductDetailDTO dto) {
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            // Calculate total stock
            int totalStock = product.getVariants().stream()
                    .filter(v -> v.getStockQuantity() != null)
                    .mapToInt(v -> v.getStockQuantity())
                    .sum();
            dto.setTotalStock(totalStock);

            // Calculate price range
            BigDecimal minPrice = product.getVariants().stream()
                    .filter(v -> v.getPrice() != null)
                    .map(v -> v.getSalePrice() != null && v.getSalePrice().compareTo(BigDecimal.ZERO) > 0 
                            ? v.getSalePrice() 
                            : v.getPrice())
                    .min(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);

            BigDecimal maxPrice = product.getVariants().stream()
                    .filter(v -> v.getPrice() != null)
                    .map(v -> v.getSalePrice() != null && v.getSalePrice().compareTo(BigDecimal.ZERO) > 0 
                            ? v.getSalePrice() 
                            : v.getPrice())
                    .max(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);

            dto.setMinPrice(minPrice);
            dto.setMaxPrice(maxPrice);

            // Format price range string
            if (minPrice.compareTo(BigDecimal.ZERO) > 0 && maxPrice.compareTo(BigDecimal.ZERO) > 0) {
                NumberFormat formatter = NumberFormat.getNumberInstance(Locale.US);
                if (minPrice.compareTo(maxPrice) == 0) {
                    dto.setPriceRange(formatter.format(minPrice) + " VND");
                } else {
                    dto.setPriceRange(formatter.format(minPrice) + " - " + formatter.format(maxPrice) + " VND");
                }
            }
        } else {
            dto.setTotalStock(0);
            dto.setPriceRange("N/A");
        }
    }

    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "seoUrls", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus().toUpperCase()) : Product.Status.DRAFT)")
    Product toEntity(ProductDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "seoUrls", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus().toUpperCase()) : product.getStatus())")
    void updateProductFromDto(ProductDTO dto, @MappingTarget Product product);

    /**
     * Map ProductDetailDTO to Product entity (for create/update)
     * Note: variants, images, seoUrls are ignored - handle separately
     */
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "seoUrls", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus().toUpperCase()) : Product.Status.DRAFT)")
    Product toEntity(ProductDetailDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "seoUrls", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus().toUpperCase()) : product.getStatus())")
    void updateProductFromDetailDto(ProductDetailDTO dto, @MappingTarget Product product);
}

