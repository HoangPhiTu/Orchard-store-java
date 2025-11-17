package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.ProductAttributeValueService;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import com.orchard.orchard_store_backend.modules.catalog.brand.repository.BrandRepository;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductVariantDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductImage;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductImageMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductVariantMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductImageRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
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
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductMapper productMapper;
    private final ProductVariantMapper productVariantMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductAttributeValueService productAttributeValueService;

    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByStatusOrderByCreatedAtDesc(Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDTO(product);
    }

    @Override
    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));

        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        return toDTO(product);
    }

    @Override
    public Page<ProductDTO> searchProducts(Long brandId, Long categoryId,
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          String searchTerm, Pageable pageable) {
        return productRepository.searchProducts(brandId, categoryId, minPrice, maxPrice, searchTerm, pageable)
                .map(this::toDTO);
    }

    @Override
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findFeaturedProducts()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getNewProducts(Pageable pageable) {
        return productRepository.findNewProducts(pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ProductDTO> getBestsellerProducts(Pageable pageable) {
        return productRepository.findBestsellerProducts(pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable) {
        return productRepository.findByBrandIdAndStatus(brandId, Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndStatus(categoryId, Product.Status.ACTIVE, pageable)
                .map(this::toDTO);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsBySlug(productDTO.getSlug())) {
            throw new RuntimeException("Product with slug already exists: " + productDTO.getSlug());
        }

        Brand brand = brandRepository.findById(productDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productDTO.getBrandId()));

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));

        Product product = productMapper.toEntity(productDTO);
        product.setBrand(brand);
        product.setCategory(category);

        Product saved = productRepository.save(product);

        if (productDTO.getVariants() != null && !productDTO.getVariants().isEmpty()) {
            for (ProductVariantDTO variantDTO : productDTO.getVariants()) {
                ProductVariant variant = productVariantMapper.toEntity(variantDTO);
                variant.setProduct(saved);
                variantRepository.save(variant);
            }
        }

        if (productDTO.getImages() != null && !productDTO.getImages().isEmpty()) {
            for (ProductImageDTO imageDTO : productDTO.getImages()) {
                ProductImage image = productImageMapper.toEntity(imageDTO);
                image.setProduct(saved);
                imageRepository.save(image);
            }
        }

        return toDTO(saved);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (productRepository.existsBySlugAndIdNot(productDTO.getSlug(), id)) {
            throw new RuntimeException("Product with slug already exists: " + productDTO.getSlug());
        }

        productMapper.updateProductFromDto(productDTO, product);

        if (productDTO.getBrandId() != null && !product.getBrand().getId().equals(productDTO.getBrandId())) {
            Brand brand = brandRepository.findById(productDTO.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productDTO.getBrandId()));
            product.setBrand(brand);
        }

        if (productDTO.getCategoryId() != null && !product.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);
        return toDTO(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = productMapper.toDTO(product);

        List<ProductVariant> variants = variantRepository.findActiveVariantsByProductId(product.getId());
        dto.setVariants(variants.stream()
                .map(productVariantMapper::toDTO)
                .collect(Collectors.toList()));

        List<ProductImage> images = imageRepository.findAllByProductIdOrdered(product.getId());
        dto.setImages(images.stream()
                .map(productImageMapper::toDTO)
                .collect(Collectors.toList()));

        // Load attribute values
        List<ProductAttributeValueDTO> attributeValues = productAttributeValueService.getAttributesForProduct(product.getId());
        dto.setAttributeValues(attributeValues);

        return dto;
    }
}

