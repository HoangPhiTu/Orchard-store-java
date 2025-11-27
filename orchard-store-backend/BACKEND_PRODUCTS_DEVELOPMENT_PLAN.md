# 🔧 Backend Products Management - Kế hoạch phát triển

> **Module**: Products Management Backend  
> **Status**: Planning  
> **Priority**: High  
> **Estimated Time**: 2-3 weeks

---

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Phân tích hiện trạng](#2-phân-tích-hiện-trạng)
3. [Kế hoạch từng bước](#3-kế-hoạch-từng-bước)
4. [Chi tiết implementation](#4-chi-tiết-implementation)
5. [Testing Strategy](#5-testing-strategy)
6. [API Documentation](#6-api-documentation)

---

## 1. Tổng quan

### 1.1. Mục tiêu

Phát triển đầy đủ backend APIs cho Products Management module, bao gồm:

- Products CRUD với filters, search, pagination
- Product Variants CRUD
- Product Images management
- Product Attributes management
- Product Specifications management
- Stock management per warehouse
- Bulk operations

### 1.2. Tech Stack

- **Framework**: Spring Boot 3.5.7
- **Java**: 21
- **Database**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA + Hibernate
- **Validation**: Jakarta Validation
- **Mapping**: MapStruct
- **JSONB Support**: Hypersistence Utils

---

## 2. Phân tích hiện trạng

### 2.1. Đã có sẵn ✅

#### Entities

- ✅ `Product.java` - Product entity với relationships
- ✅ `ProductVariant.java` - Variant entity với JSONB cached_attributes
- ✅ `ProductImage.java` - Image entity
- ✅ `ProductSpecification.java` - Specification entity
- ✅ `ProductAttribute.java` - Attribute entity (trong attribute module)

#### DTOs

- ✅ `ProductCreateRequestDTO.java` - Create request với variants, images
- ✅ `ProductUpdateRequestDTO.java` - Update request
- ✅ `ProductDetailDTO.java` - Full product detail response
- ✅ `ProductDTO.java` - Basic product info
- ✅ `ProductVariantDTO.java` - Variant DTO
- ✅ `ProductImageDTO.java` - Image DTO

#### Controllers

- ✅ `ProductAdminController.java` - Có create, update, delete
- ⚠️ **Thiếu**: List products với filters
- ⚠️ **Thiếu**: Get single product detail
- ⚠️ **Thiếu**: Variants CRUD endpoints riêng
- ⚠️ **Thiếu**: Images CRUD endpoints riêng
- ⚠️ **Thiếu**: Specifications CRUD endpoints riêng
- ⚠️ **Thiếu**: Stock management endpoints
- ⚠️ **Thiếu**: Bulk operations

#### Services

- ✅ `ProductAdminService.java` - Có create, update, delete logic
- ⚠️ **Thiếu**: List với filters logic
- ⚠️ **Thiếu**: Variants management methods
- ⚠️ **Thiếu**: Images management methods
- ⚠️ **Thiếu**: Specifications management methods
- ⚠️ **Thiếu**: Stock management methods

#### Repositories

- ✅ `ProductRepository.java` - Có JpaSpecificationExecutor
- ✅ `ProductVariantRepository.java`
- ✅ `ProductImageRepository.java`
- ⚠️ **Cần**: Custom query methods cho filters

### 2.2. Cần phát triển ❌

#### Controllers

- ❌ List products endpoint với filters
- ❌ Get product detail endpoint
- ❌ Variants CRUD endpoints
- ❌ Images CRUD endpoints
- ❌ Specifications CRUD endpoints
- ❌ Stock management endpoints
- ❌ Bulk operations endpoints

#### Services

- ❌ List products với filters logic
- ❌ Variants CRUD methods
- ❌ Images CRUD methods
- ❌ Specifications CRUD methods
- ❌ Stock management methods
- ❌ Bulk operations methods

#### DTOs

- ❌ `ProductListResponseDTO.java` - Response cho list
- ❌ `ProductFilterDTO.java` - Filter parameters (có thể đã có, cần check)
- ❌ `VariantCreateRequestDTO.java` - Create variant request
- ❌ `VariantUpdateRequestDTO.java` - Update variant request
- ❌ `ImageCreateRequestDTO.java` - Create image request
- ❌ `ImageUpdateRequestDTO.java` - Update image request
- ❌ `SpecificationCreateRequestDTO.java` - Create specification request
- ❌ `SpecificationUpdateRequestDTO.java` - Update specification request
- ❌ `StockUpdateRequestDTO.java` - Update stock request
- ❌ `BulkStatusUpdateRequestDTO.java` - Bulk status update request
- ❌ `BulkDeleteRequestDTO.java` - Bulk delete request

#### Specifications (JPA)

- ❌ `ProductSpecification.java` - JPA Specification cho dynamic queries

---

## 3. Kế hoạch từng bước

### Phase 1: Products List & Detail (Week 1 - Days 1-3)

#### Day 1: DTOs & Specifications

- [ ] **Task 1.1**: Tạo `ProductListResponseDTO.java`
- [ ] **Task 1.2**: Tạo/Update `ProductFilterDTO.java`
- [ ] **Task 1.3**: Tạo `ProductSpecification.java` (JPA Specification)
- [ ] **Task 1.4**: Test specifications với các filters

#### Day 2: Service Methods

- [ ] **Task 2.1**: Implement `getProducts(ProductFilterDTO)` trong `ProductAdminService`
- [ ] **Task 2.2**: Implement `getProductDetail(Long id)` trong `ProductAdminService`
- [ ] **Task 2.3**: Add pagination support
- [ ] **Task 2.4**: Add sorting support
- [ ] **Task 2.5**: Test service methods

#### Day 3: Controller Endpoints

- [ ] **Task 3.1**: Add `GET /api/admin/products` endpoint
- [ ] **Task 3.2**: Add `GET /api/admin/products/{id}` endpoint
- [ ] **Task 3.3**: Test endpoints với Postman/curl
- [ ] **Task 3.4**: Add error handling

### Phase 2: Variants Management (Week 1 - Days 4-5)

#### Day 4: Variants DTOs & Service

- [ ] **Task 4.1**: Tạo `VariantCreateRequestDTO.java`
- [ ] **Task 4.2**: Tạo `VariantUpdateRequestDTO.java`
- [ ] **Task 4.3**: Implement `createVariant(Long productId, VariantCreateRequestDTO)` trong service
- [ ] **Task 4.4**: Implement `updateVariant(Long productId, Long variantId, VariantUpdateRequestDTO)` trong service
- [ ] **Task 4.5**: Implement `deleteVariant(Long productId, Long variantId)` trong service
- [ ] **Task 4.6**: Implement `setDefaultVariant(Long productId, Long variantId)` trong service
- [ ] **Task 4.7**: Test service methods

#### Day 5: Variants Controller

- [ ] **Task 5.1**: Add `GET /api/admin/products/{productId}/variants` endpoint
- [ ] **Task 5.2**: Add `POST /api/admin/products/{productId}/variants` endpoint
- [ ] **Task 5.3**: Add `PUT /api/admin/products/{productId}/variants/{variantId}` endpoint
- [ ] **Task 5.4**: Add `DELETE /api/admin/products/{productId}/variants/{variantId}` endpoint
- [ ] **Task 5.5**: Add `PATCH /api/admin/products/{productId}/variants/{variantId}/set-default` endpoint
- [ ] **Task 5.6**: Test all endpoints

### Phase 3: Images Management (Week 2 - Days 1-2)

#### Day 1: Images Service

- [ ] **Task 6.1**: Tạo `ImageCreateRequestDTO.java`
- [ ] **Task 6.2**: Tạo `ImageUpdateRequestDTO.java`
- [ ] **Task 6.3**: Implement `getImages(Long productId, Long variantId?)` trong service
- [ ] **Task 6.4**: Implement `uploadImage(Long productId, MultipartFile, ImageCreateRequestDTO)` trong service
- [ ] **Task 6.5**: Implement `updateImage(Long productId, Long imageId, ImageUpdateRequestDTO)` trong service
- [ ] **Task 6.6**: Implement `deleteImage(Long productId, Long imageId)` trong service
- [ ] **Task 6.7**: Implement `reorderImages(Long productId, List<Long> imageIds)` trong service
- [ ] **Task 6.8**: Implement `setPrimaryImage(Long productId, Long imageId)` trong service
- [ ] **Task 6.9**: Test service methods

#### Day 2: Images Controller

- [ ] **Task 7.1**: Add `GET /api/admin/products/{productId}/images` endpoint
- [ ] **Task 7.2**: Add `POST /api/admin/products/{productId}/images` endpoint (multipart/form-data)
- [ ] **Task 7.3**: Add `PUT /api/admin/products/{productId}/images/{imageId}` endpoint
- [ ] **Task 7.4**: Add `DELETE /api/admin/products/{productId}/images/{imageId}` endpoint
- [ ] **Task 7.5**: Add `PATCH /api/admin/products/{productId}/images/reorder` endpoint
- [ ] **Task 7.6**: Add `PATCH /api/admin/products/{productId}/images/{imageId}/set-primary` endpoint
- [ ] **Task 7.7**: Test all endpoints

### Phase 4: Specifications Management (Week 2 - Days 3-4)

#### Day 3: Specifications Service

- [ ] **Task 8.1**: Tạo `SpecificationCreateRequestDTO.java`
- [ ] **Task 8.2**: Tạo `SpecificationUpdateRequestDTO.java`
- [ ] **Task 8.3**: Implement `getSpecifications(Long productId)` trong service
- [ ] **Task 8.4**: Implement `createSpecification(Long productId, SpecificationCreateRequestDTO)` trong service
- [ ] **Task 8.5**: Implement `updateSpecification(Long productId, Long specId, SpecificationUpdateRequestDTO)` trong service
- [ ] **Task 8.6**: Implement `deleteSpecification(Long productId, Long specId)` trong service
- [ ] **Task 8.7**: Implement `reorderSpecifications(Long productId, List<Long> specIds)` trong service
- [ ] **Task 8.8**: Test service methods

#### Day 4: Specifications Controller

- [ ] **Task 9.1**: Add `GET /api/admin/products/{productId}/specifications` endpoint
- [ ] **Task 9.2**: Add `POST /api/admin/products/{productId}/specifications` endpoint
- [ ] **Task 9.3**: Add `PUT /api/admin/products/{productId}/specifications/{specId}` endpoint
- [ ] **Task 9.4**: Add `DELETE /api/admin/products/{productId}/specifications/{specId}` endpoint
- [ ] **Task 9.5**: Add `PATCH /api/admin/products/{productId}/specifications/reorder` endpoint
- [ ] **Task 9.6**: Test all endpoints

### Phase 5: Stock Management với Inventory Transactions (Week 2 - Day 5)

#### Day 5: Stock Service & Controller với Transaction Model

- [ ] **Task 10.1**: Review/Update `InventoryTransaction` entity (nếu cần)
- [ ] **Task 10.2**: Tạo `InventoryTransactionRequestDTO.java` cho request
- [ ] **Task 10.3**: Tạo `StockHistoryResponseDTO.java` cho response
- [ ] **Task 10.4**: Implement `getStock(Long productId, Long variantId)` trong service
- [ ] **Task 10.5**: Implement `updateStock(Long productId, Long variantId, InventoryTransactionRequestDTO)` - Transaction model
- [ ] **Task 10.6**: Implement `getStockHistory(Long productId, Long variantId, Pageable)` trong service
- [ ] **Task 10.7**: Add `GET /api/admin/products/{productId}/variants/{variantId}/stock` endpoint
- [ ] **Task 10.8**: Add `POST /api/admin/products/{productId}/variants/{variantId}/stock` endpoint (transaction)
- [ ] **Task 10.9**: Add `GET /api/admin/products/{productId}/variants/{variantId}/stock-history` endpoint
- [ ] **Task 10.10**: Test endpoints với transaction model

### Phase 6: Bulk Operations (Week 3 - Days 1-2)

#### Day 1: Bulk Operations Service

- [ ] **Task 11.1**: Tạo `BulkStatusUpdateRequestDTO.java`
- [ ] **Task 11.2**: Tạo `BulkDeleteRequestDTO.java`
- [ ] **Task 11.3**: Implement `bulkUpdateStatus(List<Long> productIds, String status)` trong service
- [ ] **Task 11.4**: Implement `bulkDelete(List<Long> productIds)` trong service
- [ ] **Task 11.5**: Test service methods

#### Day 2: Bulk Operations Controller

- [ ] **Task 12.1**: Add `POST /api/admin/products/bulk-status` endpoint
- [ ] **Task 12.2**: Add `POST /api/admin/products/bulk-delete` endpoint
- [ ] **Task 12.3**: Test endpoints

### Phase 7: Business Logic Refinements (Week 3 - Days 1-2)

#### Day 1: Slug Generation & Image Cleanup

- [ ] **Task 18.1**: Enhance `generateUniqueSlug()` - Product name + Variant name
- [ ] **Task 18.2**: Add slug uniqueness check với suffix counter
- [ ] **Task 18.3**: Implement `deleteImage()` với physical file cleanup
- [ ] **Task 18.4**: Implement `deleteProduct()` với image cleanup
- [ ] **Task 18.5**: Test slug generation với duplicate names
- [ ] **Task 18.6**: Test image cleanup khi delete

#### Day 2: Attribute vs Specification Clarification

- [ ] **Task 19.1**: Update code comments để phân biệt Attribute vs Specification
- [ ] **Task 19.2**: Update DTOs documentation
- [ ] **Task 19.3**: Add validation rules cho Attributes (dùng để tạo variants)
- [ ] **Task 19.4**: Add validation rules cho Specifications (chỉ hiển thị)

### Phase 8: Performance Optimization & Concurrency (Week 3 - Days 3-4)

#### Day 1: Fix N+1 Query Problem

- [ ] **Task 16.1**: Update ProductRepository với @EntityGraph cho findAll
- [ ] **Task 16.2**: Fix ProductSpecification với query.distinct(true)
- [ ] **Task 16.3**: Update ProductListResponseDTO mapper để tránh lazy loading
- [ ] **Task 16.4**: Test performance với large dataset
- [ ] **Task 16.5**: Verify không còn N+1 queries

#### Day 4: Optimistic Locking

- [ ] **Task 17.1**: Thêm @Version field vào Product entity
- [ ] **Task 17.2**: Thêm @Version field vào ProductVariant entity
- [ ] **Task 17.3**: Update ProductUpdateRequestDTO để include version
- [ ] **Task 17.4**: Update VariantUpdateRequestDTO để include version
- [ ] **Task 17.5**: Handle OptimisticLockingFailureException trong service
- [ ] **Task 17.6**: Test concurrent updates scenario

### Phase 9: Testing & Documentation (Week 3 - Days 5-7)

#### Day 5: Unit Tests

- [ ] **Task 13.1**: Unit tests cho ProductAdminService
- [ ] **Task 13.2**: Unit tests cho ProductSpecification
- [ ] **Task 13.3**: Unit tests cho DTOs validation
- [ ] **Task 13.4**: Unit tests cho Optimistic Locking

#### Day 6: Integration Tests

- [ ] **Task 14.1**: Integration tests cho Products endpoints
- [ ] **Task 14.2**: Integration tests cho Variants endpoints
- [ ] **Task 14.3**: Integration tests cho Images endpoints
- [ ] **Task 14.4**: Integration tests cho Specifications endpoints
- [ ] **Task 14.5**: Integration tests cho Stock endpoints
- [ ] **Task 14.6**: Integration tests cho Bulk operations
- [ ] **Task 14.7**: Performance tests (N+1 query verification)

#### Day 7: Documentation & Cleanup

- [ ] **Task 15.1**: Update API documentation
- [ ] **Task 15.2**: Code review & cleanup
- [ ] **Task 15.3**: Performance optimization review
- [ ] **Task 15.4**: Final testing

---

## 4. Chi tiết implementation

### 4.1. Phase 1: Products List & Detail

#### Task 1.1: Tạo ProductListResponseDTO.java

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/ProductListResponseDTO.java`

```java
package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho response của Products List
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponseDTO {
    private Long id;
    private String name;
    private Long brandId;
    private String brandName;
    private String status;
    private String primaryImageUrl;
    private Integer variantCount;
    private Integer totalStock;
    private String stockStatus; // IN_STOCK, OUT_OF_STOCK, LOW_STOCK
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Task 1.2: Tạo/Update ProductFilterDTO.java

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/ProductFilterDTO.java`

```java
package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho filter parameters của Products List
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterDTO {
    private String keyword; // Search name, SKU
    private String status; // DRAFT, PUBLISHED, ARCHIVED
    private Long brandId;
    private Long categoryId; // Filter by variant category
    private String stockStatus; // IN_STOCK, OUT_OF_STOCK, LOW_STOCK
    private String sortBy; // name, createdAt, price, stock
    private String direction; // ASC, DESC
    private Integer page; // 0-based
    private Integer size; // Default 20
}
```

#### Task 1.3: Tạo ProductSpecification.java (JPA Specification)

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/specification/ProductSpecification.java`

```java
package com.orchard.orchard_store_backend.modules.catalog.product.specification;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductFilterDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> buildSpecification(ProductFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search (name)
            if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
                String keyword = "%" + filter.getKeyword().toLowerCase() + "%";
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("name")), keyword),
                        cb.like(cb.lower(root.join("variants").get("sku")), keyword)
                    )
                );
            }

            // Status filter
            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), Product.Status.valueOf(filter.getStatus())));
            }

            // Brand filter
            if (filter.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.getBrandId()));
            }

            // Category filter (via variants)
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.join("variants").get("category").get("id"), filter.getCategoryId()));
            }

            // Stock status filter (via variants)
            if (filter.getStockStatus() != null && !filter.getStockStatus().isEmpty()) {
                Join<?, ?> variantJoin = root.join("variants");
                predicates.add(cb.equal(variantJoin.get("stockStatus"), filter.getStockStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

#### Task 2.1: Implement getProducts() trong ProductAdminService

```java
public Page<ProductListResponseDTO> getProducts(ProductFilterDTO filter) {
    // Build specification
    Specification<Product> spec = ProductSpecification.buildSpecification(filter);

    // Build pageable
    Sort sort = buildSort(filter.getSortBy(), filter.getDirection());
    Pageable pageable = PageRequest.of(
        filter.getPage() != null ? filter.getPage() : 0,
        filter.getSize() != null ? filter.getSize() : 20,
        sort
    );

    // Query with specification
    Page<Product> products = productRepository.findAll(spec, pageable);

    // Map to DTOs
    return products.map(this::mapToProductListResponseDTO);
}

private ProductListResponseDTO mapToProductListResponseDTO(Product product) {
    // Calculate variant count, total stock, stock status
    int variantCount = product.getVariants().size();
    int totalStock = product.getVariants().stream()
        .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
        .sum();
    String stockStatus = calculateStockStatus(product.getVariants());
    String primaryImageUrl = product.getImages().stream()
        .filter(ProductImage::getIsPrimary)
        .findFirst()
        .map(ProductImage::getImageUrl)
        .orElse(null);

    return ProductListResponseDTO.builder()
        .id(product.getId())
        .name(product.getName())
        .brandId(product.getBrand().getId())
        .brandName(product.getBrand().getName())
        .status(product.getStatus().name())
        .primaryImageUrl(primaryImageUrl)
        .variantCount(variantCount)
        .totalStock(totalStock)
        .stockStatus(stockStatus)
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .build();
}
```

#### Task 3.1: Add GET /api/admin/products endpoint

```java
@GetMapping
public ResponseEntity<ApiResponse<Page<ProductListResponseDTO>>> getProducts(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long brandId,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String stockStatus,
        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
        @RequestParam(required = false, defaultValue = "DESC") String direction,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "20") Integer size
) {
    ProductFilterDTO filter = ProductFilterDTO.builder()
        .keyword(keyword)
        .status(status)
        .brandId(brandId)
        .categoryId(categoryId)
        .stockStatus(stockStatus)
        .sortBy(sortBy)
        .direction(direction)
        .page(page)
        .size(size)
        .build();

    Page<ProductListResponseDTO> products = productAdminService.getProducts(filter);

    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));
}
```

### 4.2. Phase 2: Variants Management

#### Task 4.1: Tạo VariantCreateRequestDTO.java

```java
package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantCreateRequestDTO {

    @NotBlank(message = "SKU không được để trống")
    @Size(min = 3, max = 100, message = "SKU phải từ 3 đến 100 ký tự")
    private String sku;

    @NotBlank(message = "Tên variant không được để trống")
    @Size(max = 255, message = "Tên variant không được vượt quá 255 ký tự")
    private String variantName;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    private BigDecimal salePrice;
    private BigDecimal costPrice;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private Integer stockQuantity;

    private Long categoryId;
    private Long concentrationId;
    private Long taxClassId;
    private String currencyCode;
    private Integer lowStockThreshold;
    private Boolean isDefault;
    private String status;
    private Integer displayOrder;

    // Additional fields
    private String barcode;
    private String shortDescription;
    private String fullDescription;
    private String metaTitle;
    private String metaDescription;
    private BigDecimal weightGrams;
    private String weightUnit;
    private Integer volumeMl;
    private String volumeUnit;
    private Boolean manageInventory;
    private Boolean allowBackorder;
    private Boolean allowOutOfStockPurchase;
    private LocalDateTime availableFrom;
    private LocalDateTime availableTo;
}
```

#### Task 4.3: Implement createVariant() trong ProductAdminService

```java
public ProductVariantDTO createVariant(Long productId, VariantCreateRequestDTO requestDTO) {
    // Load product
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

    // Validate SKU unique
    if (variantRepository.existsBySku(requestDTO.getSku())) {
        throw new ResourceAlreadyExistsException("Variant với SKU", requestDTO.getSku());
    }

    // Generate slug
    String slug = slugify.slugify(requestDTO.getVariantName());

    // Build variant entity
    ProductVariant variant = ProductVariant.builder()
        .product(product)
        .variantName(requestDTO.getVariantName())
        .sku(requestDTO.getSku())
        .slug(slug)
        .price(requestDTO.getPrice())
        .salePrice(requestDTO.getSalePrice())
        .costPrice(requestDTO.getCostPrice())
        .stockQuantity(requestDTO.getStockQuantity() != null ? requestDTO.getStockQuantity() : 0)
        .status(requestDTO.getStatus() != null ?
            ProductVariant.Status.valueOf(requestDTO.getStatus()) :
            ProductVariant.Status.ACTIVE)
        .isDefault(requestDTO.getIsDefault() != null ? requestDTO.getIsDefault() : false)
        // ... set other fields
        .build();

    // If this is default, unset other defaults
    if (variant.getIsDefault()) {
        product.getVariants().forEach(v -> v.setIsDefault(false));
    }

    // Set category if provided
    if (requestDTO.getCategoryId() != null) {
        Category category = categoryRepository.findById(requestDTO.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", requestDTO.getCategoryId()));
        variant.setCategory(category);
    }

    // Save variant
    variant = variantRepository.save(variant);

    // Map to DTO
    return productVariantMapper.toDTO(variant);
}
```

### 4.3. Phase 3: Images Management

#### Task 6.4: Implement uploadImage() trong ProductAdminService

```java
public ProductImageDTO uploadImage(
    Long productId,
    MultipartFile file,
    ImageCreateRequestDTO requestDTO
) {
    // Load product
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

    // Validate and upload image
    imageUploadService.validateImage(file);
    String imageUrl = imageUploadService.uploadImage(file, "products");
    String thumbnailUrl = imageUploadService.generateThumbnail(imageUrl); // Optional

    // Build image entity
    ProductImage image = ProductImage.builder()
        .product(product)
        .imageUrl(imageUrl)
        .thumbnailUrl(thumbnailUrl)
        .altText(requestDTO.getAltText())
        .isPrimary(requestDTO.getIsPrimary() != null ? requestDTO.getIsPrimary() : false)
        .displayOrder(requestDTO.getDisplayOrder() != null ? requestDTO.getDisplayOrder() : 0)
        .imageType(requestDTO.getImageType() != null ? requestDTO.getImageType() : "GALLERY")
        .build();

    // If this is primary, unset other primaries
    if (image.getIsPrimary()) {
        product.getImages().forEach(img -> img.setIsPrimary(false));
    }

    // Set variant if provided
    if (requestDTO.getVariantId() != null) {
        ProductVariant variant = variantRepository.findById(requestDTO.getVariantId())
            .orElseThrow(() -> new ResourceNotFoundException("Variant", requestDTO.getVariantId()));
        image.setProductVariant(variant);
    }

    // Save image
    image = imageRepository.save(image);

    // Map to DTO
    return productImageMapper.toDTO(image);
}
```

### 4.4. Phase 4: Specifications Management

#### Task 8.4: Implement createSpecification() trong ProductAdminService

```java
public ProductSpecificationDTO createSpecification(
    Long productId,
    SpecificationCreateRequestDTO requestDTO
) {
    // Load product
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

    // Build specification entity
    ProductSpecification spec = ProductSpecification.builder()
        .product(product)
        .specificationKey(requestDTO.getKey())
        .specificationValue(requestDTO.getValue())
        .displayOrder(requestDTO.getDisplayOrder() != null ?
            requestDTO.getDisplayOrder() :
            getNextDisplayOrder(productId))
        .build();

    // Save specification
    spec = specificationRepository.save(spec);

    // Map to DTO
    return mapToSpecificationDTO(spec);
}
```

### 4.5. Phase 5: Stock Management với Inventory Transactions

#### Task 10.1: Review/Update InventoryTransaction Entity

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/inventory/entity/InventoryTransaction.java`

**Note**: Entity đã có sẵn, cần đảm bảo có đầy đủ các fields:

- ✅ `productVariant` (ManyToOne)
- ✅ `transactionType` (Enum: IN, OUT, ADJUSTMENT, RETURN, DAMAGED, RESERVE, RELEASE)
- ✅ `quantity` (Integer - có thể âm hoặc dương)
- ✅ `referenceType` (String - ví dụ: "ORDER", "ADJUSTMENT")
- ✅ `referenceId` (Long - ví dụ: orderId)
- ✅ `stockBefore` (Integer)
- ✅ `stockAfter` (Integer)
- ✅ `notes` (String - reason)
- ✅ `createdBy` (Long)
- ✅ `createdAt` (LocalDateTime)

**Cần thêm (nếu chưa có)**:

- ⚠️ `warehouseId` (Long) - Nếu cần track theo warehouse

**Repository Methods cần có**:

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/inventory/repository/InventoryTransactionRepository.java`

**Note**: Repository đã có method `findByProductVariantIdOrderByCreatedAtDesc`, nhưng cần update để hỗ trợ pagination:

```java
package com.orchard.orchard_store_backend.modules.inventory.repository;

import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    /**
     * Find transactions by product variant ID, ordered by created date (newest first)
     * ⚠️ UPDATE: Thêm Pageable để hỗ trợ pagination
     */
    Page<InventoryTransaction> findByProductVariantIdOrderByCreatedAtDesc(
        Long productVariantId,
        Pageable pageable
    );

    /**
     * Find transactions by product variant ID and transaction type
     */
    List<InventoryTransaction> findByProductVariantIdAndTransactionType(
        Long productVariantId,
        InventoryTransaction.TransactionType transactionType
    );

    /**
     * Calculate total quantity change for a variant (sum of all transactions)
     * Useful for reconciliation - verify stock quantity matches sum of transactions
     */
    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM InventoryTransaction t WHERE t.productVariant.id = :variantId")
    Integer sumQuantityByProductVariantId(@Param("variantId") Long variantId);

    /**
     * Find transactions by reference (e.g., orderId)
     * Useful for tracking order-related transactions
     */
    List<InventoryTransaction> findByReferenceTypeAndReferenceId(
        String referenceType,
        Long referenceId
    );
}
```

#### Task 10.2: Tạo InventoryTransactionDTO.java cho Request

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/inventory/dto/InventoryTransactionRequestDTO.java`

```java
package com.orchard.orchard_store_backend.modules.inventory.dto;

import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request tạo Inventory Transaction
 *
 * Thay vì "set" số lượng, API nhận vào số lượng thay đổi (quantity change)
 * Ví dụ: quantity = 10 -> nhập thêm 10, quantity = -5 -> xuất 5
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionRequestDTO {

    /**
     * Số lượng thay đổi (có thể âm hoặc dương)
     * - Dương: Nhập kho (IMPORT, RETURN)
     * - Âm: Xuất kho (EXPORT, SALE)
     */
    @NotNull(message = "Số lượng không được để trống")
    private Integer quantity;

    /**
     * Loại giao dịch
     */
    @NotNull(message = "Loại giao dịch không được để trống")
    private TransactionType transactionType;

    /**
     * Warehouse ID (optional - nếu không có thì update tổng stock của variant)
     */
    private Long warehouseId;

    /**
     * Lý do thay đổi kho
     */
    private String reason;

    /**
     * Reference type (ví dụ: "ORDER", "ADJUSTMENT", "RETURN")
     */
    private String referenceType;

    /**
     * Reference ID (ví dụ: orderId, adjustmentId)
     */
    private Long referenceId;

    /**
     * Ghi chú thêm
     */
    private String notes;
}
```

#### Task 10.3: Tạo StockHistoryResponseDTO.java

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/inventory/dto/StockHistoryResponseDTO.java`

```java
package com.orchard.orchard_store_backend.modules.inventory.dto;

import com.orchard.orchard_store_backend.modules.inventory.entity.InventoryTransaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho response của Stock History
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockHistoryResponseDTO {
    private Long id;
    private Long productVariantId;
    private String variantName;
    private String sku;
    private TransactionType transactionType;
    private Integer quantity; // Số lượng thay đổi
    private Integer stockBefore;
    private Integer stockAfter;
    private String referenceType;
    private Long referenceId;
    private String reason;
    private String notes;
    private Long warehouseId;
    private String warehouseName;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}
```

#### Task 10.5: Implement updateStock() với Transaction Model

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
@Autowired
private InventoryTransactionRepository inventoryTransactionRepository;

@Autowired
private WarehouseRepository warehouseRepository;

/**
 * Update stock với Transaction Model
 *
 * Thay vì "set" số lượng, method này nhận vào số lượng thay đổi và tạo transaction record
 *
 * Logic:
 * 1. Load variant và warehouse (nếu có)
 * 2. Tính stockBefore (từ warehouse_stock hoặc variant.stockQuantity)
 * 3. Tính stockAfter = stockBefore + quantity (quantity có thể âm)
 * 4. Validate stockAfter >= 0
 * 5. Tạo InventoryTransaction record
 * 6. Update warehouse_stock (nếu có warehouseId) hoặc variant.stockQuantity
 * 7. Update variant stock quantity (sum of all warehouses)
 */
@Transactional
public WarehouseStockDTO updateStock(
    Long productId,
    Long variantId,
    InventoryTransactionRequestDTO requestDTO
) {
    log.info("Updating stock for variant {} with transaction: {}", variantId, requestDTO);

    // 1. Load variant
    ProductVariant variant = variantRepository.findById(variantId)
        .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

    // Validate product match
    if (!variant.getProduct().getId().equals(productId)) {
        throw new IllegalArgumentException("Variant không thuộc product này");
    }

    // 2. Get current stock
    Integer stockBefore;
    WarehouseStock warehouseStock = null;

    if (requestDTO.getWarehouseId() != null) {
        // Stock per warehouse
        warehouseStock = warehouseStockRepository
            .findByProductVariantIdAndWarehouseId(variantId, requestDTO.getWarehouseId())
            .orElse(WarehouseStock.builder()
                .productVariant(variant)
                .warehouse(warehouseRepository.findById(requestDTO.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse", requestDTO.getWarehouseId())))
                .quantity(0)
                .reservedQuantity(0)
                .build());

        stockBefore = warehouseStock.getQuantity();
    } else {
        // Total stock của variant
        stockBefore = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
    }

    // 3. Calculate stockAfter
    Integer stockAfter = stockBefore + requestDTO.getQuantity();

    // 4. Validate stockAfter >= 0
    if (stockAfter < 0) {
        throw new IllegalArgumentException(
            String.format("Số lượng sau giao dịch không thể âm. Hiện tại: %d, Thay đổi: %d",
                stockBefore, requestDTO.getQuantity())
        );
    }

    // 5. Validate reserved quantity (nếu có warehouse stock)
    if (warehouseStock != null && warehouseStock.getReservedQuantity() > stockAfter) {
        throw new IllegalArgumentException(
            String.format("Reserved quantity (%d) không thể lớn hơn quantity sau giao dịch (%d)",
                warehouseStock.getReservedQuantity(), stockAfter)
        );
    }

    // 6. Create InventoryTransaction record
    InventoryTransaction transaction = InventoryTransaction.builder()
        .productVariant(variant)
        .transactionType(requestDTO.getTransactionType())
        .quantity(requestDTO.getQuantity())
        .stockBefore(stockBefore)
        .stockAfter(stockAfter)
        .referenceType(requestDTO.getReferenceType())
        .referenceId(requestDTO.getReferenceId())
        .notes(requestDTO.getNotes())
        .createdBy(getCurrentUserId()) // Get from SecurityContext
        .build();

    transaction = inventoryTransactionRepository.save(transaction);

    // 7. Update warehouse_stock hoặc variant.stockQuantity
    if (warehouseStock != null) {
        warehouseStock.setQuantity(stockAfter);
        warehouseStock = warehouseStockRepository.save(warehouseStock);

        // Update variant stock quantity (sum of all warehouses)
        updateVariantStockQuantity(variantId);

        // Map to DTO
        return mapToWarehouseStockDTO(warehouseStock);
    } else {
        // Update variant stock quantity directly
        variant.setStockQuantity(stockAfter);
        variant = variantRepository.save(variant);

        // Map to DTO (variant level)
        return WarehouseStockDTO.builder()
            .productVariantId(variantId)
            .warehouseId(null)
            .warehouseName("Tổng kho")
            .quantity(stockAfter)
            .reservedQuantity(variant.getReservedQuantity() != null ? variant.getReservedQuantity() : 0)
            .availableQuantity(stockAfter - (variant.getReservedQuantity() != null ? variant.getReservedQuantity() : 0))
            .lastUpdatedAt(LocalDateTime.now())
            .build();
    }
}

/**
 * Update variant stock quantity từ tổng của tất cả warehouses
 */
private void updateVariantStockQuantity(Long variantId) {
    Integer totalStock = warehouseStockRepository
        .sumQuantityByProductVariantId(variantId)
        .orElse(0);

    ProductVariant variant = variantRepository.findById(variantId)
        .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));
    variant.setStockQuantity(totalStock);
    variantRepository.save(variant);
}

/**
 * Get current user ID from SecurityContext
 */
private Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
        // Get user ID from UserDetails
        // Implementation depends on your UserDetails structure
        return null; // TODO: Implement based on your auth structure
    }
    return null;
}
```

#### Task 10.6: Implement getStockHistory() trong ProductAdminService

```java
/**
 * Get stock history (lịch sử giao dịch kho) của một variant
 */
public Page<StockHistoryResponseDTO> getStockHistory(
    Long productId,
    Long variantId,
    Pageable pageable
) {
    // Validate variant belongs to product
    ProductVariant variant = variantRepository.findById(variantId)
        .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

    if (!variant.getProduct().getId().equals(productId)) {
        throw new IllegalArgumentException("Variant không thuộc product này");
    }

    // Query transactions
    Page<InventoryTransaction> transactions = inventoryTransactionRepository
        .findByProductVariantIdOrderByCreatedAtDesc(variantId, pageable);

    // Map to DTOs
    return transactions.map(this::mapToStockHistoryResponseDTO);
}

private StockHistoryResponseDTO mapToStockHistoryResponseDTO(InventoryTransaction transaction) {
    ProductVariant variant = transaction.getProductVariant();

    return StockHistoryResponseDTO.builder()
        .id(transaction.getId())
        .productVariantId(variant.getId())
        .variantName(variant.getVariantName())
        .sku(variant.getSku())
        .transactionType(transaction.getTransactionType())
        .quantity(transaction.getQuantity())
        .stockBefore(transaction.getStockBefore())
        .stockAfter(transaction.getStockAfter())
        .referenceType(transaction.getReferenceType())
        .referenceId(transaction.getReferenceId())
        .reason(transaction.getNotes()) // Using notes as reason
        .notes(transaction.getNotes())
        .warehouseId(null) // TODO: Add warehouseId to transaction if needed
        .warehouseName(null) // TODO: Load warehouse name if needed
        .createdBy(transaction.getCreatedBy())
        .createdByName(null) // TODO: Load user name if needed
        .createdAt(transaction.getCreatedAt())
        .build();
}
```

#### Task 10.8: Add POST /api/admin/products/{productId}/variants/{variantId}/stock endpoint

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/controller/ProductAdminController.java`

```java
/**
 * Update stock với Transaction Model
 *
 * Endpoint: POST /api/admin/products/{productId}/variants/{variantId}/stock
 *
 * Request Body: InventoryTransactionRequestDTO
 * - quantity: Số lượng thay đổi (có thể âm hoặc dương)
 * - transactionType: Loại giao dịch (IMPORT, EXPORT, ADJUSTMENT, etc.)
 * - warehouseId: (optional) Warehouse ID
 * - reason: Lý do thay đổi
 * - referenceType: (optional) Loại reference (ORDER, ADJUSTMENT, etc.)
 * - referenceId: (optional) ID của reference
 * - notes: (optional) Ghi chú
 *
 * Response: ApiResponse<WarehouseStockDTO>
 */
@PostMapping("/{productId}/variants/{variantId}/stock")
public ResponseEntity<ApiResponse<WarehouseStockDTO>> updateStock(
    @PathVariable Long productId,
    @PathVariable Long variantId,
    @RequestBody @Valid InventoryTransactionRequestDTO requestDTO
) {
    try {
        WarehouseStockDTO stock = productAdminService.updateStock(productId, variantId, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật kho thành công", stock));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
    } catch (Exception e) {
        log.error("Lỗi khi cập nhật kho cho variant {}: {}", variantId, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi khi cập nhật kho: " + e.getMessage()));
    }
}
```

#### Task 10.9: Add GET /api/admin/products/{productId}/variants/{variantId}/stock-history endpoint

```java
/**
 * Get stock history (lịch sử giao dịch kho)
 *
 * Endpoint: GET /api/admin/products/{productId}/variants/{variantId}/stock-history
 *
 * Query Parameters:
 * - page: Page number (default: 0)
 * - size: Page size (default: 20)
 *
 * Response: ApiResponse<Page<StockHistoryResponseDTO>>
 */
@GetMapping("/{productId}/variants/{variantId}/stock-history")
public ResponseEntity<ApiResponse<Page<StockHistoryResponseDTO>>> getStockHistory(
    @PathVariable Long productId,
    @PathVariable Long variantId,
    @RequestParam(required = false, defaultValue = "0") Integer page,
    @RequestParam(required = false, defaultValue = "20") Integer size
) {
    try {
        Pageable pageable = PageRequest.of(page, size);
        Page<StockHistoryResponseDTO> history = productAdminService.getStockHistory(
            productId, variantId, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử kho thành công", history));
    } catch (Exception e) {
        log.error("Lỗi khi lấy lịch sử kho cho variant {}: {}", variantId, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi khi lấy lịch sử kho: " + e.getMessage()));
    }
}
```

#### Task 10.4: Implement getStock() - Keep existing method

```java
/**
 * Get current stock của variant (per warehouse hoặc total)
 */
public List<WarehouseStockDTO> getStock(Long productId, Long variantId) {
    // Load variant
    ProductVariant variant = variantRepository.findById(variantId)
        .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

    // Validate product match
    if (!variant.getProduct().getId().equals(productId)) {
        throw new IllegalArgumentException("Variant không thuộc product này");
    }

    // Get stock per warehouse
    List<WarehouseStock> warehouseStocks = warehouseStockRepository
        .findByProductVariantId(variantId);

    // Map to DTOs
    List<WarehouseStockDTO> stockDTOs = warehouseStocks.stream()
        .map(this::mapToWarehouseStockDTO)
        .collect(Collectors.toList());

    // Add total stock summary
    Integer totalStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
    Integer totalReserved = variant.getReservedQuantity() != null ? variant.getReservedQuantity() : 0;

    stockDTOs.add(WarehouseStockDTO.builder()
        .productVariantId(variantId)
        .warehouseId(null)
        .warehouseName("Tổng kho")
        .quantity(totalStock)
        .reservedQuantity(totalReserved)
        .availableQuantity(totalStock - totalReserved)
        .lastUpdatedAt(variant.getUpdatedAt())
        .build());

    return stockDTOs;
}
```

### 4.7. Phase 7: Business Logic Refinements

#### Task 18.1: Enhance generateUniqueSlug() - Product name + Variant name

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

**Current Implementation** (chỉ dùng variant name):

```java
private String generateUniqueSlug(String name) {
    String baseSlug = slugify.slugify(name);
    String slug = baseSlug;
    int counter = 1;

    while (variantRepository.existsBySlug(slug)) {
        slug = baseSlug + "-" + counter;
        counter++;
    }

    return slug;
}
```

**Enhanced Implementation** (Product name + Variant name):

```java
/**
 * Generate unique slug từ Product name + Variant name
 *
 * Format: {product-name}-{variant-name}
 * Ví dụ: "dior-sauvage-100ml"
 *
 * Nếu trùng, thêm suffix: "dior-sauvage-100ml-1", "dior-sauvage-100ml-2", ...
 *
 * @param productName Tên product
 * @param variantName Tên variant
 * @return Slug unique
 */
private String generateUniqueSlug(String productName, String variantName) {
    // Tạo base slug từ product name + variant name
    String productSlug = slugify.slugify(productName);
    String variantSlug = slugify.slugify(variantName);
    String baseSlug = productSlug + "-" + variantSlug;

    // Kiểm tra và tạo slug unique với suffix counter
    String slug = baseSlug;
    int counter = 1;

    while (variantRepository.existsBySlug(slug)) {
        slug = baseSlug + "-" + counter;
        counter++;

        // Safety check: Tránh infinite loop (max 1000 attempts)
        if (counter > 1000) {
            // Fallback: Sử dụng UUID để đảm bảo unique
            String uuid = UUID.randomUUID().toString().substring(0, 8);
            slug = baseSlug + "-" + uuid;
            log.warn("Slug generation reached max attempts, using UUID fallback: {}", slug);
            break;
        }
    }

    log.debug("Generated unique slug: {} from product: {} + variant: {}",
        slug, productName, variantName);
    return slug;
}

/**
 * Overload method cho backward compatibility (chỉ dùng variant name)
 * @deprecated Sử dụng generateUniqueSlug(String productName, String variantName) thay thế
 */
@Deprecated
private String generateUniqueSlug(String variantName) {
    // Fallback: Chỉ dùng variant name nếu không có product name
    return generateUniqueSlug("", variantName).replaceFirst("^-", "");
}
```

**Update createVariantWithAttributes() method**:

```java
private void createVariantWithAttributes(
    Product product,
    ProductCreateRequestDTO.ProductVariantCreateDTO variantDTO
) {
    // Generate slug từ product name + variant name
    String slug = generateUniqueSlug(product.getName(), variantDTO.getVariantName());

    // ... rest of variant creation logic
}
```

#### Task 18.2: Add slug uniqueness check với suffix counter

**Repository Method** (đã có sẵn):

```java
// ProductVariantRepository.java
boolean existsBySlug(String slug);
```

**Enhanced Logic với Better Performance**:

```java
/**
 * Generate unique slug với batch check để tối ưu performance
 *
 * Thay vì check từng slug một, có thể check nhiều slugs cùng lúc
 */
private String generateUniqueSlugOptimized(String productName, String variantName) {
    String productSlug = slugify.slugify(productName);
    String variantSlug = slugify.slugify(variantName);
    String baseSlug = productSlug + "-" + variantSlug;

    // Check base slug trước
    if (!variantRepository.existsBySlug(baseSlug)) {
        return baseSlug;
    }

    // Nếu trùng, tìm số suffix tiếp theo có sẵn
    // Query để tìm slug pattern: baseSlug-{number}
    List<String> existingSlugs = variantRepository.findSlugsByPattern(baseSlug + "-%");

    // Extract numbers từ existing slugs
    Set<Integer> usedNumbers = existingSlugs.stream()
        .map(slug -> {
            String suffix = slug.substring(baseSlug.length() + 1); // +1 for "-"
            try {
                return Integer.parseInt(suffix);
            } catch (NumberFormatException e) {
                return null;
            }
        })
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    // Tìm số nhỏ nhất chưa được sử dụng
    int nextNumber = 1;
    while (usedNumbers.contains(nextNumber)) {
        nextNumber++;
    }

    String uniqueSlug = baseSlug + "-" + nextNumber;
    log.debug("Generated unique slug with optimized check: {}", uniqueSlug);
    return uniqueSlug;
}
```

**Repository Method cần thêm**:

```java
// ProductVariantRepository.java
@Query("SELECT v.slug FROM ProductVariant v WHERE v.slug LIKE :pattern")
List<String> findSlugsByPattern(@Param("pattern") String pattern);
```

#### Task 18.3: Implement deleteImage() với physical file cleanup

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Delete image với physical file cleanup
 *
 * Logic:
 * 1. Load image entity
 * 2. Extract image URL
 * 3. Delete từ database
 * 4. Delete physical file từ S3/MinIO
 *
 * @param productId Product ID
 * @param imageId Image ID
 */
@Transactional
public void deleteImage(Long productId, Long imageId) {
    log.info("Deleting image {} for product {}", imageId, productId);

    // 1. Load image entity
    ProductImage image = imageRepository.findById(imageId)
        .orElseThrow(() -> new ResourceNotFoundException("Image", imageId));

    // Validate product match
    if (!image.getProduct().getId().equals(productId)) {
        throw new IllegalArgumentException("Image không thuộc product này");
    }

    // 2. Extract image URLs (có thể có cả imageUrl và thumbnailUrl)
    String imageUrl = image.getImageUrl();
    String thumbnailUrl = image.getThumbnailUrl();

    // 3. Delete từ database
    imageRepository.delete(image);
    log.info("Deleted image record from database: {}", imageId);

    // 4. Delete physical files từ S3/MinIO
    try {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            imageUploadService.deleteImage(imageUrl);
            log.info("Deleted physical image file: {}", imageUrl);
        }

        if (thumbnailUrl != null && !thumbnailUrl.isEmpty() && !thumbnailUrl.equals(imageUrl)) {
            imageUploadService.deleteImage(thumbnailUrl);
            log.info("Deleted physical thumbnail file: {}", thumbnailUrl);
        }
    } catch (Exception e) {
        // Log error nhưng không throw exception
        // Vì database record đã xóa, không thể rollback
        // File có thể đã bị xóa hoặc không tồn tại
        log.warn("Failed to delete physical image file(s) for image {}: {}", imageId, e.getMessage());
        log.debug("Image URLs: imageUrl={}, thumbnailUrl={}", imageUrl, thumbnailUrl, e);
    }
}
```

#### Task 18.4: Implement deleteProduct() với image cleanup

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Delete product với cleanup tất cả images
 *
 * Logic:
 * 1. Load product với images
 * 2. Delete tất cả images (database + physical files)
 * 3. Delete product (soft delete - set status = ARCHIVED)
 *
 * @param id Product ID
 */
@Transactional
public void deleteProduct(Long id) {
    log.info("Deleting product: {}", id);

    // 1. Load product với images
    Product product = productRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product", id));

    // 2. Delete tất cả images (database + physical files)
    List<ProductImage> images = new ArrayList<>(product.getImages());
    for (ProductImage image : images) {
        try {
            deleteImage(id, image.getId());
        } catch (Exception e) {
            // Log error nhưng tiếp tục xóa các images khác
            log.warn("Failed to delete image {} for product {}: {}",
                image.getId(), id, e.getMessage());
        }
    }

    // 3. Soft delete product (set status = ARCHIVED)
    product.setStatus(Product.Status.ARCHIVED);
    product.setArchivedAt(LocalDateTime.now());
    productRepository.save(product);

    log.info("Product {} has been archived (soft delete)", id);
}
```

**Note**: Nếu muốn hard delete (xóa hoàn toàn), cần xóa theo thứ tự:

1. Delete images (database + physical)
2. Delete variants (cascade sẽ xóa variants)
3. Delete product

#### Task 19.1: Phân biệt Attribute vs Specification trong Code Comments

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * ============================================================================
 * PHÂN BIỆT ATTRIBUTE VÀ SPECIFICATION
 * ============================================================================
 *
 * ATTRIBUTE (Thuộc tính):
 * - Mục đích: Dùng để TẠO BIẾN THỂ (Variants)
 * - Ví dụ: Màu sắc (Red, Blue, Green), Kích thước (S, M, L), Nồng độ (10%, 20%)
 * - Đặc điểm:
 *   + Có thể có nhiều giá trị (Attribute Options)
 *   + Được lưu trong bảng product_attributes (EAV model)
 *   + Được cache trong cached_attributes (JSONB) của ProductVariant
 *   + Dùng để filter, search, và tạo variants
 *   + Có thể là Product-level hoặc Variant-level
 *
 * SPECIFICATION (Thông số kỹ thuật):
 * - Mục đích: CHỈ HIỂN THỊ thông tin, không dùng để tạo variants
 * - Ví dụ: Hạn sử dụng, Xuất xứ, Thành phần, Công dụng, Hướng dẫn sử dụng
 * - Đặc điểm:
 *   + Key-Value pairs đơn giản
 *   + Lưu trong bảng product_specifications
 *   + Chỉ để hiển thị cho khách hàng
 *   + Không ảnh hưởng đến logic business
 *   + Luôn là Product-level (không có Variant-level)
 *
 * ============================================================================
 */

/**
 * Sync Attributes vào EAV và JSONB
 *
 * ⚠️ ATTRIBUTE - Dùng để tạo variants
 *
 * Logic:
 * 1. Lưu vào product_attributes (EAV) - Source of Truth
 * 2. Convert thành Map và lưu vào cached_attributes (JSONB) - Performance
 *
 * Attributes được dùng để:
 * - Filter products (VD: Lọc theo màu, size)
 * - Generate variants (VD: Tự động tạo variants từ attribute combinations)
 * - Display variant options (VD: Hiển thị dropdown chọn màu, size)
 */
private void syncAttributes(ProductVariant variant, List<ProductAttributeValueDTO> attributeValues) {
    // ... implementation
}

/**
 * Sync Specifications
 *
 * ⚠️ SPECIFICATION - Chỉ để hiển thị, không dùng để tạo variants
 *
 * Specifications được dùng để:
 * - Hiển thị thông tin sản phẩm (VD: Hạn sử dụng, Xuất xứ)
 * - SEO (meta descriptions)
 * - Compliance (thông tin pháp lý)
 *
 * KHÔNG được dùng để:
 * - Filter products
 * - Generate variants
 * - Business logic
 */
private void syncSpecifications(Product product, List<SpecificationCreateRequestDTO> specifications) {
    // ... implementation
}
```

#### Task 19.2: Update DTOs Documentation

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/ProductCreateRequestDTO.java`

```java
/**
 * DTO cho request tạo mới Product từ Admin Panel.
 *
 * ============================================================================
 * ATTRIBUTE vs SPECIFICATION
 * ============================================================================
 *
 * Attributes (trong variants):
 * - Dùng để TẠO BIẾN THỂ
 * - Ví dụ: Màu (Red/Blue), Size (S/M/L), Nồng độ (10%/20%)
 * - Được lưu trong product_attributes (EAV) và cached_attributes (JSONB)
 * - Có thể filter, search
 *
 * Specifications (trong product):
 * - CHỈ HIỂN THỊ thông tin
 * - Ví dụ: Hạn sử dụng, Xuất xứ, Thành phần
 * - Được lưu trong product_specifications
 * - Không ảnh hưởng đến business logic
 * ============================================================================
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequestDTO {

    // ... existing fields ...

    /**
     * Danh sách AttributeValues cho variant
     *
     * ⚠️ ATTRIBUTE - Dùng để tạo variants
     *
     * Mỗi variant có thể có nhiều attributes (VD: Màu + Size)
     * Attributes được dùng để:
     * - Filter products
     * - Generate variant combinations
     * - Display variant options
     */
    @Valid
    @Builder.Default
    private List<ProductAttributeValueDTO> attributeValues = new ArrayList<>();

    /**
     * Danh sách Specifications cho product
     *
     * ⚠️ SPECIFICATION - Chỉ để hiển thị
     *
     * Specifications là Key-Value pairs đơn giản
     * Chỉ dùng để hiển thị thông tin, không ảnh hưởng đến business logic
     */
    @Valid
    @Builder.Default
    private List<SpecificationCreateRequestDTO> specifications = new ArrayList<>();
}
```

#### Task 19.3: Add Validation Rules cho Attributes

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Validate Attributes
 *
 * ⚠️ ATTRIBUTE - Phải có AttributeType và AttributeOption (hoặc custom value)
 *
 * Rules:
 * 1. AttributeType phải tồn tại
 * 2. Nếu có AttributeOption, phải thuộc AttributeType đó
 * 3. Nếu không có AttributeOption, phải có customValue
 * 4. Attributes phải unique (không trùng attributeType trong cùng variant)
 */
private void validateAttributes(List<ProductAttributeValueDTO> attributeValues) {
    if (attributeValues == null || attributeValues.isEmpty()) {
        return; // Attributes là optional
    }

    Set<Long> usedAttributeTypes = new HashSet<>();

    for (ProductAttributeValueDTO attrValue : attributeValues) {
        // 1. Validate AttributeType exists
        AttributeType attributeType = attributeTypeRepository.findById(attrValue.getAttributeTypeId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "AttributeType", attrValue.getAttributeTypeId()));

        // 2. Validate uniqueness (không trùng attributeType trong cùng variant)
        if (usedAttributeTypes.contains(attrValue.getAttributeTypeId())) {
            throw new IllegalArgumentException(
                String.format("AttributeType %s đã được sử dụng trong variant này",
                    attributeType.getName()));
        }
        usedAttributeTypes.add(attrValue.getAttributeTypeId());

        // 3. Validate AttributeOption (nếu có)
        if (attrValue.getAttributeOptionId() != null) {
            AttributeOption option = attributeOptionRepository.findById(attrValue.getAttributeOptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "AttributeOption", attrValue.getAttributeOptionId()));

            // Validate option thuộc attributeType
            if (!option.getAttributeType().getId().equals(attributeType.getId())) {
                throw new IllegalArgumentException(
                    String.format("AttributeOption %s không thuộc AttributeType %s",
                        option.getName(), attributeType.getName()));
            }
        } else {
            // 4. Nếu không có AttributeOption, phải có customValue
            if (attrValue.getCustomValue() == null || attrValue.getCustomValue().trim().isEmpty()) {
                throw new IllegalArgumentException(
                    String.format("AttributeType %s phải có AttributeOption hoặc CustomValue",
                        attributeType.getName()));
            }
        }
    }
}
```

#### Task 19.4: Add Validation Rules cho Specifications

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Validate Specifications
 *
 * ⚠️ SPECIFICATION - Chỉ là Key-Value pairs, không có validation phức tạp
 *
 * Rules:
 * 1. Key không được để trống
 * 2. Value không được để trống
 * 3. Key phải unique trong cùng product (không trùng key)
 * 4. Không có validation về AttributeType/AttributeOption (vì không liên quan)
 */
private void validateSpecifications(List<SpecificationCreateRequestDTO> specifications) {
    if (specifications == null || specifications.isEmpty()) {
        return; // Specifications là optional
    }

    Set<String> usedKeys = new HashSet<>();

    for (SpecificationCreateRequestDTO spec : specifications) {
        // 1. Validate Key không được để trống
        if (spec.getKey() == null || spec.getKey().trim().isEmpty()) {
            throw new IllegalArgumentException("Specification key không được để trống");
        }

        // 2. Validate Value không được để trống
        if (spec.getValue() == null || spec.getValue().trim().isEmpty()) {
            throw new IllegalArgumentException(
                String.format("Specification value cho key '%s' không được để trống", spec.getKey()));
        }

        // 3. Validate Key unique
        String keyLower = spec.getKey().trim().toLowerCase();
        if (usedKeys.contains(keyLower)) {
            throw new IllegalArgumentException(
                String.format("Specification key '%s' đã được sử dụng", spec.getKey()));
        }
        usedKeys.add(keyLower);
    }
}
```

### 4.7. Phase 7: Business Logic Refinements

#### Task 18.1: Enhance generateUniqueSlug() - Product name + Variant name

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

**Current Implementation** (chỉ dùng variant name):

```java
private String generateUniqueSlug(String name) {
    String baseSlug = slugify.slugify(name);
    String slug = baseSlug;
    int counter = 1;

    while (variantRepository.existsBySlug(slug)) {
        slug = baseSlug + "-" + counter;
        counter++;
    }

    return slug;
}
```

**Enhanced Implementation** (Product name + Variant name):

```java
/**
 * Generate unique slug từ Product name + Variant name
 *
 * Format: {product-name}-{variant-name}
 * Ví dụ: "dior-sauvage-100ml"
 *
 * Nếu trùng, thêm suffix: "dior-sauvage-100ml-1", "dior-sauvage-100ml-2", ...
 *
 * @param productName Tên product
 * @param variantName Tên variant
 * @return Slug unique
 */
private String generateUniqueSlug(String productName, String variantName) {
    // Tạo base slug từ product name + variant name
    String productSlug = slugify.slugify(productName);
    String variantSlug = slugify.slugify(variantName);
    String baseSlug = productSlug + "-" + variantSlug;

    // Kiểm tra và tạo slug unique với suffix counter
    String slug = baseSlug;
    int counter = 1;

    while (variantRepository.existsBySlug(slug)) {
        slug = baseSlug + "-" + counter;
        counter++;

        // Safety check: Tránh infinite loop (max 1000 attempts)
        if (counter > 1000) {
            // Fallback: Sử dụng UUID để đảm bảo unique
            String uuid = UUID.randomUUID().toString().substring(0, 8);
            slug = baseSlug + "-" + uuid;
            log.warn("Slug generation reached max attempts, using UUID fallback: {}", slug);
            break;
        }
    }

    log.debug("Generated unique slug: {} from product: {} + variant: {}",
        slug, productName, variantName);
    return slug;
}

/**
 * Overload method cho backward compatibility (chỉ dùng variant name)
 * @deprecated Sử dụng generateUniqueSlug(String productName, String variantName) thay thế
 */
@Deprecated
private String generateUniqueSlug(String variantName) {
    // Fallback: Chỉ dùng variant name nếu không có product name
    return generateUniqueSlug("", variantName).replaceFirst("^-", "");
}
```

**Update createVariantWithAttributes() method**:

```java
private void createVariantWithAttributes(
    Product product,
    ProductCreateRequestDTO.ProductVariantCreateDTO variantDTO
) {
    // Generate slug từ product name + variant name
    String slug = generateUniqueSlug(product.getName(), variantDTO.getVariantName());

    // ... rest of variant creation logic
}
```

#### Task 18.2: Add slug uniqueness check với suffix counter

**Repository Method** (đã có sẵn):

```java
// ProductVariantRepository.java
boolean existsBySlug(String slug);
```

**Enhanced Logic với Better Performance** (Optional):

```java
/**
 * Generate unique slug với batch check để tối ưu performance
 *
 * Thay vì check từng slug một, có thể check nhiều slugs cùng lúc
 * (Nếu có nhiều variants cùng lúc, có thể optimize hơn)
 */
private String generateUniqueSlugOptimized(String productName, String variantName) {
    String productSlug = slugify.slugify(productName);
    String variantSlug = slugify.slugify(variantName);
    String baseSlug = productSlug + "-" + variantSlug;

    // Check base slug trước
    if (!variantRepository.existsBySlug(baseSlug)) {
        return baseSlug;
    }

    // Nếu trùng, tìm số suffix tiếp theo có sẵn
    // Query để tìm slug pattern: baseSlug-{number}
    List<String> existingSlugs = variantRepository.findSlugsByPattern(baseSlug + "-%");

    // Extract numbers từ existing slugs
    Set<Integer> usedNumbers = existingSlugs.stream()
        .map(slug -> {
            String suffix = slug.substring(baseSlug.length() + 1); // +1 for "-"
            try {
                return Integer.parseInt(suffix);
            } catch (NumberFormatException e) {
                return null;
            }
        })
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    // Tìm số nhỏ nhất chưa được sử dụng
    int nextNumber = 1;
    while (usedNumbers.contains(nextNumber)) {
        nextNumber++;
    }

    String uniqueSlug = baseSlug + "-" + nextNumber;
    log.debug("Generated unique slug with optimized check: {}", uniqueSlug);
    return uniqueSlug;
}
```

**Repository Method cần thêm** (Optional, để optimize):

```java
// ProductVariantRepository.java
@Query("SELECT v.slug FROM ProductVariant v WHERE v.slug LIKE :pattern")
List<String> findSlugsByPattern(@Param("pattern") String pattern);
```

#### Task 18.3: Implement deleteImage() với physical file cleanup

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Delete image với physical file cleanup
 *
 * Logic:
 * 1. Load image entity
 * 2. Extract image URL
 * 3. Delete từ database
 * 4. Delete physical file từ S3/MinIO
 *
 * ⚠️ CRITICAL: Phải xóa physical file để tránh rác server
 *
 * @param productId Product ID
 * @param imageId Image ID
 */
@Transactional
public void deleteImage(Long productId, Long imageId) {
    log.info("Deleting image {} for product {}", imageId, productId);

    // 1. Load image entity
    ProductImage image = imageRepository.findById(imageId)
        .orElseThrow(() -> new ResourceNotFoundException("Image", imageId));

    // Validate product match
    if (!image.getProduct().getId().equals(productId)) {
        throw new IllegalArgumentException("Image không thuộc product này");
    }

    // 2. Extract image URLs (có thể có cả imageUrl và thumbnailUrl)
    String imageUrl = image.getImageUrl();
    String thumbnailUrl = image.getThumbnailUrl();

    // 3. Delete từ database
    imageRepository.delete(image);
    log.info("Deleted image record from database: {}", imageId);

    // 4. Delete physical files từ S3/MinIO
    try {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            imageUploadService.deleteImage(imageUrl);
            log.info("Deleted physical image file: {}", imageUrl);
        }

        // Delete thumbnail nếu khác với imageUrl
        if (thumbnailUrl != null && !thumbnailUrl.isEmpty() && !thumbnailUrl.equals(imageUrl)) {
            imageUploadService.deleteImage(thumbnailUrl);
            log.info("Deleted physical thumbnail file: {}", thumbnailUrl);
        }
    } catch (Exception e) {
        // Log error nhưng không throw exception
        // Vì database record đã xóa, không thể rollback
        // File có thể đã bị xóa hoặc không tồn tại
        log.warn("Failed to delete physical image file(s) for image {}: {}", imageId, e.getMessage());
        log.debug("Image URLs: imageUrl={}, thumbnailUrl={}", imageUrl, thumbnailUrl, e);
    }
}
```

#### Task 18.4: Implement deleteProduct() với image cleanup

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Delete product với cleanup tất cả images
 *
 * Logic:
 * 1. Load product với images
 * 2. Delete tất cả images (database + physical files)
 * 3. Delete product (soft delete - set status = ARCHIVED)
 *
 * ⚠️ CRITICAL: Phải xóa tất cả physical files để tránh rác server
 *
 * @param id Product ID
 */
@Transactional
public void deleteProduct(Long id) {
    log.info("Deleting product: {}", id);

    // 1. Load product với images
    Product product = productRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product", id));

    // 2. Delete tất cả images (database + physical files)
    List<ProductImage> images = new ArrayList<>(product.getImages());
    for (ProductImage image : images) {
        try {
            deleteImage(id, image.getId());
        } catch (Exception e) {
            // Log error nhưng tiếp tục xóa các images khác
            log.warn("Failed to delete image {} for product {}: {}",
                image.getId(), id, e.getMessage());
        }
    }

    // 3. Soft delete product (set status = ARCHIVED)
    product.setStatus(Product.Status.ARCHIVED);
    product.setArchivedAt(LocalDateTime.now());
    productRepository.save(product);

    log.info("Product {} has been archived (soft delete)", id);
}
```

**Note**: Nếu muốn hard delete (xóa hoàn toàn), cần xóa theo thứ tự:

1. Delete images (database + physical)
2. Delete variants (cascade sẽ xóa variants)
3. Delete product

#### Task 19.1: Phân biệt Attribute vs Specification trong Code Comments

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * ============================================================================
 * PHÂN BIỆT ATTRIBUTE VÀ SPECIFICATION
 * ============================================================================
 *
 * ATTRIBUTE (Thuộc tính):
 * - Mục đích: Dùng để TẠO BIẾN THỂ (Variants)
 * - Ví dụ: Màu sắc (Red, Blue, Green), Kích thước (S, M, L), Nồng độ (10%, 20%)
 * - Đặc điểm:
 *   + Có thể có nhiều giá trị (Attribute Options)
 *   + Được lưu trong bảng product_attributes (EAV model)
 *   + Được cache trong cached_attributes (JSONB) của ProductVariant
 *   + Dùng để filter, search, và tạo variants
 *   + Có thể là Product-level hoặc Variant-level
 *
 * SPECIFICATION (Thông số kỹ thuật):
 * - Mục đích: CHỈ HIỂN THỊ thông tin, không dùng để tạo variants
 * - Ví dụ: Hạn sử dụng, Xuất xứ, Thành phần, Công dụng, Hướng dẫn sử dụng
 * - Đặc điểm:
 *   + Key-Value pairs đơn giản
 *   + Lưu trong bảng product_specifications
 *   + Chỉ để hiển thị cho khách hàng
 *   + Không ảnh hưởng đến logic business
 *   + Luôn là Product-level (không có Variant-level)
 *
 * ============================================================================
 */

/**
 * Sync Attributes vào EAV và JSONB
 *
 * ⚠️ ATTRIBUTE - Dùng để tạo variants
 *
 * Logic:
 * 1. Lưu vào product_attributes (EAV) - Source of Truth
 * 2. Convert thành Map và lưu vào cached_attributes (JSONB) - Performance
 *
 * Attributes được dùng để:
 * - Filter products (VD: Lọc theo màu, size)
 * - Generate variants (VD: Tự động tạo variants từ attribute combinations)
 * - Display variant options (VD: Hiển thị dropdown chọn màu, size)
 */
private void syncAttributes(ProductVariant variant, List<ProductAttributeValueDTO> attributeValues) {
    // ... implementation
}

/**
 * Sync Specifications
 *
 * ⚠️ SPECIFICATION - Chỉ để hiển thị, không dùng để tạo variants
 *
 * Specifications được dùng để:
 * - Hiển thị thông tin sản phẩm (VD: Hạn sử dụng, Xuất xứ)
 * - SEO (meta descriptions)
 * - Compliance (thông tin pháp lý)
 *
 * KHÔNG được dùng để:
 * - Filter products
 * - Generate variants
 * - Business logic
 */
private void syncSpecifications(Product product, List<SpecificationCreateRequestDTO> specifications) {
    // ... implementation
}
```

#### Task 19.2: Update DTOs Documentation

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/ProductCreateRequestDTO.java`

```java
/**
 * DTO cho request tạo mới Product từ Admin Panel.
 *
 * ============================================================================
 * ATTRIBUTE vs SPECIFICATION
 * ============================================================================
 *
 * Attributes (trong variants):
 * - Dùng để TẠO BIẾN THỂ
 * - Ví dụ: Màu (Red/Blue), Size (S/M/L), Nồng độ (10%/20%)
 * - Được lưu trong product_attributes (EAV) và cached_attributes (JSONB)
 * - Có thể filter, search
 *
 * Specifications (trong product):
 * - CHỈ HIỂN THỊ thông tin
 * - Ví dụ: Hạn sử dụng, Xuất xứ, Thành phần
 * - Được lưu trong product_specifications
 * - Không ảnh hưởng đến business logic
 * ============================================================================
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequestDTO {

    // ... existing fields ...

    /**
     * Danh sách AttributeValues cho variant
     *
     * ⚠️ ATTRIBUTE - Dùng để tạo variants
     *
     * Mỗi variant có thể có nhiều attributes (VD: Màu + Size)
     * Attributes được dùng để:
     * - Filter products
     * - Generate variant combinations
     * - Display variant options
     */
    @Valid
    @Builder.Default
    private List<ProductAttributeValueDTO> attributeValues = new ArrayList<>();

    /**
     * Danh sách Specifications cho product
     *
     * ⚠️ SPECIFICATION - Chỉ để hiển thị
     *
     * Specifications là Key-Value pairs đơn giản
     * Chỉ dùng để hiển thị thông tin, không ảnh hưởng đến business logic
     */
    @Valid
    @Builder.Default
    private List<SpecificationCreateRequestDTO> specifications = new ArrayList<>();
}
```

#### Task 19.3: Add Validation Rules cho Attributes

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Validate Attributes
 *
 * ⚠️ ATTRIBUTE - Phải có AttributeType và AttributeOption (hoặc custom value)
 *
 * Rules:
 * 1. AttributeType phải tồn tại
 * 2. Nếu có AttributeOption, phải thuộc AttributeType đó
 * 3. Nếu không có AttributeOption, phải có customValue
 * 4. Attributes phải unique (không trùng attributeType trong cùng variant)
 */
private void validateAttributes(List<ProductAttributeValueDTO> attributeValues) {
    if (attributeValues == null || attributeValues.isEmpty()) {
        return; // Attributes là optional
    }

    Set<Long> usedAttributeTypes = new HashSet<>();

    for (ProductAttributeValueDTO attrValue : attributeValues) {
        // 1. Validate AttributeType exists
        AttributeType attributeType = attributeTypeRepository.findById(attrValue.getAttributeTypeId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "AttributeType", attrValue.getAttributeTypeId()));

        // 2. Validate uniqueness (không trùng attributeType trong cùng variant)
        if (usedAttributeTypes.contains(attrValue.getAttributeTypeId())) {
            throw new IllegalArgumentException(
                String.format("AttributeType %s đã được sử dụng trong variant này",
                    attributeType.getName()));
        }
        usedAttributeTypes.add(attrValue.getAttributeTypeId());

        // 3. Validate AttributeOption (nếu có)
        if (attrValue.getAttributeOptionId() != null) {
            AttributeOption option = attributeOptionRepository.findById(attrValue.getAttributeOptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "AttributeOption", attrValue.getAttributeOptionId()));

            // Validate option thuộc attributeType
            if (!option.getAttributeType().getId().equals(attributeType.getId())) {
                throw new IllegalArgumentException(
                    String.format("AttributeOption %s không thuộc AttributeType %s",
                        option.getName(), attributeType.getName()));
            }
        } else {
            // 4. Nếu không có AttributeOption, phải có customValue
            if (attrValue.getCustomValue() == null || attrValue.getCustomValue().trim().isEmpty()) {
                throw new IllegalArgumentException(
                    String.format("AttributeType %s phải có AttributeOption hoặc CustomValue",
                        attributeType.getName()));
            }
        }
    }
}
```

#### Task 19.4: Add Validation Rules cho Specifications

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
/**
 * Validate Specifications
 *
 * ⚠️ SPECIFICATION - Chỉ là Key-Value pairs, không có validation phức tạp
 *
 * Rules:
 * 1. Key không được để trống
 * 2. Value không được để trống
 * 3. Key phải unique trong cùng product (không trùng key)
 * 4. Không có validation về AttributeType/AttributeOption (vì không liên quan)
 */
private void validateSpecifications(List<SpecificationCreateRequestDTO> specifications) {
    if (specifications == null || specifications.isEmpty()) {
        return; // Specifications là optional
    }

    Set<String> usedKeys = new HashSet<>();

    for (SpecificationCreateRequestDTO spec : specifications) {
        // 1. Validate Key không được để trống
        if (spec.getKey() == null || spec.getKey().trim().isEmpty()) {
            throw new IllegalArgumentException("Specification key không được để trống");
        }

        // 2. Validate Value không được để trống
        if (spec.getValue() == null || spec.getValue().trim().isEmpty()) {
            throw new IllegalArgumentException(
                String.format("Specification value cho key '%s' không được để trống", spec.getKey()));
        }

        // 3. Validate Key unique
        String keyLower = spec.getKey().trim().toLowerCase();
        if (usedKeys.contains(keyLower)) {
            throw new IllegalArgumentException(
                String.format("Specification key '%s' đã được sử dụng", spec.getKey()));
        }
        usedKeys.add(keyLower);
    }
}
```

### 4.7.1. Lợi ích của Business Logic Refinements

#### 1. Slug Generation Improvements

**Trước**:

- Chỉ dùng variant name → dễ trùng
- Không có context từ product name

**Sau**:

- Product name + Variant name → unique hơn
- Format: `{product-name}-{variant-name}`
- Auto suffix nếu trùng: `-1`, `-2`, ...
- UUID fallback nếu quá nhiều attempts

**Lợi ích**:

- SEO friendly URLs
- Dễ đọc và hiểu
- Tránh conflict
- Better user experience

#### 2. Image Cleanup

**Trước**:

- Chỉ xóa database record
- File vật lý còn lại trên server → rác

**Sau**:

- Xóa cả database và physical file
- Cleanup khi delete image
- Cleanup khi delete product
- Error handling graceful

**Lợi ích**:

- Tiết kiệm storage
- Tránh rác server
- Cost optimization (S3/MinIO)
- Better resource management

#### 3. Attribute vs Specification Clarification

**Trước**:

- Không rõ sự khác biệt
- Dễ nhầm lẫn khi implement

**Sau**:

- Rõ ràng trong code comments
- Validation rules khác nhau
- Documentation đầy đủ

**Lợi ích**:

- Developer hiểu rõ hơn
- Tránh implement sai
- Better code maintainability
- Clear business logic

### 4.5.1. Lợi ích của Transaction Model

#### So sánh: Set Model vs Transaction Model

**Set Model (Cũ)**:

```java
// ❌ Chỉ update số lượng, mất lịch sử
stock.setQuantity(100); // Không biết tại sao là 100
```

**Transaction Model (Mới)**:

```java
// ✅ Có lịch sử đầy đủ
transaction = InventoryTransaction.builder()
    .quantity(10)  // Nhập thêm 10
    .stockBefore(90)
    .stockAfter(100)
    .transactionType(TransactionType.IN)
    .reason("Nhập hàng từ nhà cung cấp")
    .referenceType("PURCHASE_ORDER")
    .referenceId(456L)
    .build();
```

#### Lợi ích:

1. **Audit Trail (Lịch sử kiểm toán)**:

   - Biết được ai, khi nào, tại sao thay đổi kho
   - Có thể trace lại mọi thay đổi
   - Hỗ trợ compliance và audit

2. **Data Integrity (Tính toàn vẹn dữ liệu)**:

   - Không thể "set" số lượng tùy ý
   - Mọi thay đổi đều có lý do (reason)
   - Có thể validate và reconcile

3. **Business Intelligence**:

   - Phân tích xu hướng nhập/xuất kho
   - Tính toán turnover rate
   - Dự báo nhu cầu

4. **Error Recovery**:

   - Có thể reverse transaction nếu sai
   - Có thể điều chỉnh (ADJUSTMENT) nếu cần
   - Dễ dàng reconcile với physical count

5. **Integration**:
   - Link với orders (referenceId = orderId)
   - Link với purchase orders
   - Link với returns
   - Track theo warehouse

#### Transaction Types:

- **IN**: Nhập kho (quantity > 0)
- **OUT**: Xuất kho (quantity < 0)
- **ADJUSTMENT**: Điều chỉnh (có thể âm hoặc dương)
- **RETURN**: Trả hàng (quantity > 0)
- **DAMAGED**: Hàng hỏng (quantity < 0)
- **RESERVE**: Giữ hàng (quantity < 0, không xuất thực tế)
- **RELEASE**: Giải phóng hàng đã reserve (quantity > 0)

### 4.6. Phase 6: Bulk Operations

#### Task 11.3: Implement bulkUpdateStatus() trong ProductAdminService

```java
@Transactional
public void bulkUpdateStatus(List<Long> productIds, String status) {
    if (productIds == null || productIds.isEmpty()) {
        throw new IllegalArgumentException("Danh sách product IDs không được để trống");
    }

    // Validate status
    try {
        Product.Status.valueOf(status);
    } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Status không hợp lệ: " + status);
    }

    // Update all products
    List<Product> products = productRepository.findAllById(productIds);

    if (products.size() != productIds.size()) {
        throw new ResourceNotFoundException("Một số products không tồn tại");
    }

    products.forEach(product -> {
        product.setStatus(Product.Status.valueOf(status));
        if (status.equals("ARCHIVED")) {
            product.setArchivedAt(LocalDateTime.now());
        } else if (status.equals("PUBLISHED")) {
            product.setPublishedAt(LocalDateTime.now());
        }
    });

    productRepository.saveAll(products);

    log.info("Updated status to {} for {} products", status, products.size());
}
```

### 4.7. Phase 7: Performance Optimization & Concurrency

#### Task 16.1: Fix N+1 Query trong ProductRepository

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/repository/ProductRepository.java`

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    /**
     * Find all products với filters và pagination - OPTIMIZED để tránh N+1 Query
     *
     * ⚠️ CRITICAL: Sử dụng @EntityGraph để eager fetch variants và brand trong cùng 1 query
     *
     * Vấn đề MultipleBagFetchException:
     * - Hibernate không cho phép fetch nhiều @OneToMany collections (bags) cùng lúc
     * - Giải pháp: Chỉ fetch variants trong EntityGraph, images dùng @BatchSize
     *
     * Performance:
     * - 1 query chính với JOIN variants và brand
     * - images được fetch riêng bằng @BatchSize (hiệu quả, tránh N+1)
     *
     * Usage:
     * Specification<Product> spec = ProductSpecification.buildSpecification(filter);
     * Page<Product> products = productRepository.findAllWithDetails(spec, pageable);
     */
    @EntityGraph(attributePaths = {
        "variants",
        "brand"
    })
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v LEFT JOIN p.brand b")
    Page<Product> findAllWithDetails(Specification<Product> spec, Pageable pageable);

    // Existing methods...
}
```

#### Task 16.2: Fix ProductSpecification với distinct

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/specification/ProductSpecification.java`

```java
package com.orchard.orchard_store_backend.modules.catalog.product.specification;

import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductFilterDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    /**
     * Build Specification với distinct để tránh duplicate rows khi join
     */
    public static Specification<Product> buildSpecification(ProductFilterDTO filter) {
        return (root, query, cb) -> {
            // ⚠️ CRITICAL: Set distinct để tránh duplicate rows khi join variants
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // Keyword search (name, SKU)
            if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
                String keyword = "%" + filter.getKeyword().toLowerCase() + "%";

                // Join variants để search SKU
                Join<Product, ?> variantJoin = root.join("variants", JoinType.LEFT);

                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("name")), keyword),
                        cb.like(cb.lower(variantJoin.get("sku")), keyword)
                    )
                );
            }

            // Status filter
            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
                try {
                    Product.Status status = Product.Status.valueOf(filter.getStatus());
                    predicates.add(cb.equal(root.get("status"), status));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            }

            // Brand filter
            if (filter.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.getBrandId()));
            }

            // Category filter (via variants) - LEFT JOIN để không loại bỏ products không có category
            if (filter.getCategoryId() != null) {
                Join<Product, ?> variantJoin = root.join("variants", JoinType.LEFT);
                Join<?, ?> categoryJoin = variantJoin.join("category", JoinType.LEFT);
                predicates.add(cb.equal(categoryJoin.get("id"), filter.getCategoryId()));
            }

            // Stock status filter (via variants) - LEFT JOIN
            if (filter.getStockStatus() != null && !filter.getStockStatus().isEmpty()) {
                Join<Product, ?> variantJoin = root.join("variants", JoinType.LEFT);
                predicates.add(cb.equal(variantJoin.get("stockStatus"), filter.getStockStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

#### Task 16.3: Update ProductAdminService.getProducts() để sử dụng optimized query

```java
public Page<ProductListResponseDTO> getProducts(ProductFilterDTO filter) {
    // Build specification
    Specification<Product> spec = ProductSpecification.buildSpecification(filter);

    // Build pageable
    Sort sort = buildSort(filter.getSortBy(), filter.getDirection());
    Pageable pageable = PageRequest.of(
        filter.getPage() != null ? filter.getPage() : 0,
        filter.getSize() != null ? filter.getSize() : 20,
        sort
    );

    // ⚠️ OPTIMIZED: Sử dụng findAllWithDetails để tránh N+1 query
    Page<Product> products = productRepository.findAllWithDetails(spec, pageable);

    // Map to DTOs - Đảm bảo không trigger lazy loading
    return products.map(this::mapToProductListResponseDTO);
}

private ProductListResponseDTO mapToProductListResponseDTO(Product product) {
    // ⚠️ CRITICAL: Chỉ access các fields đã được fetch sẵn
    // variants và brand đã được eager fetch, không trigger lazy loading

    // Calculate variant count (đã fetch sẵn)
    int variantCount = product.getVariants() != null ? product.getVariants().size() : 0;

    // Calculate total stock (variants đã fetch sẵn)
    int totalStock = product.getVariants() != null ?
        product.getVariants().stream()
            .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
            .sum() : 0;

    // Calculate stock status (variants đã fetch sẵn)
    String stockStatus = calculateStockStatus(product.getVariants());

    // Get primary image (images được fetch bằng @BatchSize, không trigger N+1)
    String primaryImageUrl = null;
    if (product.getImages() != null && !product.getImages().isEmpty()) {
        primaryImageUrl = product.getImages().stream()
            .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
            .findFirst()
            .map(ProductImage::getImageUrl)
            .orElse(null);

        // Fallback to first image if no primary
        if (primaryImageUrl == null) {
            primaryImageUrl = product.getImages().get(0).getImageUrl();
        }
    }

    // Brand đã được eager fetch
    String brandName = product.getBrand() != null ? product.getBrand().getName() : null;
    Long brandId = product.getBrand() != null ? product.getBrand().getId() : null;

    return ProductListResponseDTO.builder()
        .id(product.getId())
        .name(product.getName())
        .brandId(brandId)
        .brandName(brandName)
        .status(product.getStatus().name())
        .primaryImageUrl(primaryImageUrl)
        .variantCount(variantCount)
        .totalStock(totalStock)
        .stockStatus(stockStatus)
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .build();
}

private String calculateStockStatus(List<ProductVariant> variants) {
    if (variants == null || variants.isEmpty()) {
        return "OUT_OF_STOCK";
    }

    boolean hasInStock = variants.stream()
        .anyMatch(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0);

    boolean hasLowStock = variants.stream()
        .anyMatch(v -> {
            if (v.getStockQuantity() == null || v.getLowStockThreshold() == null) {
                return false;
            }
            return v.getStockQuantity() > 0 && v.getStockQuantity() <= v.getLowStockThreshold();
        });

    if (!hasInStock) {
        return "OUT_OF_STOCK";
    }

    if (hasLowStock) {
        return "LOW_STOCK";
    }

    return "IN_STOCK";
}
```

#### Task 17.1: Thêm @Version vào Product entity

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/entity/Product.java`

```java
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"brand", "createdBy", "updatedBy", "variants", "images", "seoUrls"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // ... existing fields ...

    /**
     * Optimistic Locking - Version field để tránh concurrent update conflicts
     *
     * Cơ chế hoạt động:
     * - Mỗi lần update, Hibernate tự động tăng version
     * - Khi update, Hibernate check version trong WHERE clause
     * - Nếu version không khớp -> OptimisticLockingFailureException
     *
     * Usage:
     * - Frontend gửi version trong update request
     * - Backend check version trước khi update
     * - Nếu version khác -> báo lỗi "Product đã được cập nhật bởi người khác"
     */
    @Version
    @Column(name = "version")
    private Long version;

    // ... rest of fields ...
}
```

#### Task 17.2: Thêm @Version vào ProductVariant entity

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/entity/ProductVariant.java`

```java
@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_variants_cached_attributes_gin", columnList = "cached_attributes")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"product", "category", "concentration", "createdBy", "updatedBy", "images"})
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // ... existing fields ...

    /**
     * Optimistic Locking - Version field để tránh concurrent update conflicts
     */
    @Version
    @Column(name = "version")
    private Long version;

    // ... rest of fields ...
}
```

#### Task 17.3: Update ProductUpdateRequestDTO để include version

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/ProductUpdateRequestDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequestDTO {

    // ... existing fields ...

    /**
     * Version field cho Optimistic Locking
     * Frontend phải gửi version hiện tại khi update
     */
    @NotNull(message = "Version không được để trống")
    private Long version;

    // ... rest of fields ...
}
```

#### Task 17.4: Update VariantUpdateRequestDTO để include version

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/dto/VariantUpdateRequestDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantUpdateRequestDTO {

    // ... existing fields ...

    /**
     * Version field cho Optimistic Locking
     */
    @NotNull(message = "Version không được để trống")
    private Long version;

    // ... rest of fields ...
}
```

#### Task 17.5: Handle OptimisticLockingFailureException trong service

**File**: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/ProductAdminService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductAdminService {

    // ... existing code ...

    /**
     * Update Product với Optimistic Locking
     */
    public ProductDetailDTO updateProduct(Long id, ProductUpdateRequestDTO requestDTO) {
        log.info("Updating Product ID: {}", id);

        // Load product với version check
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        // ⚠️ CRITICAL: Check version để tránh concurrent update
        if (!product.getVersion().equals(requestDTO.getVersion())) {
            throw new OptimisticLockingFailureException(
                "Product đã được cập nhật bởi người khác. Vui lòng refresh và thử lại."
            );
        }

        // Update fields
        product.setName(requestDTO.getName());
        product.setStatus(Product.Status.valueOf(requestDTO.getStatus()));
        // ... update other fields ...

        // Save - Hibernate sẽ tự động tăng version
        product = productRepository.save(product);

        // Map to DTO
        return productMapper.toDetailDTO(product);
    }

    /**
     * Update Variant với Optimistic Locking
     */
    public ProductVariantDTO updateVariant(
        Long productId,
        Long variantId,
        VariantUpdateRequestDTO requestDTO
    ) {
        // Load variant
        ProductVariant variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

        // Validate product match
        if (!variant.getProduct().getId().equals(productId)) {
            throw new IllegalArgumentException("Variant không thuộc product này");
        }

        // ⚠️ CRITICAL: Check version
        if (!variant.getVersion().equals(requestDTO.getVersion())) {
            throw new OptimisticLockingFailureException(
                "Variant đã được cập nhật bởi người khác. Vui lòng refresh và thử lại."
            );
        }

        // Update fields
        variant.setVariantName(requestDTO.getVariantName());
        variant.setPrice(requestDTO.getPrice());
        // ... update other fields ...

        // Save - Hibernate sẽ tự động tăng version
        variant = variantRepository.save(variant);

        // Map to DTO
        return productVariantMapper.toDTO(variant);
    }
}
```

#### Task 17.6: Handle exception trong GlobalExceptionHandler

**File**: `src/main/java/com/orchard/orchard_store_backend/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ... existing handlers ...

    /**
     * Handle OptimisticLockingFailureException
     */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLockingFailure(
        OptimisticLockingFailureException ex
    ) {
        log.warn("Optimistic locking failure: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(
                HttpStatus.CONFLICT.value(),
                ex.getMessage() != null ? ex.getMessage() :
                    "Dữ liệu đã được cập nhật bởi người khác. Vui lòng refresh và thử lại."
            ));
    }
}
```

#### Task 16.4 & 16.5: Performance Testing

**File**: `src/test/java/com/orchard/orchard_store_backend/modules/catalog/product/ProductPerformanceTest.java`

```java
@SpringBootTest
@Transactional
class ProductPerformanceTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductAdminService productAdminService;

    @Test
    void testGetProducts_NoNPlusOneQuery() {
        // Given
        ProductFilterDTO filter = ProductFilterDTO.builder()
            .page(0)
            .size(20)
            .build();

        // When
        long startTime = System.currentTimeMillis();
        Page<ProductListResponseDTO> products = productAdminService.getProducts(filter);
        long endTime = System.currentTimeMillis();

        // Then
        assertNotNull(products);
        assertTrue(products.getContent().size() > 0);

        // Verify execution time (should be < 500ms for 20 products)
        long executionTime = endTime - startTime;
        log.info("Execution time: {} ms", executionTime);
        assertTrue(executionTime < 500, "Query took too long: " + executionTime + "ms");

        // Verify no lazy loading exceptions
        products.getContent().forEach(product -> {
            assertNotNull(product.getBrandName()); // Brand should be loaded
            assertNotNull(product.getVariantCount()); // Variants should be loaded
        });
    }

    @Test
    void testConcurrentUpdate_OptimisticLocking() {
        // Given
        Product product = createTestProduct();
        Long productId = product.getId();
        Long initialVersion = product.getVersion();

        // When - Simulate concurrent update
        ProductUpdateRequestDTO request1 = ProductUpdateRequestDTO.builder()
            .name("Updated Name 1")
            .version(initialVersion)
            .build();

        ProductUpdateRequestDTO request2 = ProductUpdateRequestDTO.builder()
            .name("Updated Name 2")
            .version(initialVersion) // Same version
            .build();

        // First update succeeds
        productAdminService.updateProduct(productId, request1);

        // Second update should fail with OptimisticLockingFailureException
        assertThrows(OptimisticLockingFailureException.class, () -> {
            productAdminService.updateProduct(productId, request2);
        });
    }
}
```

```java
@Transactional
public void bulkUpdateStatus(List<Long> productIds, String status) {
    if (productIds == null || productIds.isEmpty()) {
        throw new IllegalArgumentException("Danh sách product IDs không được để trống");
    }

    // Validate status
    try {
        Product.Status.valueOf(status);
    } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Status không hợp lệ: " + status);
    }

    // Update all products
    List<Product> products = productRepository.findAllById(productIds);

    if (products.size() != productIds.size()) {
        throw new ResourceNotFoundException("Một số products không tồn tại");
    }

    products.forEach(product -> {
        product.setStatus(Product.Status.valueOf(status));
        if (status.equals("ARCHIVED")) {
            product.setArchivedAt(LocalDateTime.now());
        } else if (status.equals("PUBLISHED")) {
            product.setPublishedAt(LocalDateTime.now());
        }
    });

    productRepository.saveAll(products);

    log.info("Updated status to {} for {} products", status, products.size());
}
```

---

## 5. Testing Strategy

### 5.1. Unit Tests

#### ProductAdminService Tests

```java
@ExtendWith(MockitoExtension.class)
class ProductAdminServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private ProductAdminService productAdminService;

    @Test
    void testGetProducts_withFilters() {
        // Given
        ProductFilterDTO filter = ProductFilterDTO.builder()
            .keyword("test")
            .status("ACTIVE")
            .page(0)
            .size(20)
            .build();

        // When
        Page<ProductListResponseDTO> result = productAdminService.getProducts(filter);

        // Then
        assertNotNull(result);
        // Add more assertions
    }

    // More test methods...
}
```

### 5.2. Integration Tests

#### ProductAdminController Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductAdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testGetProducts() throws Exception {
        // Given
        // Create test data

        // When & Then
        mockMvc.perform(get("/api/admin/products")
                .param("keyword", "test")
                .param("status", "ACTIVE")
                .header("Authorization", "Bearer " + getAdminToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    // More test methods...
}
```

---

## 6. API Documentation

### 6.1. Products Endpoints

#### GET /api/admin/products

**Description**: Lấy danh sách products với filters

**Query Parameters**:

- `keyword` (optional): Search name, SKU
- `status` (optional): DRAFT, PUBLISHED, ARCHIVED
- `brandId` (optional): Filter by brand
- `categoryId` (optional): Filter by category
- `stockStatus` (optional): IN_STOCK, OUT_OF_STOCK, LOW_STOCK
- `sortBy` (optional, default: "createdAt"): name, createdAt, price, stock
- `direction` (optional, default: "DESC"): ASC, DESC
- `page` (optional, default: 0): Page number (0-based)
- `size` (optional, default: 20): Page size

**Response**: `ApiResponse<Page<ProductListResponseDTO>>`

#### GET /api/admin/products/{id}

**Description**: Lấy chi tiết product

**Response**: `ApiResponse<ProductDetailDTO>`

### 6.2. Variants Endpoints

#### GET /api/admin/products/{productId}/variants

**Description**: Lấy danh sách variants của product

**Response**: `ApiResponse<List<ProductVariantDTO>>`

#### POST /api/admin/products/{productId}/variants

**Description**: Tạo variant mới

**Request Body**: `VariantCreateRequestDTO`

**Response**: `ApiResponse<ProductVariantDTO>`

#### PUT /api/admin/products/{productId}/variants/{variantId}

**Description**: Cập nhật variant

**Request Body**: `VariantUpdateRequestDTO`

**Response**: `ApiResponse<ProductVariantDTO>`

#### DELETE /api/admin/products/{productId}/variants/{variantId}

**Description**: Xóa variant

**Response**: `ApiResponse<Void>`

#### PATCH /api/admin/products/{productId}/variants/{variantId}/set-default

**Description**: Set variant làm default

**Response**: `ApiResponse<Void>`

### 6.3. Images Endpoints

#### GET /api/admin/products/{productId}/images

**Description**: Lấy danh sách images của product

**Query Parameters**:

- `variantId` (optional): Filter by variant

**Response**: `ApiResponse<List<ProductImageDTO>>`

#### POST /api/admin/products/{productId}/images

**Description**: Upload image mới

**Content-Type**: `multipart/form-data`

**Form Data**:

- `file` (required): Image file
- `altText` (optional): Alt text
- `isPrimary` (optional): Boolean
- `displayOrder` (optional): Integer
- `variantId` (optional): Long

**Response**: `ApiResponse<ProductImageDTO>`

#### PUT /api/admin/products/{productId}/images/{imageId}

**Description**: Cập nhật image (reorder, set primary, etc.)

**Request Body**: `ImageUpdateRequestDTO`

**Response**: `ApiResponse<ProductImageDTO>`

#### DELETE /api/admin/products/{productId}/images/{imageId}

**Description**: Xóa image

**Response**: `ApiResponse<Void>`

#### PATCH /api/admin/products/{productId}/images/reorder

**Description**: Reorder images

**Request Body**: `{ "imageIds": [1, 2, 3, ...] }`

**Response**: `ApiResponse<Void>`

#### PATCH /api/admin/products/{productId}/images/{imageId}/set-primary

**Description**: Set image làm primary

**Response**: `ApiResponse<Void>`

### 6.4. Specifications Endpoints

#### GET /api/admin/products/{productId}/specifications

**Description**: Lấy danh sách specifications

**Response**: `ApiResponse<List<ProductSpecificationDTO>>`

#### POST /api/admin/products/{productId}/specifications

**Description**: Tạo specification mới

**Request Body**: `SpecificationCreateRequestDTO`

**Response**: `ApiResponse<ProductSpecificationDTO>`

#### PUT /api/admin/products/{productId}/specifications/{specId}

**Description**: Cập nhật specification

**Request Body**: `SpecificationUpdateRequestDTO`

**Response**: `ApiResponse<ProductSpecificationDTO>`

#### DELETE /api/admin/products/{productId}/specifications/{specId}

**Description**: Xóa specification

**Response**: `ApiResponse<Void>`

#### PATCH /api/admin/products/{productId}/specifications/reorder

**Description**: Reorder specifications

**Request Body**: `{ "specificationIds": [1, 2, 3, ...] }`

**Response**: `ApiResponse<Void>`

### 6.5. Stock Endpoints

#### GET /api/admin/products/{productId}/variants/{variantId}/stock

**Description**: Lấy stock của variant (per warehouse)

**Response**: `ApiResponse<List<WarehouseStockDTO>>`

#### POST /api/admin/products/{productId}/variants/{variantId}/stock

**Description**: Cập nhật stock với Transaction Model (thay vì "set", dùng "change")

**Request Body**: `InventoryTransactionRequestDTO`

```json
{
  "quantity": 10, // Số lượng thay đổi (có thể âm hoặc dương)
  "transactionType": "IN", // IN, OUT, ADJUSTMENT, RETURN, DAMAGED, RESERVE, RELEASE
  "warehouseId": 1, // Optional
  "reason": "Nhập hàng từ nhà cung cấp",
  "referenceType": "PURCHASE_ORDER", // Optional
  "referenceId": 123, // Optional
  "notes": "Ghi chú thêm"
}
```

**Response**: `ApiResponse<WarehouseStockDTO>`

**Note**:

- `quantity` là số lượng thay đổi, không phải số lượng cuối cùng
- Ví dụ: stock hiện tại = 100, quantity = 10 -> stock sau = 110
- Ví dụ: stock hiện tại = 100, quantity = -5 -> stock sau = 95
- System tự động tính `stockBefore` và `stockAfter`
- Tạo record trong `inventory_transactions` để track lịch sử

#### GET /api/admin/products/{productId}/variants/{variantId}/stock-history

**Description**: Lấy lịch sử giao dịch kho

**Query Parameters**:

- `page` (optional, default: 0): Page number
- `size` (optional, default: 20): Page size

**Response**: `ApiResponse<Page<StockHistoryResponseDTO>>`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy lịch sử kho thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "productVariantId": 123,
        "variantName": "Variant 1",
        "sku": "PROD-001",
        "transactionType": "IN",
        "quantity": 10,
        "stockBefore": 90,
        "stockAfter": 100,
        "referenceType": "PURCHASE_ORDER",
        "referenceId": 456,
        "reason": "Nhập hàng từ nhà cung cấp",
        "notes": "Ghi chú",
        "warehouseId": 1,
        "warehouseName": "Kho Hà Nội",
        "createdBy": 1,
        "createdByName": "Admin User",
        "createdAt": "2024-01-15T10:30:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "size": 20,
    "number": 0
  }
}
```

### 6.6. Bulk Operations Endpoints

#### POST /api/admin/products/bulk-status

**Description**: Bulk update status

**Request Body**:

```json
{
  "productIds": [1, 2, 3],
  "status": "PUBLISHED"
}
```

**Response**: `ApiResponse<Void>`

#### POST /api/admin/products/bulk-delete

**Description**: Bulk delete products

**Request Body**:

```json
{
  "productIds": [1, 2, 3]
}
```

**Response**: `ApiResponse<Void>`

---

## 7. Checklist Summary

### Phase 1: Products List & Detail

- [ ] ProductListResponseDTO
- [ ] ProductFilterDTO
- [ ] ProductSpecification (JPA)
- [ ] getProducts() service method
- [ ] getProductDetail() service method
- [ ] GET /api/admin/products endpoint
- [ ] GET /api/admin/products/{id} endpoint

### Phase 2: Variants Management

- [ ] VariantCreateRequestDTO
- [ ] VariantUpdateRequestDTO
- [ ] Variants CRUD service methods
- [ ] setDefaultVariant() service method
- [ ] Variants CRUD endpoints

### Phase 3: Images Management

- [ ] ImageCreateRequestDTO
- [ ] ImageUpdateRequestDTO
- [ ] Images CRUD service methods
- [ ] reorderImages() service method
- [ ] setPrimaryImage() service method
- [ ] Images CRUD endpoints

### Phase 4: Specifications Management

- [ ] SpecificationCreateRequestDTO
- [ ] SpecificationUpdateRequestDTO
- [ ] Specifications CRUD service methods
- [ ] reorderSpecifications() service method
- [ ] Specifications CRUD endpoints

### Phase 5: Stock Management với Inventory Transactions

- [ ] Review/Update InventoryTransaction entity
- [ ] InventoryTransactionRequestDTO
- [ ] StockHistoryResponseDTO
- [ ] Stock management service methods (Transaction model)
- [ ] getStockHistory() service method
- [ ] Stock endpoints (GET stock, POST stock transaction, GET stock-history)

### Phase 6: Bulk Operations

- [ ] BulkStatusUpdateRequestDTO
- [ ] BulkDeleteRequestDTO
- [ ] Bulk operations service methods
- [ ] Bulk operations endpoints

### Phase 7: Business Logic Refinements

- [ ] Enhance slug generation (Product + Variant name)
- [ ] Slug uniqueness với suffix counter
- [ ] Image cleanup khi delete (physical file deletion)
- [ ] Product delete với image cleanup
- [ ] Attribute vs Specification clarification
- [ ] Validation rules cho Attributes
- [ ] Validation rules cho Specifications

### Phase 8: Performance Optimization & Concurrency

- [ ] Fix N+1 Query trong ProductRepository
- [ ] Fix ProductSpecification với distinct
- [ ] Update ProductListResponseDTO mapper
- [ ] Thêm @Version vào Product entity
- [ ] Thêm @Version vào ProductVariant entity
- [ ] Update DTOs để include version
- [ ] Handle OptimisticLockingFailureException
- [ ] Performance testing

### Phase 8: Testing & Documentation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance tests
- [ ] API documentation
- [ ] Code review & cleanup

---

**Estimated Total Time**: 2-3 weeks (80-120 hours)

**Note**: Phase 7 (Performance Optimization) có thể được thực hiện song song với các phases khác hoặc sau khi hoàn thành Phase 1-6.

**Priority**: High

**Dependencies**:

- Database schema đã sẵn sàng ✅
- Image upload service đã sẵn sàng ✅
- Basic entities đã sẵn sàng ✅

---

**Last Updated**: 2024  
**Status**: Planning
