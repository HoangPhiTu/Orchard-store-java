# 📚 Tài Liệu Kỹ Thuật - Orchard Store

Tài liệu kỹ thuật chi tiết cho Orchard Store E-Commerce Platform.

---

## 📋 Mục Lục

- [Bean Validation](#-bean-validation)
- [Module hóa & Mapper Layer](#-module-hóa--mapper-layer)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Backend Status & Modules](#-backend-status--modules)
- [Product Features Review](#-product-features-review)
- [Admin Authentication Features](#-admin-authentication-features)

---

## ✅ Bean Validation

### 🎯 Bean Validation Là Gì?

**Bean Validation** (Jakarta Bean Validation) là một framework Java để **validate dữ liệu tự động** trước khi xử lý business logic. Thay vì viết code kiểm tra thủ công, bạn chỉ cần thêm **annotations** vào các field trong DTO.

---

### ❓ Tại Sao Cần Bean Validation?

#### **Vấn Đề Khi KHÔNG Có Validation:**

```java
// ❌ Code cũ - Phải kiểm tra thủ công
@PostMapping("/api/brands")
public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandDTO) {
    // Phải kiểm tra từng field
    if (brandDTO.getName() == null || brandDTO.getName().trim().isEmpty()) {
        return ResponseEntity.badRequest().body("Tên không được để trống");
    }
    if (brandDTO.getName().length() < 2 || brandDTO.getName().length() > 255) {
        return ResponseEntity.badRequest().body("Tên phải từ 2-255 ký tự");
    }
    // ... và còn nhiều nữa
    
    return brandService.createBrand(brandDTO);
}
```

**Nhược điểm:**
- ❌ Code dài dòng, khó maintain
- ❌ Dễ quên kiểm tra một số field
- ❌ Lỗi không nhất quán
- ❌ Khó tái sử dụng

#### **Giải Pháp Với Bean Validation:**

```java
// ✅ Code mới - Validation tự động
@PostMapping("/api/brands")
public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandDTO brandDTO) {
    // Validation đã được xử lý tự động!
    // Nếu không hợp lệ, sẽ throw MethodArgumentNotValidException
    // và GlobalExceptionHandler sẽ xử lý
    return brandService.createBrand(brandDTO);
}
```

**Ưu điểm:**
- ✅ Code ngắn gọn, dễ đọc
- ✅ Validation tự động, không thể quên
- ✅ Thông báo lỗi nhất quán
- ✅ Dễ tái sử dụng

---

### 📋 Các Annotation Validation Phổ Biến

#### 1. **@NotBlank** - Không được để trống (String)

```java
@NotBlank(message = "Tên thương hiệu không được để trống")
private String name;
```

**Kiểm tra:**
- ✅ Không null
- ✅ Không phải chuỗi rỗng ""
- ✅ Không phải chuỗi chỉ có khoảng trắng "   "

---

#### 2. **@NotNull** - Không được null (Object)

```java
@NotNull(message = "Brand ID không được để trống")
@Positive(message = "Brand ID phải là số dương")
private Long brandId;
```

---

#### 3. **@Size** - Kiểm tra độ dài

```java
@Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
private String name;
```

---

#### 4. **@Pattern** - Kiểm tra regex

```java
@Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", 
         message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
private String slug;
```

---

#### 5. **@Min / @Max** - Kiểm tra số nguyên

```java
@Min(value = 0, message = "Số lượng tồn kho phải >= 0")
@Max(value = 10000, message = "Ngưỡng tồn kho thấp phải <= 10000")
private Integer stockQuantity;
```

---

#### 6. **@DecimalMin / @DecimalMax** - Kiểm tra số thập phân

```java
@DecimalMin(value = "0.0", inclusive = true, message = "Giá gốc phải >= 0")
@Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ")
private BigDecimal basePrice;
```

---

#### 7. **@Digits** - Kiểm tra số chữ số

```java
@Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ")
private BigDecimal price;
```

---

#### 8. **@Positive / @Negative** - Số dương/âm

```java
@Positive(message = "Brand ID phải là số dương")
private Long brandId;
```

---

#### 9. **@Email** - Kiểm tra email

```java
@Email(message = "Email không hợp lệ")
private String email;
```

---

#### 10. **@Valid** - Validate nested objects

```java
@Valid
@Builder.Default
private List<ProductImageDTO> images = new ArrayList<>();
```

---

### 🔄 Workflow Validation

```
1. Client gửi POST /api/brands với dữ liệu không hợp lệ
2. Spring nhận request → Parse JSON → Tạo BrandDTO object
3. Spring kiểm tra @Valid annotation → Gọi Bean Validation framework
4. Validation framework kiểm tra từng field
5. Nếu có lỗi → Throw MethodArgumentNotValidException
6. GlobalExceptionHandler bắt exception → Tạo error response
7. Trả về cho client với chi tiết lỗi theo từng field
```

---

### 📝 Ví Dụ Response Khi Validation Fail

```json
{
  "timestamp": "2024-01-20T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường sau:",
  "errors": {
    "name": "Tên thương hiệu không được để trống",
    "slug": "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    "basePrice": "Giá gốc phải >= 0"
  }
}
```

---

### 🎯 Lợi Ích

1. **Bảo Mật**: Ngăn chặn SQL Injection, XSS, invalid data
2. **Data Integrity**: Đảm bảo dữ liệu đúng format trước khi lưu
3. **User Experience**: Thông báo lỗi rõ ràng, dễ hiểu
4. **Developer Experience**: Code ngắn gọn, dễ maintain

---

### ✅ Đã Implement

- ✅ BrandDTO - Validate name, slug, URLs, status
- ✅ CategoryDTO - Validate name, slug, URLs, status
- ✅ ProductDTO - Validate name, slug, prices, brandId, categoryId
- ✅ ProductVariantDTO - Validate SKU, price, stock, dimensions
- ✅ ProductImageDTO - Validate imageUrl, displayOrder
- ✅ GlobalExceptionHandler - Xử lý validation errors
- ✅ MapStruct mappers cho Auth/Catalog (User, Brand, Category, Product, Variant, Image)

---

## 🧱 Module hóa & Mapper Layer

- **modules/auth/**: AuthController, LoginHistory, PasswordReset, Email service.
- **modules/catalog/**: `brand/`, `category/`, `product/` - mỗi domain có controller, service, repository, DTO, mapper riêng.
- **MapStruct**:
  - Ánh xạ Entity ↔ DTO (`UserMapper`, `BrandMapper`, `CategoryMapper`, `ProductMapper`, ...)
  - Hỗ trợ update entity qua `@MappingTarget` (Product update form).
  - Giảm code lặp và giúp dễ tách microservice sau này.

### 🔌 Service Layer Abstractions

- Mỗi domain có **interface `Service`** + **`ServiceImpl`** (ví dụ: `AuthService` + `AuthServiceImpl`).
- Controllers, schedulers, và các bean khác chỉ inject interface → dễ unit test/mock.
- `PasswordResetTokenCleanupJob` và các tác vụ nền khác luôn làm việc qua interface nên không phụ thuộc implementation cụ thể.
- Chuẩn bị nền tảng cho bước kế tiếp: tạo test skeleton theo module và mock service dễ dàng.

---

## 🗄️ Database Schema

Xem chi tiết tại: **[DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**

### Tổng Quan

- **38 tables** bao gồm:
  - Core entities (Brands, Categories, Products)
  - Dynamic attributes system
  - Inventory intelligence
  - Product bundling
  - Analytics & SEO
  - VIP customer system
  - Order management

### Đặc Điểm

- ✅ Simplified Authentication (khách hàng không cần đăng ký)
- ✅ VIP Customer System (tự động nâng cấp tier)
- ✅ Email Verification cho orders
- ✅ Database functions & triggers tự động

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

#### Admin/Staff Authentication
- ✅ **JWT Authentication** đã implement
- ✅ Token-based authentication
- ✅ Role-based access control (ADMIN, STAFF)
- ✅ Remember Me support (30 ngày token)
- ✅ Account lockout mechanism

#### Customer Authentication
- **Không cần đăng ký**: Khách hàng không cần tạo tài khoản
- **Email Verification**: Xác thực đơn hàng qua email với verification code
- **Order Tracking**: Tra cứu đơn hàng bằng verification_code + email

### API Endpoints Summary

#### 🔐 Authentication & Authorization

**Base Path:** `/api/auth`

- `POST /api/auth/login` - Đăng nhập (Admin/Staff)
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu (gửi email)
- `POST /api/auth/reset-password` - Reset mật khẩu bằng token

#### 📦 Product Catalog

**Base Path:** `/api/products`

**Public Endpoints:**
- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, filter)
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm theo ID
- `GET /api/products/slug/{slug}` - Lấy chi tiết sản phẩm theo slug
- `GET /api/products/featured` - Lấy sản phẩm nổi bật
- `GET /api/products/new` - Lấy sản phẩm mới
- `GET /api/products/bestseller` - Lấy sản phẩm bán chạy
- `GET /api/products/brand/{brandId}` - Lấy sản phẩm theo brand
- `GET /api/products/search` - Tìm kiếm sản phẩm

**Admin Endpoints:**
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm

#### 🏷️ Brands

**Base Path:** `/api/brands`

- `GET /api/brands` - Lấy danh sách brands
- `GET /api/brands/{id}` - Lấy chi tiết brand
- `POST /api/brands` - Tạo brand mới (Admin)
- `PUT /api/brands/{id}` - Cập nhật brand (Admin)
- `DELETE /api/brands/{id}` - Xóa brand (Admin)

#### 📂 Categories

**Base Path:** `/api/categories`

- `GET /api/categories` - Lấy danh sách categories (hierarchical)
- `GET /api/categories/{id}` - Lấy chi tiết category
- `GET /api/categories/slug/{slug}` - Lấy category theo slug
- `POST /api/categories` - Tạo category mới (Admin)
- `PUT /api/categories/{id}` - Cập nhật category (Admin)
- `DELETE /api/categories/{id}` - Xóa category (Admin)

#### 🏷️ Product Attributes (Dynamic Attributes System)

**Base Path:** `/api/admin/attributes`

**Product Attributes:**
- `GET /api/admin/attributes` - Lấy danh sách attributes
- `GET /api/admin/attributes/{id}` - Lấy chi tiết attribute
- `POST /api/admin/attributes` - Tạo attribute mới
- `PUT /api/admin/attributes/{id}` - Cập nhật attribute
- `DELETE /api/admin/attributes/{id}` - Xóa attribute

**Attribute Values:**
- `GET /api/admin/attributes/{attributeId}/values` - Lấy danh sách values của attribute
- `POST /api/admin/attributes/{attributeId}/values` - Tạo value mới
- `PUT /api/admin/attributes/{attributeId}/values/{valueId}` - Cập nhật value
- `DELETE /api/admin/attributes/{attributeId}/values/{valueId}` - Xóa value

**Category Attributes:**
- `GET /api/admin/category-attributes` - Lấy danh sách category attributes
- `GET /api/admin/category-attributes/category/{categoryId}` - Lấy attributes của category
- `POST /api/admin/category-attributes` - Gán attribute cho category
- `DELETE /api/admin/category-attributes/{id}` - Xóa category attribute

**Product Attribute Values:**
- `GET /api/admin/products/{productId}/attributes` - Lấy attributes của sản phẩm
- `POST /api/admin/products/{productId}/attributes` - Gán attribute value cho sản phẩm/variant
- `PUT /api/admin/products/{productId}/attributes/{id}` - Cập nhật attribute value
- `DELETE /api/admin/products/{productId}/attributes/{id}` - Xóa attribute value

#### 💰 Product Price History

**Base Path:** `/api/admin/price-history` (Admin only)

- `POST /api/admin/price-history` - Tạo lịch sử giá mới
- `GET /api/admin/price-history/variant/{variantId}` - Lấy lịch sử giá theo variant (phân trang)
- `GET /api/admin/price-history/variant/{variantId}/all` - Lấy tất cả lịch sử giá
- `GET /api/admin/price-history/variant/{variantId}/current` - Lấy giá hiện tại
- `GET /api/admin/price-history/variant/{variantId}/range` - Lấy giá trong khoảng thời gian
- `GET /api/admin/price-history/promotion/{promotionId}` - Lấy lịch sử giá theo promotion
- `GET /api/admin/price-history/change-type/{changeType}` - Lấy lịch sử giá theo loại thay đổi
- `DELETE /api/admin/price-history/{id}` - Xóa lịch sử giá

#### ⭐ Product Reviews

**Base Path:** `/api/reviews`

**Public Endpoints:**
- `POST /api/reviews` - Tạo review mới
- `GET /api/reviews/{id}` - Lấy review theo ID
- `GET /api/reviews/product/{productId}` - Lấy reviews theo product (phân trang)
- `GET /api/reviews/product/{productId}/all` - Lấy tất cả reviews
- `GET /api/reviews/product/{productId}/rating/{rating}` - Lấy reviews theo rating
- `GET /api/reviews/product/{productId}/verified` - Lấy verified reviews
- `GET /api/reviews/product/{productId}/average-rating` - Tính rating trung bình
- `GET /api/reviews/product/{productId}/count` - Đếm số reviews
- `POST /api/reviews/{reviewId}/helpful` - Đánh dấu review hữu ích
- `POST /api/reviews/{reviewId}/report` - Báo cáo review

**Admin Endpoints:**
- `PUT /api/reviews/{id}` - Cập nhật review
- `DELETE /api/reviews/{id}` - Xóa review
- `POST /api/reviews/{id}/approve` - Duyệt review
- `POST /api/reviews/{id}/reject` - Từ chối review
- `POST /api/reviews/{id}/hide` - Ẩn review
- `GET /api/reviews/pending` - Lấy reviews cần moderation (Admin, có phân trang)

#### 🎁 Product Bundling

**Base Path:** `/api/admin/bundles` (Admin only)

- `POST /api/admin/bundles` - Tạo bundle mới
- `GET /api/admin/bundles/{id}` - Lấy bundle theo ID
- `GET /api/admin/bundles/slug/{slug}` - Lấy bundle theo slug
- `GET /api/admin/bundles` - Lấy tất cả bundles (có phân trang, filter theo status)
- `GET /api/admin/bundles/type/{bundleType}` - Lấy bundles theo loại (CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET)
- `GET /api/admin/bundles/active` - Lấy bundles đang active (trong thời gian hiệu lực)
- `GET /api/admin/bundles/active/type/{bundleType}` - Lấy active bundles theo loại
- `GET /api/admin/bundles/top-discount` - Top bundles có discount cao nhất
- `PUT /api/admin/bundles/{id}` - Cập nhật bundle
- `DELETE /api/admin/bundles/{id}` - Xóa bundle
- `POST /api/admin/bundles/{id}/calculate-price` - Tính lại giá bundle dựa trên items

#### 📦 Inventory Management

**Base Path:** `/api/admin/inventory` (Admin only)

**Inventory Transactions:**
- `POST /api/admin/inventory/transactions` - Tạo transaction (nhập/xuất/adjust/reserve)
- `GET /api/admin/inventory/variants/{variantId}/transactions` - Lấy transactions theo variant
- `POST /api/admin/inventory/variants/{variantId}/adjust` - Điều chỉnh stock

**Stock Alerts:**
- `GET /api/admin/inventory/alerts` - Lấy danh sách active stock alerts
- `POST /api/admin/inventory/alerts/{alertId}/resolve` - Resolve alert

**Pre-Orders:**
- `POST /api/pre-orders` - Tạo pre-order (public)
- `GET /api/admin/pre-orders` - Lấy danh sách pre-orders (có filter status)
- `PUT /api/admin/pre-orders/{id}/status` - Cập nhật trạng thái pre-order

#### 📊 Modules Đã Triển Khai

1. ✅ **Authentication & Authorization** - Login, JWT, Password Reset
2. ✅ **Product Catalog** - CRUD Products, Brands, Categories
3. ✅ **Dynamic Attributes System** - Product Attributes, Attribute Values, Category Attributes
4. ✅ **Product Price History** - Lịch sử thay đổi giá
5. ✅ **Product Reviews** - Reviews, Review Images, Review Helpful
6. ✅ **Product Bundling** - Product Bundles, Bundle Items (hoàn chỉnh)
7. ✅ **Inventory Management** - Transactions, Stock Alerts, Pre-Orders

#### ⏳ Modules Chưa Triển Khai

- ⏳ **Orders & Checkout** - Orders, Order Items, Payment
- ⏳ **Customer Management** - Customers, VIP Tiers
- ⏳ **Promotions** - Promotions, Discounts
- ⏳ **Analytics** - Product Views, Sales Reports

#### 🔧 Lưu Ý

- Tất cả endpoints có prefix `/api/admin/*` yêu cầu authentication với role ADMIN hoặc STAFF
- Endpoints public không yêu cầu authentication
- Sử dụng JWT token trong header: `Authorization: Bearer <token>`
- Pagination: sử dụng `page`, `size`, `sort` parameters
- Filter: sử dụng query parameters phù hợp với từng endpoint

---

## 📊 Backend Status & Modules

### ✅ Build Status

- **Compilation**: ✅ SUCCESS
- **Tests**: ✅ PASSED (1 test, 0 failures, 0 errors)
- **Application Startup**: ✅ SUCCESS (có thể chạy được)

### 📦 Modules Đã Triển Khai

#### 1. ✅ Authentication & Authorization
- **Entities**: User, LoginHistory, PasswordResetToken
- **Services**: AuthService, LoginHistoryService, PasswordResetService, EmailService
- **Controllers**: AuthController
- **Features**:
  - ✅ Login với JWT
  - ✅ Account lockout sau 5 lần sai
  - ✅ Forgot/Reset password với email
  - ✅ Password reset token cleanup (scheduled job)
  - ✅ Login history tracking

#### 2. ✅ Product Catalog Core
- **Entities**: Product, ProductVariant, ProductImage, Brand, Category
- **Services**: ProductService, BrandService, CategoryService
- **Controllers**: ProductController, BrandController, CategoryController
- **Features**:
  - ✅ CRUD đầy đủ
  - ✅ Search & Filter
  - ✅ Featured, New, Bestseller products
  - ✅ Hierarchical categories
  - ✅ Product variants & images

#### 3. ✅ Dynamic Attributes System
- **Entities**: ProductAttribute, AttributeValue, CategoryAttribute, ProductAttributeValue
- **Services**: ProductAttributeService, CategoryAttributeService, ProductAttributeValueService
- **Controllers**: ProductAttributeController, CategoryAttributeController, ProductAttributeValueController
- **Features**:
  - ✅ CRUD attributes (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)
  - ✅ Attribute values management
  - ✅ Assign attributes to categories
  - ✅ Assign attribute values to products/variants

#### 4. ✅ Product Price History
- **Entities**: ProductPriceHistory
- **Services**: ProductPriceHistoryService
- **Controllers**: ProductPriceHistoryController
- **Features**:
  - ✅ Track lịch sử thay đổi giá
  - ✅ Tự động record khi giá thay đổi
  - ✅ Query theo variant, promotion, change type
  - ✅ Lấy giá hiện tại, giá trong khoảng thời gian

#### 5. ✅ Product Reviews
- **Entities**: Review, ReviewImage, ReviewHelpful
- **Services**: ReviewService
- **Controllers**: ReviewController
- **Features**:
  - ✅ Tạo review (public)
  - ✅ Review moderation (approve/reject/hide)
  - ✅ Review images
  - ✅ Helpful votes
  - ✅ Report reviews
  - ✅ Auto update product rating
  - ✅ Verified purchase reviews

#### 6. ✅ Inventory Management
- **Entities**: InventoryTransaction, StockAlert, PreOrder
- **Services**: InventoryService, StockAlertService, PreOrderService
- **Controllers**: InventoryTransactionController, StockAlertController, PreOrderAdminController, PreOrderPublicController
- **Features**:
  - ✅ Inventory transactions (IN, OUT, ADJUST, RESERVE, RELEASE)
  - ✅ Auto update stock quantity
  - ✅ Stock alerts (LOW_STOCK, OUT_OF_STOCK)
  - ✅ Pre-orders với auto notification khi restock
  - ✅ Integration với ProductVariant stock

#### 7. ✅ Product Bundling
- **Entities**: ProductBundle, BundleItem
- **Repositories**: ProductBundleRepository, BundleItemRepository
- **DTOs**: ProductBundleDTO, BundleItemDTO
- **Mappers**: ProductBundleMapper, BundleItemMapper
- **Services**: ProductBundleService, ProductBundleServiceImpl
- **Controllers**: ProductBundleController
- **Features**:
  - ✅ CRUD operations cho bundles
  - ✅ Bundle types (CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET)
  - ✅ Bundle items management
  - ✅ Tự động tính giá bundle dựa trên items
  - ✅ Tính discount amount và percentage
  - ✅ Filter theo type, status, active bundles
  - ✅ Top discount bundles

### 🔧 Technical Stack

- **Framework**: Spring Boot 3.5.7
- **Database**: PostgreSQL 17.6
- **ORM**: Hibernate 6.6.33
- **Security**: Spring Security với JWT
- **Mapping**: MapStruct 1.5.5
- **Validation**: Jakarta Bean Validation
- **Build Tool**: Maven

### 📊 Statistics

- **Total Controllers**: 15
- **Total Repositories**: 21
  - Auth: 3 (User, LoginHistory, PasswordResetToken)
  - Catalog: 12 (Product, ProductVariant, ProductImage, Brand, Category, ProductAttribute, AttributeValue, CategoryAttribute, ProductAttributeValue, ProductBundle, BundleItem)
  - Pricing: 1 (ProductPriceHistory)
  - Review: 3 (Review, ReviewImage, ReviewHelpful)
  - Inventory: 3 (InventoryTransaction, StockAlert, PreOrder)

### 🚀 Application Status

- **Compilation**: ✅ SUCCESS
- **Spring Context**: ✅ Loaded successfully
- **Database Connection**: ✅ Connected (PostgreSQL 17.6)
- **JPA Repositories**: ✅ 21 repositories found
- **Beans**: ✅ All beans created successfully
- **Application Startup**: ✅ Can start (có thể chạy được khi continue)

### 🔍 Code Quality

- **Architecture**: ✅ Modular (feature-first)
- **Separation of Concerns**: ✅ Controller → Service → Repository
- **DTO Pattern**: ✅ All endpoints use DTOs
- **Validation**: ✅ Bean Validation on all DTOs
- **Error Handling**: ✅ GlobalExceptionHandler
- **Security**: ✅ JWT authentication, role-based authorization
- **Mapping**: ✅ MapStruct for DTO-Entity conversion
- **Transaction Management**: ✅ @Transactional on services

---

## 📦 Product Features Review

### ✅ Đã Triển Khai Hoàn Chỉnh

#### 1. **Core Product Management** ✅
- ✅ **Product** entity + repository + service + controller
- ✅ **ProductVariant** entity + repository + mapper
- ✅ **ProductImage** entity + repository + mapper
- ✅ CRUD operations đầy đủ
- ✅ Search & Filter (brand, category, price, keyword)
- ✅ Pagination & Sorting
- ✅ Featured/New/Bestseller products
- ✅ Auto-increment viewCount
- ✅ SEO fields (metaTitle, metaDescription, metaKeywords)

#### 2. **Dynamic Attributes System** ✅
- ✅ **ProductAttribute** entity + repository + service + controller
- ✅ **AttributeValue** entity + repository + service
- ✅ **CategoryAttribute** entity + repository + service + controller
- ✅ **ProductAttributeValue** entity + repository + service + controller
- ✅ Integration vào ProductDTO (`attributeValues` list)
- ✅ Support 5 attribute types: SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT

#### 3. **Product Price History** ✅
- ✅ **ProductPriceHistory** entity + repository + service + controller
- ✅ Track lịch sử thay đổi giá
- ✅ Auto record khi giá variant thay đổi
- ✅ Query theo variant, promotion, change type
- ✅ Lấy giá hiện tại, giá trong khoảng thời gian

#### 4. **Product Reviews** ✅
- ✅ **Review** entity + repository + service + controller
- ✅ **ReviewImage** entity + repository + mapper
- ✅ **ReviewHelpful** entity + repository
- ✅ Review moderation (approve/reject/hide)
- ✅ Review images support
- ✅ Helpful votes
- ✅ Report reviews
- ✅ Auto update product rating
- ✅ Verified purchase reviews

#### 5. **Product Bundling** ✅
- ✅ **ProductBundle** entity + repository + service + controller
- ✅ **BundleItem** entity + repository + mapper
- ✅ CRUD operations đầy đủ
- ✅ Auto tính giá bundle và discount
- ✅ 4 bundle types: CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET
- ✅ Filter theo type, status, active bundles

#### 6. **Inventory Intelligence** ✅
- ✅ **InventoryTransaction** entity + repository + service + controller
- ✅ **StockAlert** entity + repository + service + controller
- ✅ **PreOrder** entity + repository + service + controller
- ✅ Real-time stock tracking
- ✅ Auto update stock quantity
- ✅ Stock alerts (LOW_STOCK, OUT_OF_STOCK)
- ✅ Pre-orders với auto notification khi restock
- ✅ Integration vào ProductVariantDTO (`stockStatus` field)

### ⏳ Chưa Triển Khai (Theo Database Schema)

#### 1. **Related Products** (Sản Phẩm Liên Quan) ⏳
- **Mức độ ưu tiên**: ⭐⭐⭐ (Cao - Quan trọng cho e-commerce)
- **Mô tả**: Quản lý sản phẩm liên quan (SAME_BRAND, SAME_FRAGRANCE, SIMILAR, FREQUENTLY_BOUGHT_TOGETHER)

#### 2. **Product Gifts** (Quà Tặng Kèm) ⏳
- **Mức độ ưu tiên**: ⭐⭐ (Trung bình - Có thể làm sau)
- **Mô tả**: Quản lý quà tặng kèm sản phẩm

#### 3. **Product Views** (Analytics - Chi Tiết) ⏳
- **Mức độ ưu tiên**: ⭐ (Thấp - Có thể làm sau, hiện tại đã có viewCount)
- **Mô tả**: Track chi tiết lượt xem (user, session, device, IP, conversion tracking)

#### 4. **Product Specifications** (Thông Số Kỹ Thuật) ⏳
- **Mức độ ưu tiên**: ⭐ (Thấp - Có thể dùng Dynamic Attributes)
- **Mô tả**: Lưu thông số kỹ thuật sản phẩm (key-value pairs)

#### 5. **SEO URLs** (URL Redirects & Canonical) ⏳
- **Mức độ ưu tiên**: ⭐⭐ (Trung bình - Có thể làm sau)
- **Mô tả**: Quản lý URL redirects, canonical URLs cho SEO

#### 6. **Product Member Prices** (Giá VIP) ⏳
- **Mức độ ưu tiên**: ⭐⭐ (Trung bình - Phụ thuộc vào VIP system)
- **Mô tả**: Giá sản phẩm cho từng VIP tier

#### 7. **Product Conversion Tracking** (Analytics) ⏳
- **Mức độ ưu tiên**: ⭐ (Thấp - Analytics, có thể làm sau)
- **Mô tả**: Track conversion từ view → purchase

### 📊 Tổng Kết

- **Đã Hoàn Thành**: 6/13 Modules (46%)
- **Chưa Triển Khai**: 7/13 Modules (54%)

**Khuyến nghị**: Có thể tiếp tục với phần Admin Panel. Các tính năng còn thiếu có thể bổ sung sau khi có UI để test.

---

## 🔐 Admin Authentication Features

### Đã Hoàn Thành

#### 1. **Remember Me**
- Checkbox "Ghi nhớ đăng nhập (30 ngày)" trên login form
- Token expiration: 1 giờ (default) hoặc 30 ngày (rememberMe = true)
- Config: `app.jwt.long-lived.expiration-ms=2592000000`

#### 2. **Change Password**
- Endpoint: `PUT /api/admin/auth/change-password`
- Password strength validation:
  - Tối thiểu 8 ký tự
  - Có chữ hoa, chữ thường, số
- Auto logout sau khi đổi mật khẩu thành công

#### 3. **Account Lockout**
- Sau 5 lần đăng nhập sai → Lock account 30 phút
- Hiển thị số lần thử còn lại
- Tự động reset khi đăng nhập thành công

#### 4. **Login History**
- Tự động lưu lịch sử đăng nhập (thành công/thất bại/khóa)
- Lưu thông tin: IP address, User Agent, Device Type, Browser, OS
- Endpoints:
  - `GET /api/admin/auth/login-history` - Lấy lịch sử với pagination
  - `GET /api/admin/auth/login-history/recent` - 10 lần đăng nhập gần nhất
  - `GET /api/admin/auth/login-history/stats` - Thống kê (số lần thành công/thất bại, lần đăng nhập gần nhất)

#### 5. **Forgot/Reset Password**
- Yêu cầu đặt lại mật khẩu qua email
- Token-based password reset (24h expiration)
- Giới hạn số lần request (5 lần/ngày)
- Frontend pages: Forgot Password, Reset Password
- Scheduled cleanup tự động xóa token hết hạn (`app.password-reset.cleanup-cron`, mặc định mỗi giờ)
- **Lưu ý**: Cần cấu hình email service (Spring Mail, SendGrid, AWS SES, etc.)

### Tính Năng Nâng Cao (Đề Xuất)

#### Priority 2 (Bảo Mật Nâng Cao)
- **Two-Factor Authentication (2FA)**: Xác thực 2 lớp với TOTP
- **Session Management**: Quản lý sessions, logout từ xa
- **IP Whitelist/Blacklist**: Chỉ cho phép IP nhất định
- **Rate Limiting**: Giới hạn số lần thử đăng nhập
- **CAPTCHA**: Xác thực sau nhiều lần thử sai

#### Priority 3 (UX & Management)
- **Email Verification**: Xác thực email cho admin mới
- **Password Strength Indicator**: Hiển thị độ mạnh password
- **Activity Logs**: Ghi lại hoạt động quan trọng
- **Profile Management**: Quản lý thông tin cá nhân
- **Biometric Authentication**: Đăng nhập bằng vân tay/face (optional)

---

**Last Updated**: 2024-12-19

