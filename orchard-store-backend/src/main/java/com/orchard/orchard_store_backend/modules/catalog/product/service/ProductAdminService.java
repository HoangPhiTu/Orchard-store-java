package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.github.slugify.Slugify;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.attribute.dto.ProductAttributeValueDTO;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.AttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttribute;
import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.ProductAttributeValue;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.AttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeRepository;
import com.orchard.orchard_store_backend.modules.catalog.attribute.repository.ProductAttributeValueRepository;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import com.orchard.orchard_store_backend.modules.catalog.brand.repository.BrandRepository;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import com.orchard.orchard_store_backend.modules.catalog.concentration.repository.ConcentrationRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductImage;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductImageMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.mapper.ProductMapper;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductImageRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service xử lý các logic nghiệp vụ phức tạp cho Product Admin.
 * 
 * Bao gồm:
 * - Slug generation tự động
 * - Đồng bộ Attributes giữa EAV và JSONB
 * - Transaction management
 * - Validation và custom exceptions
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductAdminService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ConcentrationRepository concentrationRepository;
    private final ProductAttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductMapper productMapper;
    private final ProductImageMapper productImageMapper;

    /**
     * Slugify instance để tạo slug từ tên
     */
    private static final Slugify slugify = Slugify.builder()
            .lowerCase(true)
            .underscoreSeparator(false)
            .build();

    /**
     * Tạo mới Product với đầy đủ thông tin (variants, attributes, images).
     * 
     * Logic nghiệp vụ:
     * 1. Validate input (SKU unique, brand exists, etc.)
     * 2. Generate slug tự động từ tên
     * 3. Tạo Product entity
     * 4. Tạo Variants với slug tự động
     * 5. Sync Attributes vào EAV và JSONB
     * 6. Lưu Images
     * 
     * @param requestDTO ProductCreateRequestDTO chứa đầy đủ thông tin
     * @return ProductDetailDTO với đầy đủ thông tin đã được lưu
     * @throws ResourceAlreadyExistsException Nếu SKU hoặc slug đã tồn tại
     * @throws ResourceNotFoundException Nếu brand, category, concentration không tồn tại
     */
    public ProductDetailDTO createProduct(ProductCreateRequestDTO requestDTO) {
        log.info("Bắt đầu tạo Product: {}", requestDTO.getName());

        // 1. Validate và load Brand
        Brand brand = brandRepository.findById(requestDTO.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", requestDTO.getBrandId()));

        // 2. Validate SKUs - Kiểm tra trùng SKU trước khi tạo
        validateSkus(requestDTO.getVariants());

        // 3. Tạo Product entity
        Product product = Product.builder()
                .name(requestDTO.getName())
                .brand(brand)
                .status(Product.Status.valueOf(requestDTO.getStatus().toUpperCase()))
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Đã tạo Product với ID: {}", savedProduct.getId());

        // 4. Tạo Variants với slug tự động và sync attributes
        for (ProductCreateRequestDTO.ProductVariantCreateDTO variantDTO : requestDTO.getVariants()) {
            createVariantWithAttributes(savedProduct, variantDTO);
        }

        // 5. Lưu Images nếu có
        if (requestDTO.getImages() != null && !requestDTO.getImages().isEmpty()) {
            persistImages(savedProduct, requestDTO.getImages());
        }

        // 6. Load lại Product với đầy đủ relationships và trả về DTO
        return productMapper.toDetailDTO(
                productRepository.findByIdWithDetails(savedProduct.getId())
                        .orElse(savedProduct)
        );
    }

    /**
     * Tạo Variant với slug tự động và sync attributes vào EAV + JSONB.
     * 
     * @param product Product entity
     * @param variantDTO Variant DTO từ request
     */
    private void createVariantWithAttributes(
            Product product,
            ProductCreateRequestDTO.ProductVariantCreateDTO variantDTO
    ) {
        log.debug("Tạo Variant: SKU={}, Name={}", variantDTO.getSku(), variantDTO.getVariantName());

        // 1. Generate slug tự động từ variant name
        String slug = generateUniqueSlug(variantDTO.getVariantName());

        // 2. Load Category và Concentration nếu có
        Category category = null;
        if (variantDTO.getCategoryId() != null) {
            category = categoryRepository.findById(variantDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", variantDTO.getCategoryId()));
        }

        Concentration concentration = null;
        if (variantDTO.getConcentrationId() != null) {
            concentration = concentrationRepository.findById(variantDTO.getConcentrationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Concentration", variantDTO.getConcentrationId()));
        }

        // 3. Tạo ProductVariant entity
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(variantDTO.getSku())
                .variantName(variantDTO.getVariantName())
                .slug(slug)
                .price(variantDTO.getPrice())
                .salePrice(variantDTO.getSalePrice())
                .stockQuantity(variantDTO.getStockQuantity() != null ? variantDTO.getStockQuantity() : 0)
                .category(category)
                .concentration(concentration)
                .barcode(variantDTO.getBarcode())
                .currencyCode(variantDTO.getCurrencyCode())
                .lowStockThreshold(variantDTO.getLowStockThreshold())
                .isDefault(variantDTO.getIsDefault() != null ? variantDTO.getIsDefault() : false)
                .status(variantDTO.getStatus() != null
                        ? ProductVariant.Status.valueOf(variantDTO.getStatus().toUpperCase())
                        : ProductVariant.Status.ACTIVE)
                .displayOrder(variantDTO.getDisplayOrder())
                .cachedAttributes(new HashMap<>()) // Khởi tạo empty, sẽ được sync sau
                .build();

        // 4. Lưu Variant trước (cần ID để tạo ProductAttributeValue)
        ProductVariant savedVariant = variantRepository.save(variant);
        log.debug("Đã tạo Variant với ID: {}", savedVariant.getId());

        // 5. Sync Attributes vào EAV và JSONB
        if (variantDTO.getAttributeValues() != null && !variantDTO.getAttributeValues().isEmpty()) {
            syncAttributesToEAVAndJSONB(savedVariant, variantDTO.getAttributeValues());
        }
    }

    /**
     * Generate slug tự động từ tên và đảm bảo unique.
     * 
     * Logic:
     * 1. Tạo slug từ tên bằng slugify
     * 2. Kiểm tra xem slug đã tồn tại chưa
     * 3. Nếu tồn tại, thêm số đếm vào cuối (ví dụ: "product-name-2")
     * 
     * @param name Tên để tạo slug
     * @return Slug unique
     */
    private String generateUniqueSlug(String name) {
        String baseSlug = slugify.slugify(name);
        String slug = baseSlug;
        int counter = 1;

        // Kiểm tra và tạo slug unique
        while (variantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        log.debug("Generated unique slug: {} from name: {}", slug, name);
        return slug;
    }

    /**
     * Đồng bộ Attributes vào cả EAV (product_attributes) và JSONB (cached_attributes).
     * 
     * Logic:
     * 1. Lưu vào bảng product_attributes (EAV) - Source of Truth
     * 2. Convert thành Map<String, Object> và lưu vào cached_attributes (JSONB) - Performance Layer
     * 
     * Structure của cached_attributes:
     * {
     *   "attribute_key": {
     *     "value": "...",
     *     "display": "...",
     *     "type": "...",
     *     "dataType": "...",
     *     "numericValue": ...
     *   }
     * }
     * 
     * @param variant ProductVariant entity
     * @param attributeValueDTOs Danh sách attribute values từ DTO
     */
    private void syncAttributesToEAVAndJSONB(
            ProductVariant variant,
            List<ProductAttributeValueDTO> attributeValueDTOs
    ) {
        log.debug("Bắt đầu sync attributes cho Variant ID: {}", variant.getId());

        Map<String, Object> cachedAttributesMap = new HashMap<>();

        for (ProductAttributeValueDTO attrDTO : attributeValueDTOs) {
            // 1. Load ProductAttribute và AttributeValue
            ProductAttribute attribute = attributeRepository.findById(attrDTO.getAttributeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductAttribute", attrDTO.getAttributeId()));

            AttributeValue attributeValue = null;
            if (attrDTO.getAttributeValueId() != null) {
                attributeValue = attributeValueRepository.findById(attrDTO.getAttributeValueId())
                        .orElseThrow(() -> new ResourceNotFoundException("AttributeValue", attrDTO.getAttributeValueId()));
            }

            // 2. Tạo ProductAttributeValue entity (EAV)
            ProductAttributeValue productAttributeValue = ProductAttributeValue.builder()
                    .product(variant.getProduct())
                    .productVariant(variant)
                    .attribute(attribute)
                    .attributeValue(attributeValue)
                    .customValue(attrDTO.getCustomValue())
                    .numericValue(attrDTO.getNumericValue())
                    .displayOrder(attrDTO.getDisplayOrder() != null ? attrDTO.getDisplayOrder() : 0)
                    .primary(attrDTO.getPrimary() != null ? attrDTO.getPrimary() : false)
                    .scope(ProductAttributeValue.Scope.VARIANT) // Attributes cho variant
                    .build();

            productAttributeValueRepository.save(productAttributeValue);

            // 3. Build JSONB structure cho cached_attributes
            Map<String, Object> attributeData = new HashMap<>();
            
            // Value: Lấy từ attributeValue hoặc customValue
            if (attributeValue != null) {
                attributeData.put("value", attributeValue.getValue());
                attributeData.put("display", attributeValue.getDisplayValue());
            } else if (attrDTO.getCustomValue() != null) {
                attributeData.put("value", attrDTO.getCustomValue());
                attributeData.put("display", attrDTO.getCustomValue());
            }

            // Type và DataType
            attributeData.put("type", attribute.getAttributeType().name());
            attributeData.put("dataType", attribute.getDataType().name());

            // NumericValue nếu có
            if (attrDTO.getNumericValue() != null) {
                attributeData.put("numericValue", attrDTO.getNumericValue());
            }

            // Lưu vào cachedAttributesMap với key là attributeKey
            cachedAttributesMap.put(attribute.getAttributeKey(), attributeData);
        }

        // 4. Update cached_attributes (JSONB) của variant
        variant.setCachedAttributes(cachedAttributesMap);
        variantRepository.save(variant);

        log.debug("Đã sync {} attributes cho Variant ID: {}", attributeValueDTOs.size(), variant.getId());
    }

    /**
     * Validate SKUs - Kiểm tra trùng SKU trước khi tạo.
     * 
     * @param variants Danh sách variants cần validate
     * @throws ResourceAlreadyExistsException Nếu có SKU trùng
     */
    private void validateSkus(List<ProductCreateRequestDTO.ProductVariantCreateDTO> variants) {
        for (ProductCreateRequestDTO.ProductVariantCreateDTO variant : variants) {
            if (variantRepository.existsBySku(variant.getSku())) {
                throw new ResourceAlreadyExistsException("ProductVariant", "SKU", variant.getSku());
            }
        }
    }

    /**
     * Lưu Images cho Product.
     * 
     * @param product Product entity
     * @param images Danh sách images từ DTO
     */
    private void persistImages(Product product, List<ProductImageDTO> images) {
        if (images == null || images.isEmpty()) {
            return;
        }

        for (ProductImageDTO imageDTO : images) {
            ProductImage image = productImageMapper.toEntity(imageDTO);
            image.setProduct(product);

            // Link image với variant nếu có
            if (imageDTO.getProductVariantId() != null) {
                ProductVariant variant = variantRepository.findById(imageDTO.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", imageDTO.getProductVariantId()));
                image.setProductVariant(variant);
            }

            imageRepository.save(image);
        }

        log.debug("Đã lưu {} images cho Product ID: {}", images.size(), product.getId());
    }

    /**
     * Cập nhật Product với đầy đủ thông tin.
     * 
     * Logic:
     * 1. Load Product hiện tại
     * 2. Update Product entity
     * 3. Update/Create/Delete Variants
     * 4. Update Images
     * 
     * @param productId ID của Product cần update
     * @param requestDTO ProductUpdateRequestDTO
     * @return ProductDetailDTO đã được update
     */
    public ProductDetailDTO updateProduct(Long productId, ProductUpdateRequestDTO requestDTO) {
        log.info("Bắt đầu cập nhật Product ID: {}", productId);

        // 1. Load Product hiện tại
        Product product = productRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        // 2. Validate và load Brand
        Brand brand = brandRepository.findById(requestDTO.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", requestDTO.getBrandId()));

        // 3. Update Product entity
        product.setName(requestDTO.getName());
        product.setBrand(brand);
        if (requestDTO.getStatus() != null) {
            product.setStatus(Product.Status.valueOf(requestDTO.getStatus().toUpperCase()));
        }

        Product savedProduct = productRepository.save(product);

        // 4. Update Variants
        // TODO: Implement logic để update variants (có thể cần xóa variants cũ và tạo mới, hoặc update từng variant)
        // Hiện tại đơn giản hóa: xóa tất cả variants cũ và tạo mới
        product.getVariants().clear();
        for (ProductUpdateRequestDTO.ProductVariantUpdateDTO variantDTO : requestDTO.getVariants()) {
            createVariantWithAttributes(savedProduct, convertToCreateDTO(variantDTO));
        }

        // 5. Update Images
        // TODO: Implement logic để update images (có thể cần xóa images cũ và tạo mới)
        product.getImages().clear();
        if (requestDTO.getImages() != null && !requestDTO.getImages().isEmpty()) {
            persistImages(savedProduct, requestDTO.getImages());
        }

        // 6. Load lại và trả về
        return productMapper.toDetailDTO(
                productRepository.findByIdWithDetails(savedProduct.getId())
                        .orElse(savedProduct)
        );
    }

    /**
     * Xóa mềm Product (đổi status sang ARCHIVED).
     * 
     * @param productId ID của Product cần xóa
     */
    public void deleteProduct(Long productId) {
        log.info("Bắt đầu xóa mềm Product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        product.setStatus(Product.Status.ARCHIVED);
        product.setArchivedAt(java.time.LocalDateTime.now());
        productRepository.save(product);

        log.info("Đã xóa mềm Product ID: {}", productId);
    }

    /**
     * Helper method để convert ProductVariantUpdateDTO sang ProductVariantCreateDTO.
     */
    private ProductCreateRequestDTO.ProductVariantCreateDTO convertToCreateDTO(
            ProductUpdateRequestDTO.ProductVariantUpdateDTO updateDTO
    ) {
        return ProductCreateRequestDTO.ProductVariantCreateDTO.builder()
                .sku(updateDTO.getSku())
                .variantName(updateDTO.getVariantName())
                .price(updateDTO.getPrice())
                .salePrice(updateDTO.getSalePrice())
                .stockQuantity(updateDTO.getStockQuantity())
                .categoryId(updateDTO.getCategoryId())
                .concentrationId(updateDTO.getConcentrationId())
                .attributeValues(updateDTO.getAttributeValues())
                .barcode(updateDTO.getBarcode())
                .currencyCode(updateDTO.getCurrencyCode())
                .lowStockThreshold(updateDTO.getLowStockThreshold())
                .isDefault(updateDTO.getIsDefault())
                .status(updateDTO.getStatus())
                .displayOrder(updateDTO.getDisplayOrder())
                .build();
    }
}

