package com.orchard.orchard_store_backend.service;

import com.orchard.orchard_store_backend.dto.*;
import com.orchard.orchard_store_backend.entity.*;
import com.orchard.orchard_store_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByStatusOrderByCreatedAtDesc(Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }
    
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDTO(product);
    }
    
    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));
        
        // Increment view count
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        
        return toDTO(product);
    }
    
    public Page<ProductDTO> searchProducts(Long brandId, Long categoryId, 
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          String searchTerm, Pageable pageable) {
        return productRepository.searchProducts(brandId, categoryId, minPrice, maxPrice, searchTerm, pageable)
                .map(this::toDTO);
    }
    
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findFeaturedProducts()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ProductDTO> getNewProducts(Pageable pageable) {
        return productRepository.findNewProducts(pageable)
                .map(this::toDTO);
    }
    
    public Page<ProductDTO> getBestsellerProducts(Pageable pageable) {
        return productRepository.findBestsellerProducts(pageable)
                .map(this::toDTO);
    }
    
    public Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable) {
        return productRepository.findByBrandIdAndStatus(brandId, Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }
    
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndStatus(categoryId, Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }
    
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsBySlug(productDTO.getSlug())) {
            throw new RuntimeException("Product with slug already exists: " + productDTO.getSlug());
        }
        
        Brand brand = brandRepository.findById(productDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productDTO.getBrandId()));
        
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));
        
        Product product = toEntity(productDTO);
        product.setBrand(brand);
        product.setCategory(category);
        
        Product saved = productRepository.save(product);
        
        // Save variants if provided
        if (productDTO.getVariants() != null && !productDTO.getVariants().isEmpty()) {
            for (ProductVariantDTO variantDTO : productDTO.getVariants()) {
                ProductVariant variant = variantToEntity(variantDTO);
                variant.setProduct(saved);
                variantRepository.save(variant);
            }
        }
        
        // Save images if provided
        if (productDTO.getImages() != null && !productDTO.getImages().isEmpty()) {
            for (ProductImageDTO imageDTO : productDTO.getImages()) {
                ProductImage image = imageToEntity(imageDTO);
                image.setProduct(saved);
                imageRepository.save(image);
            }
        }
        
        return toDTO(saved);
    }
    
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        if (productRepository.existsBySlugAndIdNot(productDTO.getSlug(), id)) {
            throw new RuntimeException("Product with slug already exists: " + productDTO.getSlug());
        }
        
        // Update basic fields
        product.setName(productDTO.getName());
        product.setSlug(productDTO.getSlug());
        product.setDescription(productDTO.getDescription());
        product.setShortDescription(productDTO.getShortDescription());
        product.setContent(productDTO.getContent());
        product.setBasePrice(productDTO.getBasePrice());
        product.setSalePrice(productDTO.getSalePrice());
        product.setMetaTitle(productDTO.getMetaTitle());
        product.setMetaDescription(productDTO.getMetaDescription());
        product.setMetaKeywords(productDTO.getMetaKeywords());
        product.setDisplayOrder(productDTO.getDisplayOrder());
        product.setIsFeatured(productDTO.getIsFeatured());
        product.setIsNew(productDTO.getIsNew());
        product.setIsBestseller(productDTO.getIsBestseller());
        if (productDTO.getStatus() != null) {
            product.setStatus(Product.Status.valueOf(productDTO.getStatus()));
        }
        
        // Update brand if changed
        if (productDTO.getBrandId() != null && !product.getBrand().getId().equals(productDTO.getBrandId())) {
            Brand brand = brandRepository.findById(productDTO.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productDTO.getBrandId()));
            product.setBrand(brand);
        }
        
        // Update category if changed
        if (productDTO.getCategoryId() != null && !product.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }
        
        Product updated = productRepository.save(product);
        return toDTO(updated);
    }
    
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
    
    private ProductDTO toDTO(Product product) {
        ProductDTO dto = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .content(product.getContent())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .metaTitle(product.getMetaTitle())
                .metaDescription(product.getMetaDescription())
                .metaKeywords(product.getMetaKeywords())
                .viewCount(product.getViewCount())
                .soldCount(product.getSoldCount())
                .ratingAverage(product.getRatingAverage())
                .ratingCount(product.getRatingCount())
                .displayOrder(product.getDisplayOrder())
                .isFeatured(product.getIsFeatured())
                .isNew(product.getIsNew())
                .isBestseller(product.getIsBestseller())
                .status(product.getStatus().name())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
        
        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            dto.setBrandName(product.getBrand().getName());
        }
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        
        // Load variants
        List<ProductVariant> variants = variantRepository.findActiveVariantsByProductId(product.getId());
        dto.setVariants(variants.stream()
                .map(this::variantToDTO)
                .collect(Collectors.toList()));
        
        // Load images
        List<ProductImage> images = imageRepository.findAllByProductIdOrdered(product.getId());
        dto.setImages(images.stream()
                .map(this::imageToDTO)
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    private Product toEntity(ProductDTO dto) {
        return Product.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .shortDescription(dto.getShortDescription())
                .content(dto.getContent())
                .basePrice(dto.getBasePrice())
                .salePrice(dto.getSalePrice())
                .metaTitle(dto.getMetaTitle())
                .metaDescription(dto.getMetaDescription())
                .metaKeywords(dto.getMetaKeywords())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .isNew(dto.getIsNew() != null ? dto.getIsNew() : false)
                .isBestseller(dto.getIsBestseller() != null ? dto.getIsBestseller() : false)
                .status(dto.getStatus() != null ? Product.Status.valueOf(dto.getStatus()) : Product.Status.ACTIVE)
                .build();
    }
    
    private ProductVariantDTO variantToDTO(ProductVariant variant) {
        return ProductVariantDTO.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .sku(variant.getSku())
                .variantName(variant.getVariantName())
                .price(variant.getPrice())
                .salePrice(variant.getSalePrice())
                .costPrice(variant.getCostPrice())
                .stockQuantity(variant.getStockQuantity())
                .reservedQuantity(variant.getReservedQuantity())
                .availableQuantity(variant.getAvailableQuantity())
                .lowStockThreshold(variant.getLowStockThreshold())
                .weight(variant.getWeight())
                .length(variant.getLength())
                .width(variant.getWidth())
                .height(variant.getHeight())
                .displayOrder(variant.getDisplayOrder())
                .isDefault(variant.getIsDefault())
                .status(variant.getStatus().name())
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }
    
    private ProductVariant variantToEntity(ProductVariantDTO dto) {
        return ProductVariant.builder()
                .sku(dto.getSku())
                .variantName(dto.getVariantName())
                .price(dto.getPrice())
                .salePrice(dto.getSalePrice())
                .costPrice(dto.getCostPrice())
                .stockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0)
                .reservedQuantity(dto.getReservedQuantity() != null ? dto.getReservedQuantity() : 0)
                .lowStockThreshold(dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 10)
                .weight(dto.getWeight())
                .length(dto.getLength())
                .width(dto.getWidth())
                .height(dto.getHeight())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .status(dto.getStatus() != null ? ProductVariant.Status.valueOf(dto.getStatus()) : ProductVariant.Status.ACTIVE)
                .build();
    }
    
    private ProductImageDTO imageToDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .productId(image.getProduct().getId())
                .imageUrl(image.getImageUrl())
                .thumbnailUrl(image.getThumbnailUrl())
                .altText(image.getAltText())
                .displayOrder(image.getDisplayOrder())
                .isPrimary(image.getIsPrimary())
                .createdAt(image.getCreatedAt())
                .build();
    }
    
    private ProductImage imageToEntity(ProductImageDTO dto) {
        return ProductImage.builder()
                .imageUrl(dto.getImageUrl())
                .thumbnailUrl(dto.getThumbnailUrl())
                .altText(dto.getAltText())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false)
                .build();
    }
}

