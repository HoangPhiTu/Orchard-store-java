package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.service.ProductAttributeValueService;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import com.orchard.orchard_store_backend.modules.catalog.brand.repository.BrandRepository;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import com.orchard.orchard_store_backend.modules.catalog.concentration.repository.ConcentrationRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
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

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final ConcentrationRepository concentrationRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductMapper productMapper;
    private final ProductVariantMapper productVariantMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductAttributeValueService productAttributeValueService;

    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::toDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return toDTO(product);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Brand brand = brandRepository.findById(productDTO.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + productDTO.getBrandId()));

        Product product = productMapper.toEntity(productDTO);
        product.setBrand(brand);

        Product saved = productRepository.save(product);
        return toDTO(saved);
    }

    /**
     * Create product with full details (variants, images)
     * Use ProductDetailDTO for create operations that include variants/images
     */
    public ProductDetailDTO createProductWithDetails(ProductDetailDTO productDetailDTO) {
        Brand brand = brandRepository.findById(productDetailDTO.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + productDetailDTO.getBrandId()));

        Product product = productMapper.toEntity(productDetailDTO);
        product.setBrand(brand);

        Product saved = productRepository.save(product);

        persistVariants(saved, productDetailDTO.getVariants());
        persistImages(saved, productDetailDTO.getImages());

        return getProductDetailById(saved.getId());
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        productMapper.updateProductFromDto(productDTO, product);

        if (productDTO.getBrandId() != null &&
                !Objects.equals(product.getBrand().getId(), productDTO.getBrandId())) {
            Brand brand = brandRepository.findById(productDTO.getBrandId())
                    .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + productDTO.getBrandId()));
            product.setBrand(brand);
        }

        Product updated = productRepository.save(product);
        return toDTO(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private void persistVariants(Product product, List<ProductVariantDTO> variants) {
        if (variants == null || variants.isEmpty()) {
            return;
        }

        for (ProductVariantDTO variantDTO : variants) {
            ProductVariant variant = productVariantMapper.toEntity(variantDTO);
            variant.setProduct(product);

            if (variantDTO.getConcentrationId() != null) {
                Concentration concentration = concentrationRepository.findById(variantDTO.getConcentrationId())
                        .orElseThrow(() -> new IllegalArgumentException("Concentration not found with id: " + variantDTO.getConcentrationId()));
                variant.setConcentration(concentration);
            }

            if (variantDTO.getCategoryId() != null) {
                Category category = categoryRepository.findById(variantDTO.getCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + variantDTO.getCategoryId()));
                variant.setCategory(category);
            }

            variantRepository.save(variant);
        }
    }

    private void persistImages(Product product, List<ProductImageDTO> images) {
        if (images == null || images.isEmpty()) {
            return;
        }

        for (ProductImageDTO imageDTO : images) {
            ProductImage image = productImageMapper.toEntity(imageDTO);
            image.setProduct(product);

            if (imageDTO.getProductVariantId() != null) {
                ProductVariant variant = variantRepository.findById(imageDTO.getProductVariantId())
                        .orElseThrow(() -> new IllegalArgumentException("Variant not found with id: " + imageDTO.getProductVariantId()));
                image.setProductVariant(variant);
            }

            imageRepository.save(image);
        }
    }

    private ProductDTO toDTO(Product product) {
        // Use Entity Graph to fetch relationships if needed
        Product productWithDetails = productRepository.findByIdWithDetails(product.getId())
                .orElse(product);
        return productMapper.toDTO(productWithDetails);
    }

    /**
     * Convert Product to ProductDetailDTO with all relationships
     */
    public ProductDetailDTO toDetailDTO(Product product) {
        // Use Entity Graph to fetch all relationships
        Product productWithDetails = productRepository.findByIdWithDetails(product.getId())
                .orElse(product);
        return productMapper.toDetailDTO(productWithDetails);
    }

    /**
     * Get product detail by ID
     */
    public ProductDetailDTO getProductDetailById(Long id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return toDetailDTO(product);
    }
}
