# 📚 Tài Liệu Kỹ Thuật - Orchard Store

Tài liệu kỹ thuật chi tiết cho Orchard Store E-Commerce Platform.

> **📌 Cấu trúc tài liệu:**
>
> **📝 Bắt đầu từ đây:**
>
> - **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**: ⭐ **ĐỌC TRƯỚC** - Coding standards, việt hóa comment, naming conventions
>
> **📚 Technical Documentation:**
>
> - **DOCUMENTATION.md** (file này): Technical documentation, API reference, best practices
> - **[DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**: Database schema chi tiết, DDL, triggers, functions
> - **[BACKEND_IMPLEMENTATION_STATUS.md](./BACKEND_IMPLEMENTATION_STATUS.md)**: Implementation status, modules, entities, build status
>
> **📋 Planning & Roadmap:**
>
> - **[ROADMAP_ENHANCED.md](./ROADMAP_ENHANCED.md)**: Lộ trình phát triển, phases, milestones
> - **[ADMIN_PANEL_DEVELOPMENT_PLAN.md](./ADMIN_PANEL_DEVELOPMENT_PLAN.md)**: Kế hoạch phát triển Admin Panel frontend

---

## 📋 Mục Lục

### 📝 Standards & Conventions (Đọc Trước)

- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** ⭐ **QUAN TRỌNG** - Coding standards, việt hóa comment, naming conventions, documentation guidelines

### 📚 Technical Documentation

- [Bean Validation](#-bean-validation)
- [Module hóa & Mapper Layer](#-module-hóa--mapper-layer)
- [Product DTOs & MapStruct](#-product-dtos--mapstruct) ⭐ **NEW**
- [Spring Security 6 & JWT Authentication](#-spring-security-6--jwt-authentication) ⭐ **NEW**
- [Repository Layer & Lazy Loading](#-repository-layer--lazy-loading) ⭐ **NEW**
- [Product Admin Service - Business Logic](#-product-admin-service---business-logic) ⭐ **NEW**
- [Product Admin API & Image Upload](#-product-admin-api--image-upload) ⭐ **NEW**
- [Product Store API - Public Endpoints](#-product-store-api---public-endpoints) ⭐ **NEW**
- [Customer Auth - OTP Email (Passwordless)](#-customer-auth---otp-email-passwordless) ⭐ **NEW**
- [Customer Dashboard & Gamification](#-customer-dashboard--gamification) ⭐ **NEW**
- [Cart & Checkout Service](#-cart--checkout-service--new) ⭐ **NEW**
- [JSONB Performance Optimization & Hibernate Configuration](#-jsonb-performance-optimization--hibernate-configuration) ⭐ **ENHANCED**

### 📖 Reference Documentation

- [Database Schema](#-database-schema) - **Xem chi tiết tại [DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**
- [Backend Implementation Status](#-backend-implementation-status) - **Xem chi tiết tại [BACKEND_IMPLEMENTATION_STATUS.md](./BACKEND_IMPLEMENTATION_STATUS.md)**
- [API Documentation](#-api-documentation)
- [Admin Authentication Features](#-admin-authentication-features)

### 📋 Planning & Roadmap

- **[ROADMAP_ENHANCED.md](./ROADMAP_ENHANCED.md)** - Lộ trình phát triển, phases, milestones
- **[ADMIN_PANEL_DEVELOPMENT_PLAN.md](./ADMIN_PANEL_DEVELOPMENT_PLAN.md)** - Kế hoạch phát triển Admin Panel frontend

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
- ✅ Không phải chuỗi chỉ có khoảng trắng " "

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

## 📦 Product DTOs & MapStruct ⭐ NEW

### 🎯 Thiết Kế DTOs

Module Product sử dụng **2-layer DTO architecture** để tối ưu performance và tách biệt concerns:

#### 1. **ProductDTO** - Cho Danh Sách (Listing)

**Mục đích**: Hiển thị danh sách sản phẩm với thông tin tối thiểu

**Fields**:

- Basic info: `id`, `name`, `brandId`, `brandName`, `status`
- Image: `thumbnailUrl`, `primaryImageUrl` (ảnh đại diện)
- Metadata: `publishedAt`, `archivedAt`, `createdAt`, `updatedAt`

**Đặc điểm**:

- ❌ **KHÔNG** chứa `variants`, `images`, `attributeValues` (giảm payload)
- ✅ Chỉ có ảnh đại diện (thumbnail/primary) để hiển thị nhanh
- ✅ Tối ưu cho pagination và listing

**Usage**:

```java
Page<ProductDTO> products = productService.getAllProducts(pageable);
// Mỗi ProductDTO nhẹ, chỉ ~200 bytes thay vì ~5KB với variants
```

#### 2. **ProductDetailDTO** - Cho Chi Tiết (Detail Page)

**Mục đích**: Hiển thị đầy đủ thông tin sản phẩm

**Fields**:

- Tất cả fields từ ProductDTO
- **Relationships**:
  - `variants` (List<ProductVariantDTO>) - Tất cả biến thể
  - `images` (List<ProductImageDTO>) - Tất cả hình ảnh
  - `seoUrls` (List<ProductSeoUrlDTO>) - SEO redirects
- **Calculated Fields** (tự động tính):
  - `totalStock` (Integer) - Tổng tồn kho từ tất cả variants
  - `priceRange` (String) - Chuỗi giá (ví dụ: "1,000,000 - 2,000,000 VND")
  - `minPrice` (BigDecimal) - Giá thấp nhất
  - `maxPrice` (BigDecimal) - Giá cao nhất

**Đặc điểm**:

- ✅ Đầy đủ thông tin cho trang chi tiết
- ✅ Tự động tính toán `totalStock` và `priceRange` qua `@AfterMapping`
- ✅ Ưu tiên `salePrice` nếu có khi tính price range

**Usage**:

```java
ProductDetailDTO detail = productService.getProductDetailById(productId);
// Có đầy đủ: variants, images, seoUrls, totalStock, priceRange
```

#### 3. **ProductVariantDTO** - Biến Thể Sản Phẩm

**Fields**:

- Identification: `id`, `productId`, `sku`, `variantName`, `slug`
- Pricing: `price`, `salePrice`, `costPrice`, `currencyCode`
- Inventory: `stockQuantity`, `reservedQuantity`, `stockStatus`
- Attributes: **`cachedAttributes` (Map<String, Object>)** - JSONB attributes
- Metadata: `status`, `viewCount`, `soldCount`, `createdAt`, `updatedAt`

**Đặc điểm**:

- ✅ Chứa `cachedAttributes` (Map<String, Object>) để hỗ trợ JSONB filtering
- ❌ **KHÔNG** chứa ProductDTO để tránh circular reference
- ✅ MapStruct tự động map JSONB `Map<String, Object>`

#### 4. **ProductSeoUrlDTO** - SEO URLs

**Fields**:

- `id`, `productId`
- `oldSlug`, `newSlug`
- `redirectType` (301/302)
- `redirectCount`
- `createdAt`

### 🔧 MapStruct Configuration

#### ProductMapper

**File**: `ProductMapper.java`

**Methods**:

1. **`toDTO(Product)`** - Map cho listing

   - Sử dụng `@AfterMapping` để set `thumbnailUrl` và `primaryImageUrl`
   - Tự động tìm primary image hoặc dùng image đầu tiên

2. **`toDetailDTO(Product)`** - Map cho detail page

   - Map tất cả relationships: `variants`, `images`, `seoUrls`
   - Sử dụng `@AfterMapping` để tính:
     - `totalStock`: Tổng `stockQuantity` từ tất cả variants
     - `priceRange`: Format chuỗi giá (min - max)
     - `minPrice` và `maxPrice`: Giá thấp nhất/cao nhất (ưu tiên `salePrice`)

3. **`toEntity(ProductDetailDTO)`** - Map từ DTO sang Entity

   - Dùng cho create operations
   - Ignore relationships (handle separately)

4. **`updateProductFromDetailDto()`** - Update entity từ DTO
   - Dùng cho update operations
   - Null-safe với `@BeanMapping`

**Example - @AfterMapping**:

```java
@AfterMapping
default void calculateStockAndPriceRange(Product product, @MappingTarget ProductDetailDTO dto) {
    if (product.getVariants() != null && !product.getVariants().isEmpty()) {
        // Calculate total stock
        int totalStock = product.getVariants().stream()
                .filter(v -> v.getStockQuantity() != null)
                .mapToInt(v -> v.getStockQuantity())
                .sum();
        dto.setTotalStock(totalStock);

        // Calculate price range (prioritize salePrice)
        BigDecimal minPrice = product.getVariants().stream()
                .filter(v -> v.getPrice() != null)
                .map(v -> v.getSalePrice() != null && v.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                        ? v.getSalePrice()
                        : v.getPrice())
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // ... format priceRange string
    }
}
```

#### ProductVariantMapper

**File**: `ProductVariantMapper.java`

**Features**:

- ✅ Map `cachedAttributes` (Map<String, Object>) - JSONB support
- ✅ Map relationships: `productId`, `categoryId`, `concentrationId`
- ✅ Enum conversion: `Status`, `StockStatus`

**JSONB Handling**:

- MapStruct tự động map `Map<String, Object>` giữa Entity và DTO
- Không cần custom converter
- Hibernate `@Type(JsonType.class)` xử lý JSONB persistence

#### ProductSeoUrlMapper

**File**: `ProductSeoUrlMapper.java`

**Features**:

- Map `productId` từ relationship
- Ignore `product` entity để tránh circular reference

### 📊 Performance Benefits

| Metric            | ProductDTO (Listing) | ProductDetailDTO (Detail) |
| ----------------- | -------------------- | ------------------------- |
| **Payload Size**  | ~200 bytes           | ~5-10 KB                  |
| **Fields**        | 10-12 fields         | 50+ fields                |
| **Relationships** | None                 | 3 collections             |
| **Use Case**      | Pagination, Search   | Detail Page               |

### ✅ Best Practices

1. **Sử dụng ProductDTO cho listing** - Giảm payload, tăng performance
2. **Sử dụng ProductDetailDTO cho detail** - Đầy đủ thông tin khi cần
3. **@AfterMapping cho calculated fields** - Tự động tính toán, không cần manual
4. **JSONB mapping tự động** - MapStruct xử lý `Map<String, Object>` mượt mà
5. **Tránh circular reference** - ProductVariantDTO không chứa ProductDTO

---

## 🔐 Spring Security 6 & JWT Authentication ⭐ NEW

### 🎯 Tổng Quan

Hệ thống sử dụng **Spring Security 6** với **JWT (JSON Web Token)** cho authentication và **RBAC (Role-Based Access Control)** cho authorization. Tất cả được cấu hình với **stateless session** để hỗ trợ scalability.

### 📦 Các Thành Phần Chính

#### 1. **CustomUserDetailsService** - Load User với RBAC

**File**: `security/CustomUserDetailsService.java`

**Chức năng**:

- Load User từ email với **eager fetching** của roles và permissions
- Map JSONB permissions thành Spring Security authorities
- Hỗ trợ multiple roles per user và fine-grained permissions

**Entity Graph**:

```java
@EntityGraph(attributePaths = {"userRoles", "userRoles.role", "primaryRole"})
Optional<User> findByEmail(String email);
```

**Authorities Mapping**:

- **Roles**: `ROLE_ADMIN`, `ROLE_STAFF` (từ `role.roleCode`)
- **Permissions**: `product:view`, `product:create` (từ `role.permissions` JSONB)
- **Additional Permissions**: Override từ `user.additionalPermissions` JSONB

**Example JSONB Permissions**:

```json
{
  "product": ["view", "create", "update", "delete"],
  "order": ["view", "update"],
  "user": ["view"]
}
```

**Mapped to Authorities**:

- `product:view`
- `product:create`
- `product:update`
- `product:delete`
- `order:view`
- `order:update`
- `user:view`

#### 2. **JwtTokenProvider** - Token Generation & Validation

**File**: `security/JwtTokenProvider.java`

**Methods**:

1. **`generateAccessToken(userId, email, authorities)`**

   - Nhúng `userId`, `email`, `roles`, `authorities` vào JWT claims
   - Expiration: 1 hour (configurable)

2. **`generateRefreshToken(userId, email)`**

   - Long-lived token (7 days)
   - Minimal claims (userId, email, type)

3. **`generateLongLivedToken(userId, email, authorities)`**

   - Remember me token (30 days)
   - Full authorities included

4. **`getAuthentication(token)`**

   - Extract authorities từ token
   - Tạo `UsernamePasswordAuthenticationToken` với authorities

5. **`validateToken(token)`**
   - Validate signature và expiration

**JWT Claims Structure**:

```json
{
  "sub": "admin@example.com",
  "userId": 1,
  "roles": ["ROLE_ADMIN"],
  "authorities": ["product:view", "product:create", "order:view"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

#### 3. **JwtAuthenticationFilter** - Request Interceptor

**File**: `security/JwtAuthenticationFilter.java`

**Chức năng**:

- Intercept mọi request
- Extract JWT token từ `Authorization: Bearer <token>` header
- Validate token và load authorities
- Set authentication vào `SecurityContext`

**Flow**:

```
Request → Extract Token → Validate → Load Authorities → Set SecurityContext → Continue
```

#### 4. **SecurityConfig** - Security Configuration

**File**: `config/SecurityConfig.java`

**Cấu hình**:

- **Stateless Session**: `SessionCreationPolicy.STATELESS`
- **CORS**: Configured cho frontend (localhost:3000, localhost:3001)
- **CSRF**: Disabled (stateless với JWT)

**Phân quyền**:

| Endpoint Pattern         | Access        | Description                           |
| ------------------------ | ------------- | ------------------------------------- |
| `/api/auth/**`           | Public        | Authentication endpoints              |
| `/api/store/products/**` | Public        | Storefront catalog/search             |
| `/api/products/**`       | Protected     | Admin product management              |
| `/api/brands/**`         | Public        | Brand listing                         |
| `/api/categories/**`     | Public        | Category listing                      |
| `/api/admin/**`          | Protected     | Requires `ROLE_ADMIN` or `ROLE_STAFF` |
| Others                   | Authenticated | Requires valid JWT token              |

**Filter Chain**:

```
JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter → ...
```

#### 5. **AuthController** - Login API

**File**: `modules/auth/controller/AuthController.java`

**Endpoints**:

1. **`POST /api/auth/login`**

   - Request: `LoginRequestDTO` (email, password, rememberMe)
   - Response: `LoginResponseDTO` (accessToken, refreshToken, user info, roles, authorities)
   - Features:
     - Account lockout check
     - Failed login attempts tracking
     - Update last login
     - Generate access + refresh tokens

2. **`GET /api/auth/me`**
   - Get current authenticated user info
   - Returns: User info with roles and authorities

**Login Request Example**:

```json
{
  "email": "admin@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Login Response Example**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "roles": ["ROLE_ADMIN"],
    "authorities": ["product:view", "product:create", "order:view"]
  }
}
```

### 🔑 RBAC (Role-Based Access Control)

#### Role Structure

**Role Entity**:

- `roleCode`: Unique identifier (e.g., "ADMIN", "STAFF")
- `roleName`: Display name (e.g., "Administrator", "Staff Member")
- `permissions`: JSONB map of resource → actions

**UserRole Entity**:

- Many-to-Many relationship User ↔ Role
- `isActive`: Enable/disable role assignment
- `expiresAt`: Optional expiration date

**User Entity**:

- `primaryRole`: Primary role (quick access)
- `userRoles`: List of all assigned roles
- `additionalPermissions`: JSONB override permissions

#### Permission Format

**JSONB Structure**:

```json
{
  "resource": ["action1", "action2", ...],
  ...
}
```

**Examples**:

```json
{
  "product": ["view", "create", "update", "delete"],
  "order": ["view", "update"],
  "user": ["view"]
}
```

**Mapped Authorities**:

- `product:view`
- `product:create`
- `product:update`
- `product:delete`
- `order:view`
- `order:update`
- `user:view`

### 🔒 Security Features

#### Account Lockout

- **5 failed attempts** → Lock account for 30 minutes
- Tracked via `User.failedLoginAttempts` and `User.lockedUntil`
- Auto-reset on successful login

#### Password Security

- **BCrypt** password encoding
- Password strength validation (min 8 chars, uppercase, lowercase, number)
- Password change tracking (`passwordChangedAt`)

#### Token Security

- **HMAC SHA-256** signing
- Configurable expiration (1 hour default, 30 days for remember me)
- Refresh token support (7 days)

### 📊 Performance Optimizations

#### Entity Graph

- Eager fetch roles và permissions trong 1 query
- Tránh N+1 problem và LazyInitializationException

#### Stateless Architecture

- No server-side session storage
- Scalable across multiple instances
- JWT contains all necessary information

### ✅ Best Practices

1. **Always use Entity Graph** khi load User với roles
2. **Validate token** trước khi access protected resources
3. **Use refresh tokens** cho long-lived sessions
4. **Store permissions in JSONB** để flexible và queryable
5. **Combine roles + permissions** cho fine-grained access control

### 🔧 Configuration

**application.properties**:

```properties
app.jwt.secret=YOUR_JWT_SECRET
app.jwt.expiration-ms=3600000
app.jwt.long-lived-expiration-ms=2592000000
```

**SecurityConfig**:

- Stateless session
- JWT filter integration
- Public/protected endpoint configuration

---

## 🗄️ Database Schema

Xem chi tiết tại: **[DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**

---

## 📊 Backend Implementation Status

> **📌 Xem chi tiết tại:** [BACKEND_IMPLEMENTATION_STATUS.md](./BACKEND_IMPLEMENTATION_STATUS.md)
>
> File này chứa:
>
> - ✅ Tổng quan về 54 entities đã triển khai
> - ✅ Chi tiết từng module (Authentication, Catalog, Inventory, etc.)
> - ✅ Build status và technical stack
> - ✅ Repository features (Entity Graph, Specification, JSONB)
> - ✅ Security components (JWT, RBAC)

---

## 🔌 API Documentation

### Base URL

```
http://localhost:8080/api
```

### Authentication

#### Admin/Staff Authentication

- ✅ **JWT Authentication** với Spring Security 6 ⭐ ENHANCED
- ✅ **Token-based authentication** - Stateless session
- ✅ **RBAC (Role-Based Access Control)** - Multiple roles per user, fine-grained permissions ⭐ ENHANCED
- ✅ **CustomUserDetailsService** - Load User với eager fetching roles/permissions ⭐ NEW
- ✅ **JwtTokenProvider** - Generate tokens với userId, email, authorities ⭐ ENHANCED
- ✅ **JwtAuthenticationFilter** - Auto-load authorities từ token ⭐ ENHANCED
- ✅ **Login API** - `/api/auth/login` với accessToken + refreshToken ⭐ NEW
- ✅ **Rate Limiting** cho verification code (tránh spam SMS/Email)
- ✅ **Flexible Address System** - Hỗ trợ customer addresses và guest checkout
- ✅ Remember Me support (30 ngày token)
- ✅ Account lockout mechanism (5 failed attempts → 30 min lock)

#### Customer Authentication

- **Không cần đăng ký**: Khách hàng không cần tạo tài khoản
- **Email Verification**: Xác thực đơn hàng qua email với verification code
- **Rate Limiting**: Giới hạn số lần gửi verification code (mặc định 5 lần) để tránh spam SMS/Email
- **Order Tracking**: Tra cứu đơn hàng bằng verification_code + email
- **Guest Checkout**: Hỗ trợ đặt hàng không cần đăng ký, địa chỉ được lưu tạm thời

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

#### 🧪 Concentrations (Nồng độ nước hoa)

**Base Path:** `/api/concentrations`

| Method | Endpoint                          | Mô tả                        | Auth Required |
| ------ | --------------------------------- | ---------------------------- | ------------- |
| GET    | `/api/concentrations`             | Lấy danh sách tất cả nồng độ | No            |
| GET    | `/api/concentrations/{id}`        | Lấy chi tiết nồng độ theo ID | No            |
| GET    | `/api/concentrations/slug/{slug}` | Lấy nồng độ theo slug        | No            |
| POST   | `/api/concentrations`             | Tạo nồng độ mới              | Yes (Admin)   |
| PUT    | `/api/concentrations/{id}`        | Cập nhật nồng độ             | Yes (Admin)   |
| DELETE | `/api/concentrations/{id}`        | Xóa nồng độ                  | Yes (Admin)   |

**ConcentrationDTO Structure:**

```json
{
  "id": 1,
  "name": "Eau de Parfum",
  "slug": "eau-de-parfum",
  "description": "Nồng độ cao, lưu hương lâu",
  "intensityLevel": 7,
  "displayOrder": 3,
  "status": "ACTIVE",
  "createdAt": "2024-12-19T10:00:00",
  "updatedAt": "2024-12-19T10:00:00"
}
```

**Validation Rules:**

- `name`: Required, 2-100 characters
- `slug`: Required, unique, lowercase alphanumeric with hyphens
- `intensityLevel`: 1-10 (1 = nhẹ nhất, 10 = đậm đặc nhất)
- `displayOrder`: 0-9999
- `status`: ACTIVE or INACTIVE

**Các nồng độ phổ biến:**

- **Eau Fraîche** (intensity: 1-2): Nồng độ thấp nhất
- **Cologne** (intensity: 2-3): Nồng độ thấp, phù hợp mùa hè
- **Eau de Toilette (EDT)** (intensity: 4-5): Nồng độ trung bình, phổ biến
- **Eau de Parfum (EDP)** (intensity: 6-8): Nồng độ cao, lưu hương lâu
- **Parfum** (intensity: 9-10): Nồng độ cao nhất, đậm đặc nhất

**Usage:**

- Mỗi `product_variant` có thể reference đến một `concentration_id`
- `intensity_level` giúp sắp xếp và filter sản phẩm theo nồng độ
- `slug` được sử dụng trong URL và SKU generation

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

## 🏗️ Product Admin Service - Business Logic ⭐ NEW

### 🎯 Tổng Quan

`ProductAdminService` xử lý các logic nghiệp vụ phức tạp cho chức năng Admin của Product, bao gồm:

- **Slug Generation**: Tự động tạo slug từ tên sản phẩm/variant
- **Attribute Sync**: Đồng bộ attributes giữa EAV (product_attributes) và JSONB (cached_attributes)
- **Transaction Management**: Đảm bảo atomicity khi tạo Product với variants, attributes, images
- **Validation**: Kiểm tra SKU unique, validate relationships

### 📦 Các Thành Phần

#### 1. **ProductCreateRequestDTO** - Request DTO

**File**: `modules/catalog/product/dto/ProductCreateRequestDTO.java`

**Cấu trúc**:

```java
public class ProductCreateRequestDTO {
    private String name;                    // Tên sản phẩm (bắt buộc)
    private Long brandId;                   // Brand ID (bắt buộc)
    private String status;                  // Status (mặc định: DRAFT)
    private List<ProductVariantCreateDTO> variants;  // Danh sách variants (bắt buộc, ít nhất 1)
    private List<ProductImageDTO> images;   // Danh sách images (optional)

    public static class ProductVariantCreateDTO {
        private String sku;                 // SKU (bắt buộc, unique)
        private String variantName;         // Tên variant (bắt buộc)
        private BigDecimal price;           // Giá (bắt buộc)
        private BigDecimal salePrice;       // Giá khuyến mãi (optional)
        private Integer stockQuantity;      // Số lượng tồn kho
        private Long categoryId;            // Category ID (optional)
        private Long concentrationId;       // Concentration ID (optional)
        private List<ProductAttributeValueDTO> attributeValues;  // Attributes (optional)
        // ... các fields khác
    }
}
```

#### 2. **ProductAdminService** - Business Logic Service

**File**: `modules/catalog/product/service/ProductAdminService.java`

**Main Method**:

```java
@Transactional
public ProductDetailDTO createProduct(ProductCreateRequestDTO requestDTO) {
    // 1. Validate và load Brand
    // 2. Validate SKUs (kiểm tra trùng)
    // 3. Tạo Product entity
    // 4. Tạo Variants với slug tự động và sync attributes
    // 5. Lưu Images
    // 6. Trả về ProductDetailDTO
}
```

**Key Methods**:

1. **`generateUniqueSlug(String name)`**

   - Sử dụng `Slugify` để tạo slug từ tên
   - Kiểm tra unique trong database
   - Nếu trùng, thêm số đếm vào cuối (ví dụ: "product-name-2")

2. **`syncAttributesToEAVAndJSONB(ProductVariant, List<ProductAttributeValueDTO>)`**

   - Lưu vào bảng `product_attributes` (EAV) - Source of Truth
   - Convert thành `Map<String, Object>` và lưu vào `cached_attributes` (JSONB) - Performance Layer
   - Structure JSONB:
     ```json
     {
       "color": {
         "value": "Red",
         "display": "Đỏ",
         "type": "SELECT",
         "dataType": "STRING"
       },
       "gender": {
         "value": "MALE",
         "display": "Nam",
         "type": "SELECT",
         "dataType": "STRING"
       }
     }
     ```

3. **`validateSkus(List<ProductVariantCreateDTO>)`**
   - Kiểm tra SKU trùng trước khi tạo
   - Throw `ResourceAlreadyExistsException` nếu trùng

### 🔧 Custom Exceptions

#### ResourceNotFoundException (404)

**File**: `exception/ResourceNotFoundException.java`

```java
throw new ResourceNotFoundException("Brand", brandId);
// Message: "Brand không tồn tại với ID: 1"
```

#### ResourceAlreadyExistsException (409)

**File**: `exception/ResourceAlreadyExistsException.java`

```java
throw new ResourceAlreadyExistsException("ProductVariant", "SKU", "SKU-001");
// Message: "ProductVariant đã tồn tại với SKU: SKU-001"
```

### 📊 Flow Diagram

```
ProductCreateRequestDTO
    ↓
1. Validate Brand, SKUs
    ↓
2. Create Product Entity
    ↓
3. For each Variant:
    ├─ Generate Unique Slug
    ├─ Create Variant Entity
    ├─ Sync Attributes:
    │   ├─ Save to product_attributes (EAV)
    │   └─ Update cached_attributes (JSONB)
    └─ Save Variant
    ↓
4. Save Images (if any)
    ↓
5. Return ProductDetailDTO
```

### ✅ Transactional Guarantees

- **@Transactional**: Toàn bộ operation (Product + Variants + Attributes + Images) được thực hiện trong 1 transaction
- **Rollback**: Nếu có bất kỳ lỗi nào (validation, database constraint, etc.), toàn bộ sẽ rollback
- **Atomicity**: Hoặc tất cả thành công, hoặc không có gì được lưu

### 📝 Usage Example

```java
// Request
POST /api/admin/products
{
  "name": "Nước Hoa Chanel No.5",
  "brandId": 1,
  "status": "DRAFT",
  "variants": [
    {
      "sku": "CHANEL-5-EDP-50ML",
      "variantName": "Chanel No.5 Eau de Parfum 50ml",
      "price": 2500000,
      "salePrice": 2200000,
      "stockQuantity": 10,
      "categoryId": 1,
      "concentrationId": 2,
      "attributeValues": [
        {
          "attributeId": 1,
          "attributeValueId": 5,
          "scope": "VARIANT"
        },
        {
          "attributeId": 2,
          "attributeValueId": 10,
          "scope": "VARIANT"
        }
      ]
    }
  ],
  "images": [
    {
      "imageUrl": "https://example.com/image1.jpg",
      "isPrimary": true
    }
  ]
}

// Response: ProductDetailDTO với đầy đủ thông tin
```

### 🔍 Key Features

1. **Slug Generation**

   - Tự động từ tên variant
   - Đảm bảo unique
   - SEO-friendly

2. **Attribute Sync**

   - Dual storage: EAV (source of truth) + JSONB (performance)
   - Auto-sync khi tạo variant
   - Structure JSONB chuẩn cho filtering

3. **Validation**

   - SKU unique check
   - Brand/Category/Concentration existence check
   - Bean Validation trên DTO

4. **Error Handling**
   - Custom exceptions với HTTP status codes phù hợp
   - Global exception handler xử lý tự động

---

## 🎯 Product Admin API & Image Upload ⭐ NEW

### 🎯 Tổng Quan

`ProductAdminController` cung cấp các REST API endpoints cho Admin Panel để quản lý Product, bao gồm:

- **CRUD Operations**: Create, Update, Delete (soft delete)
- **Image Upload**: Upload ảnh đại diện và ảnh chi tiết
- **Security**: Bảo vệ bằng `@PreAuthorize` với roles ADMIN/STAFF
- **Response Format**: Chuẩn RESTful với `ApiResponse<T>` wrapper

### 📦 Các Thành Phần

#### 1. **ApiResponse<T>** - Response Wrapper

**File**: `dto/ApiResponse.java`

**Cấu trúc**:

```java
{
  "status": 200,
  "message": "Thành công",
  "data": { ... },
  "timestamp": "2024-12-20T12:00:00"
}
```

**Helper Methods**:

- `ApiResponse.success(data)` - 200 OK
- `ApiResponse.created(data)` - 201 Created
- `ApiResponse.error(status, message)` - Error response

#### 2. **ImageUploadService** - Interface

**File**: `modules/catalog/product/service/ImageUploadService.java`

**Methods**:

- `uploadImage(MultipartFile, String folderName)` - Upload 1 file
- `uploadImages(List<MultipartFile>, String folderName)` - Upload nhiều files
- `deleteImage(String imageUrl)` - Xóa file
- `validateImage(MultipartFile)` - Validate file (size, extension, content type)

#### 3. **LocalStorageService** - Implementation

**File**: `modules/catalog/product/service/LocalStorageService.java`

**Features**:

- Lưu file vào thư mục `uploads/` trong project
- Generate unique filename với UUID
- Validate: max size (5MB), allowed extensions (jpg, jpeg, png, gif, webp)
- Trả về URL: `/uploads/products/image-123.jpg`

**Configuration** (`application.properties`):

```properties
app.upload.directory=uploads
app.upload.base-url=/uploads/
app.upload.max-file-size=5242880  # 5MB
```

#### 4. **WebMvcConfig** - Static Resource Handler

**File**: `config/WebMvcConfig.java`

**Purpose**: Serve static files từ thư mục `uploads/` qua URL `/uploads/**`

### 🔌 API Endpoints

#### 1. **POST /api/admin/products** - Tạo mới Product

**Content-Type**: `multipart/form-data`

**Form Fields**:

- `product` (String, required): JSON string của `ProductCreateRequestDTO`
- `thumbnail` (MultipartFile, optional): Ảnh đại diện
- `images` (MultipartFile[], optional): Danh sách ảnh chi tiết

**Request Example**:

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer <token>" \
  -F "product={\"name\":\"Product Name\",\"brandId\":1,\"variants\":[...]}" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Response** (201 Created):

```json
{
  "status": 201,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Product Name",
    "variants": [...],
    "images": [...]
  },
  "timestamp": "2024-12-20T12:00:00"
}
```

#### 2. **PUT /api/admin/products/{id}** - Cập nhật Product

**Content-Type**: `multipart/form-data`

**Form Fields**: Tương tự POST

**Response** (200 OK):

```json
{
  "status": 200,
  "message": "Cập nhật sản phẩm thành công",
  "data": { ... },
  "timestamp": "2024-12-20T12:00:00"
}
```

#### 3. **DELETE /api/admin/products/{id}** - Xóa mềm Product

**Response** (200 OK):

```json
{
  "status": 200,
  "message": "Xóa sản phẩm thành công",
  "data": null,
  "timestamp": "2024-12-20T12:00:00"
}
```

**Logic**: Đổi status sang `ARCHIVED` và set `archivedAt`

#### 4. **POST /api/admin/products/upload-image** - Upload ảnh riêng lẻ

**Content-Type**: `multipart/form-data`

**Form Fields**:

- `file` (MultipartFile, required): File ảnh cần upload

**Response** (200 OK):

```json
{
  "status": 200,
  "message": "Upload ảnh thành công",
  "data": "/uploads/products/image-123.jpg",
  "timestamp": "2024-12-20T12:00:00"
}
```

### 🔒 Security

**@PreAuthorize**: Tất cả endpoints yêu cầu role `ADMIN` hoặc `STAFF`

```java
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class ProductAdminController {
    // ...
}
```

### 📝 Image Upload Flow

```
1. Client gửi MultipartFile
   ↓
2. Controller nhận file
   ↓
3. ImageUploadService.validateImage() - Validate file
   ↓
4. LocalStorageService.uploadImage() - Lưu file vào uploads/
   ↓
5. Generate unique filename (UUID)
   ↓
6. Trả về URL: /uploads/products/image-123.jpg
   ↓
7. WebMvcConfig serve file qua /uploads/**
```

### ✅ Validation Rules

**File Validation**:

- Max size: 5MB (configurable)
- Allowed extensions: jpg, jpeg, png, gif, webp
- Content type: Must start with "image/"

**DTO Validation**:

- Bean Validation trên `ProductCreateRequestDTO` và `ProductUpdateRequestDTO`
- GlobalExceptionHandler xử lý validation errors

### 🔄 Future Enhancements

- **S3 Integration**: Thay `LocalStorageService` bằng `S3Service` cho production
- **Image Processing**: Resize, crop, optimize images
- **CDN**: Serve images qua CDN
- **Multiple Storage**: Support nhiều storage providers

---

## 🛒 Product Store API - Public Endpoints ⭐ NEW

### 🎯 Tổng Quan

`ProductStoreController` cung cấp các REST API endpoints **public** (không cần authentication) cho Store Frontend, tập trung vào **hiệu năng tìm kiếm** với bộ lọc mạnh mẽ.

**Features**:

- ✅ **Dynamic Filtering**: Brand, Category, Price range, Attributes (JSONB)
- ✅ **Hybrid Query Strategy**: Kết hợp JPA Specification và Native Query JSONB
- ✅ **SEO Friendly**: Tìm kiếm theo slug
- ✅ **Full-text Search**: Tìm kiếm theo tên sản phẩm
- ✅ **Performance Optimized**: Sử dụng GIN index cho JSONB queries

### 📦 Các Thành Phần

#### 1. **ProductFilterDTO** - Filter Parameters

**File**: `modules/catalog/product/dto/ProductFilterDTO.java`

**Fields**:

- `brandIds` (List<Long>) - Filter theo Brand IDs
- `categoryId` (Long) - Filter theo Category
- `minPrice`, `maxPrice` (BigDecimal) - Filter theo Price range
- `attributes` (Map<String, String>) - Filter theo Attributes (JSONB)
- `status` (String, default: "ACTIVE")

**Attributes Format**:

- Key:value pairs: `"color:Red,size:XL"`
- JSON string: `"{\"color\":\"Red\",\"size\":\"XL\"}"`

#### 2. **ProductStoreService** - Search Logic

**File**: `modules/catalog/product/service/ProductStoreService.java`

**Main Methods**:

1. **`searchProducts(ProductFilterDTO, Pageable)`**

   - **Strategy**:
     - Nếu có filter Attributes → Sử dụng Native Query JSONB
     - Nếu chỉ có filter cơ bản → Sử dụng JPA Specification
     - Nếu có cả hai → Kết hợp (Intersect ID list)

2. **`getProductBySlug(String slug)`**

   - Tìm product theo variant slug (SEO friendly)
   - Sử dụng `findByVariantSlug()` với Entity Graph

3. **`searchProductsByName(String keyword, Pageable)`**
   - Full-text search theo tên sản phẩm
   - Sử dụng LIKE query với case-insensitive

**Query Strategy**:

```
Filter có Attributes?
├─ YES → Native Query JSONB (GIN index)
│   ├─ Tìm variants matching attributes
│   ├─ Extract product IDs
│   ├─ Filter by price range (nếu có)
│   └─ Kết hợp với basic filters (nếu có)
│
└─ NO → JPA Specification
    ├─ Filter by Brand, Category, Status
    └─ Filter by price range (nếu có)
```

#### 3. **ProductStoreController** - Public API

**File**: `modules/catalog/product/controller/ProductStoreController.java`

**Endpoints**:

1. **GET `/api/store/products`** - Danh sách sản phẩm với filters
2. **GET `/api/store/products/{slug}`** - Chi tiết sản phẩm theo slug
3. **GET `/api/store/products/search`** - Full-text search

### 🔌 API Endpoints

#### 1. **GET /api/store/products** - Danh sách với Filters

**Query Parameters**:

- `brandId` (List<Long>): Filter theo Brand IDs
- `categoryId` (Long): Filter theo Category
- `minPrice` (BigDecimal): Giá tối thiểu
- `maxPrice` (BigDecimal): Giá tối đa
- `attrs` (String): Filter theo Attributes
- `page` (int, default: 0): Page number
- `size` (int, default: 20): Page size
- `sort` (String, default: "createdAt,desc"): Sort field and direction

**Example**:

```bash
GET /api/store/products?brandId=1&categoryId=2&minPrice=1000000&maxPrice=5000000&attrs=color:Red,gender:MALE&page=0&size=20
```

**Response**:

```json
{
  "status": 200,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Product Name",
        "brandId": 1,
        "brandName": "Brand Name",
        "thumbnailUrl": "/uploads/products/image.jpg",
        "primaryImageUrl": "/uploads/products/image.jpg"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  },
  "timestamp": "2024-12-20T12:00:00"
}
```

#### 2. **GET /api/store/products/{slug}** - Chi tiết theo Slug

**Example**:

```bash
GET /api/store/products/chanel-no5-eau-de-parfum-50ml
```

**Response**:

```json
{
  "status": 200,
  "message": "Lấy chi tiết sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Product Name",
    "variants": [...],
    "images": [...],
    "totalStock": 10,
    "priceRange": "2,500,000 - 3,000,000 VND"
  },
  "timestamp": "2024-12-20T12:00:00"
}
```

#### 3. **GET /api/store/products/search** - Full-text Search

**Query Parameters**:

- `q` (String, required): Từ khóa tìm kiếm
- `page`, `size`, `sort`: Pagination parameters

**Example**:

```bash
GET /api/store/products/search?q=Chanel&page=0&size=20
```

### ⚡ Performance Optimization

#### 1. **Hybrid Query Strategy**

**Attributes Filter** → Native Query JSONB:

- Sử dụng `@>` (containment) operator
- Leverage GIN index
- Fast filtering trên `cached_attributes`

**Basic Filters** → JPA Specification:

- Type-safe queries
- Reusable predicates
- Easy to maintain

**Combined Filters** → Intersect Results:

- Get product IDs từ attributes query
- Filter by IDs + basic filters
- Efficient intersection

#### 2. **Entity Graph**

- `findByVariantSlug()` sử dụng `@EntityGraph` để eager fetch relationships
- Tránh N+1 problem và LazyInitializationException

#### 3. **DTO Optimization**

- **Listing**: `ProductDTO` (nhẹ, không có variants/images)
- **Detail**: `ProductDetailDTO` (nặng, có đầy đủ thông tin)

### 📊 Query Flow Diagram

```
GET /api/store/products?brandId=1&attrs=color:Red
    ↓
1. Parse filter parameters
    ↓
2. Check: Has attributes filter?
    ├─ YES → searchWithAttributes()
    │   ├─ Build JSONB query: {"color": {"value": "Red"}}
    │   ├─ Native Query: findByMultipleAttributes()
    │   ├─ Extract product IDs from variants
    │   ├─ Filter by price (nếu có)
    │   └─ Combine with basic filters (nếu có)
    │
    └─ NO → searchWithSpecification()
        ├─ Build Specification (Brand, Category, Status)
        └─ Query với Specification
    ↓
3. Map to ProductDTO
    ↓
4. Return ApiResponse<Page<ProductDTO>>
```

### 🔍 Filter Examples

#### Example 1: Filter by Brand only

```
GET /api/store/products?brandId=1
→ Uses JPA Specification
```

#### Example 2: Filter by Attributes only

```
GET /api/store/products?attrs=color:Red,gender:MALE
→ Uses Native Query JSONB (GIN index)
```

#### Example 3: Combined Filters

```
GET /api/store/products?brandId=1&categoryId=2&attrs=color:Red&minPrice=1000000
→ Strategy:
   1. Native Query JSONB for attributes → Get product IDs
   2. Filter by price range → Intersect IDs
   3. JPA Specification for Brand + Category → Final filter
```

### ✅ Key Features

1. **Dynamic Filtering**

   - Brand (multiple), Category, Price range
   - Attributes (JSONB) - Dynamic attributes

2. **Performance**

   - GIN index cho JSONB queries
   - Entity Graph cho eager fetching
   - Lightweight DTOs cho listing

3. **SEO Friendly**

   - Slug-based URLs
   - Clean, readable URLs

4. **Full-text Search**
   - Case-insensitive search
   - LIKE query với wildcards

---

## 🧾 Customer Dashboard & Gamification ⭐ NEW

### 🎯 Mục Tiêu

Cung cấp API cho Storefront hiển thị thông tin khách hàng, trạng thái VIP và lịch sử đơn hàng nhằm khuyến khích mua sắm (ví dụ: “Bạn còn thiếu 500.000đ để lên hạng Vàng”).

### 📦 DTOs

**CustomerProfileDTO**

| Field                      | Mô tả                                    |
| -------------------------- | ---------------------------------------- |
| id, fullName, email, phone | Thông tin cơ bản của khách hàng          |
| totalPurchaseAmount        | Tổng tiền đã mua                         |
| availablePoints            | Điểm tích lũy hiện tại                   |
| vipInfo                    | Thông tin VIP (tier, discount, progress) |
| recentOrders               | Danh sách đơn hàng gần đây               |

**VipInfo**

- `currentTier`: Tên tier hiện tại (ví dụ: Silver)
- `discountRate`: Mức giảm giá (%) dành cho tier hiện tại
- `nextTier`: Tier tiếp theo (nếu có)
- `spendToNextTier`: Số tiền cần mua thêm để lên tier tiếp theo
- `progressPercent`: % tiến độ (dùng cho progress bar)

**OrderSummaryDTO**

- `orderId`, `orderNumber`
- `totalAmount`
- `status`
- `createdAt`

### ⚙️ Business Logic (CustomerStoreService)

1. **Xác định tier hiện tại**:

   - Nếu customer đã được gán `currentVipTierId` → load tier này.
   - Nếu chưa → tính dựa trên `totalPurchaseAmount` và bảng `member_pricing_tiers`.

2. **Tính tier tiếp theo**:

   - Lấy tier có `tierLevel` cao hơn hiện tại.
   - `spendToNextTier = nextTier.minPurchaseAmount - totalPurchaseAmount`.
   - `progressPercent`: tính theo khoảng giữa tier hiện tại và tiếp theo.

3. **Lịch sử đơn hàng**:
   - Sử dụng `OrderRepository.findByCustomerIdOrderByCreatedAtDesc`.
   - Trả về danh sách `OrderSummaryDTO`.

### 🔌 API Endpoints (CustomerProfileController)

| Method | Endpoint                    | Mô tả                                                                     | Auth          |
| ------ | --------------------------- | ------------------------------------------------------------------------- | ------------- |
| GET    | `/api/store/profile/me`     | Lấy thông tin profile + VIP status                                        | ROLE_CUSTOMER |
| GET    | `/api/store/profile/orders` | Lấy lịch sử đơn hàng với pagination (`page`, `size`, sort createdAt DESC) | ROLE_CUSTOMER |

**Response Sample** `/api/store/profile/me`

```json
{
  "status": 200,
  "message": "Lấy thông tin profile thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "customer@example.com",
    "availablePoints": 120,
    "totalPurchaseAmount": 7500000,
    "vipInfo": {
      "currentTier": "Silver",
      "discountRate": 3.0,
      "nextTier": "Gold",
      "spendToNextTier": 2500000,
      "progressPercent": 75.0
    },
    "recentOrders": [
      {
        "orderId": 101,
        "orderNumber": "ORD-20250001",
        "totalAmount": 1500000,
        "status": "COMPLETED",
        "createdAt": "2025-01-20T10:15:00"
      }
    ]
  },
  "timestamp": "2025-01-20T11:00:00"
}
```

### 🛡️ Security

- Endpoints yêu cầu JWT token với `ROLE_CUSTOMER`.
- Đã cấu hình trong `SecurityConfig`:
  ```java
  .requestMatchers("/api/store/profile/**").hasRole("CUSTOMER")
  ```

### 📈 Gamification Ideas

- Hiển thị tiến độ lên tier tiếp theo (`progressPercent`).
- Thông báo “Thiếu X VND để đạt tier Gold”.
- Gợi ý sử dụng điểm `availablePoints`.

---

## 🛒 Cart & Checkout Service ⭐ NEW

### 🎯 Mục Tiêu

Xây dựng logic giỏ hàng thông minh (guest + logged-in) và quy trình tính toán đơn hàng/đặt hàng trong Storefront.

### 📦 CartService

**File**: `modules/shopping/service/CartService.java`

| Method                                   | Mô tả                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `addToCart(sessionId, customerId, item)` | Thêm sản phẩm vào giỏ (ưu tiên customerId nếu đã login). Rate limit 10 lần/60s qua Redis |
| `mergeCart(sessionId, customerId)`       | Gộp giỏ hàng session vào giỏ hàng customer khi đăng nhập                                 |
| `getCartDetails(sessionId, customerId)`  | Trả về danh sách item + thông tin sản phẩm + subtotal                                    |
| `clearCart(sessionId, customerId)`       | Xóa giỏ hàng (dùng sau khi đặt hàng)                                                     |

**CartDetailsDTO**

- `items`: danh sách `CartItemDetailDTO` (ảnh, tên, giá, số lượng, lineTotal)
- `subtotal`, `totalQuantity`

**Storage Rules**

- Guest: lưu theo `sessionId`
- Logged-in: lưu theo `customer_id`
- Unique constraint bảo đảm mỗi variant xuất hiện một lần per owner
- Rate limiting chống spam: `CartRateLimitAspect` + Redis (`rate:cart:<session|customer>`), quá 10 requests/60s -> HTTP 429

### ⚙️ CheckoutService

**File**: `modules/shopping/service/CheckoutService.java`

| Method                       | Mô tả                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `calculateCheckout(request)` | Tính Subtotal → VIP Discount → Voucher (PromotionService) → Shipping → FinalAmount (+ breakdown) |
| `placeOrder(request)`        | Validate tồn kho → Lưu Order + OrderItems → adjust stock → ghi nhận voucher usage → clear cart   |

**CheckoutRequest**

- `items`: danh sách `{variantId, quantity}`
- `customer`: `{customerId, fullName, email, phone}`
- `voucherCode`, `shippingFee`, `sessionId`, `shippingAddress`, `paymentMethod`, ...

**CheckoutSummaryDTO**

- `items`: chi tiết từng dòng (unitPrice, lineTotal)
- `subtotal`, `vipDiscountRate`, `vipDiscountAmount`, `voucherDiscount`, `shippingFee`, `finalAmount`
- `voucherCode`, `currentTier`, `nextTier`, `spendToNextTier`, `progressPercent`

### ⚠️ Business Rules

1. **VIP Discount**: lấy từ `member_pricing_tiers` (theo `customer.currentVipTierId` hoặc tổng mua).
2. **Voucher / Promotion**:
   - `PromotionService.validatePromotion(code, orderTotal, customerId)` sử dụng `@Lock(PESSIMISTIC_WRITE)`
   - Check: `status=ACTIVE`, `startDate/endDate`, `usageLimit`, `usageLimitPerUser`, `minPurchaseAmount`.
   - Discount hỗ trợ `PERCENTAGE` + `FIXED_AMOUNT`, `maxDiscountAmount`, đảm bảo không vượt orderTotal.
   - `PromotionUsage` ghi nhận lịch sử + cập nhật `usageCount`.
3. **Inventory Validation**: kiểm tra `ProductVariant.stockQuantity` trước khi trừ kho.
4. **Order Placement**:
   - Generate `orderNumber` + `verificationCode`
   - Lưu `Order` + `OrderItems`
   - `promotionService.recordPromotionUsage(...)` nếu voucher còn hiệu lực
   - `inventoryService.adjustStock(..., OUT, "ORDER", orderId, ...)`
   - `cartService.clearCart(sessionId, customerId)`

### 🧱 Database

**Migration `V2__add_customer_column_to_carts.sql`**

- Thêm `customer_id` vào bảng `carts`
- Unique index `(customer_id, product_variant_id)`
- FK tới `customers(id)`

---

## ⚡ JSONB Performance Optimization & Hibernate Configuration

### Tổng Quan

Hệ thống sử dụng mô hình **Hybrid EAV + JSONB** để tối ưu hiệu năng tìm kiếm và lọc sản phẩm:

- **EAV Model** (`product_attributes` table): Lưu trữ dữ liệu chính thức, linh hoạt, dễ quản lý
- **JSONB Cache** (`cached_attributes` column): Cache attributes trong JSONB format để query siêu nhanh

### Kiến Trúc

```
EAV Model (Source of Truth)
    ↓ Auto-sync via Trigger
JSONB Cache (Performance Layer)
    ↓ GIN Index
Fast Queries (10-50ms)
```

---

### 1. Dependency

#### Thêm vào `pom.xml`

```xml
<!-- Hypersistence Utils for Hibernate 6.3 - JSONB Support -->
<dependency>
    <groupId>io.hypersistence</groupId>
    <artifactId>hypersistence-utils-hibernate-63</artifactId>
    <version>3.7.2</version>
</dependency>
```

**Lý do chọn Hypersistence Utils:**

- ✅ Hỗ trợ đầy đủ Hibernate 6.3
- ✅ Type-safe JSONB mapping
- ✅ Tối ưu performance
- ✅ Dễ sử dụng với annotation `@Type(JsonType.class)`

---

### 2. Entity Configuration

#### ProductVariant Entity

```java
package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    // ... other fields ...

    /**
     * Cached JSONB representation of product attributes for fast filtering.
     * Structure: { "attribute_key": { "value": "...", "display": "...", "type": "...", "dataType": "...", "numericValue": ... } }
     * Auto-synced from product_attributes table via database trigger.
     *
     * Using Hypersistence Utils JsonType for better JSONB support in Hibernate 6.3
     */
    @Type(JsonType.class)
    @Column(name = "cached_attributes", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> cachedAttributes = new HashMap<>();

    // ... other fields ...
}
```

#### Key Points:

1. **Import**: `io.hypersistence.utils.hibernate.type.json.JsonType`
2. **Annotation**: `@Type(JsonType.class)` - Map `Map<String, Object>` sang JSONB
3. **Column Definition**: `columnDefinition = "jsonb"` - Đảm bảo PostgreSQL sử dụng JSONB type
4. **Default Value**: `@Builder.Default private Map<String, Object> cachedAttributes = new HashMap<>()`

#### Cấu trúc JSONB Example:

```json
{
  "gender": {
    "value": "MALE",
    "display": "Nam",
    "type": "SELECT",
    "dataType": "STRING"
  },
  "fragrance_group": {
    "value": "woody",
    "display": "Gỗ",
    "type": "SELECT",
    "dataType": "STRING"
  },
  "color": {
    "value": "Red",
    "display": "Đỏ",
    "type": "SELECT",
    "dataType": "STRING"
  },
  "longevity": {
    "value": "8",
    "display": "8 giờ",
    "type": "RANGE",
    "dataType": "NUMERIC",
    "numericValue": 8
  }
}
```

#### Index Configuration

**⚠️ CRITICAL: Tạo GIN index cho cột JSONB**

```sql
CREATE INDEX IF NOT EXISTS idx_variants_cached_attributes_gin
ON product_variants USING GIN (cached_attributes);
```

**Lưu ý:** GIN index chỉ hoạt động hiệu quả với `@>` (containment) operator.

**Database triggers** (nếu cần auto-sync) cần được tạo thủ công. Xem `DATABASE_SCHEMA_ENHANCED.md` để biết chi tiết.

---

### 3. Query Examples

#### 3.1. Native Query - Tìm variant có màu 'Red' ⚡ OPTIMIZED

**⚠️ CRITICAL: Luôn ưu tiên dùng `@>` (containment) operator để tận dụng GIN index**

**Repository Method (OPTIMIZED):**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND pv.cached_attributes @> CAST(:attributeJson AS jsonb)
    """, nativeQuery = true)
Page<ProductVariant> findByAttributeKeyValue(
    @Param("attributeJson") String attributeJson, // e.g., "{\"color\": {\"value\": \"Red\"}}"
    Pageable pageable
);
```

**Usage:**

```java
@Autowired
private ProductVariantRepository repository;

public Page<ProductVariant> findRedVariants(Pageable pageable) {
    String attributeJson = "{\"color\": {\"value\": \"Red\"}}";
    return repository.findByAttributeKeyValue(attributeJson, pageable);
}
```

**Generated SQL:**

```sql
SELECT * FROM product_variants pv
WHERE pv.status = 'ACTIVE'
  AND pv.cached_attributes @> '{"color": {"value": "Red"}}'::jsonb
```

**Performance Comparison:**

| Operator             | Index Usage                             | Performance  | Use Case                         |
| -------------------- | --------------------------------------- | ------------ | -------------------------------- |
| `@>` (containment)   | ✅ Uses GIN index                       | ⚡ Very Fast | Exact match, multiple attributes |
| `->>` (extract text) | ❌ Table scan (unless expression index) | 🐌 Slow      | Avoid if possible                |

**Why `@>` is better:**

- ✅ Tận dụng GIN index chung cho mọi attribute key
- ✅ Không cần tạo 50+ expression indexes cho 50 attributes
- ✅ Nhanh hơn 10-100x khi dữ liệu lớn

#### 3.2. Native Query - Tìm variant với multiple attributes (AND)

**Repository Method:**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND pv.cached_attributes @> :attributesJson::jsonb
    """, nativeQuery = true)
Page<ProductVariant> findByMultipleAttributes(
    @Param("attributesJson") String attributesJson,
    Pageable pageable
);
```

**Usage:**

```java
public Page<ProductVariant> findMaleWoodyVariants(Pageable pageable) {
    String attributesJson = """
        {"gender": {"value": "MALE"}, "fragrance_group": {"value": "woody"}}
        """;
    return repository.findByMultipleAttributes(attributesJson, pageable);
}
```

#### 3.3. Native Query - Tìm variant với IN clause ⚡ OPTIMIZED

**⚠️ IMPORTANT: Sử dụng multiple `@>` operators thay vì `->>` với ANY**

**Repository Method (OPTIMIZED):**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND (
        pv.cached_attributes @> CAST(:attributeJson1 AS jsonb)
        OR pv.cached_attributes @> CAST(:attributeJson2 AS jsonb)
        OR pv.cached_attributes @> CAST(:attributeJson3 AS jsonb)
      )
    """, nativeQuery = true)
Page<ProductVariant> findByAttributeValueIn(
    @Param("attributeJson1") String attributeJson1,
    @Param("attributeJson2") String attributeJson2,
    @Param("attributeJson3") String attributeJson3,
    Pageable pageable
);
```

**Usage:**

```java
public Page<ProductVariant> findVariantsByColors(Pageable pageable) {
    String json1 = "{\"color\": {\"value\": \"Red\"}}";
    String json2 = "{\"color\": {\"value\": \"Blue\"}}";
    String json3 = "{\"color\": {\"value\": \"Green\"}}";

    return repository.findByAttributeValueIn(json1, json2, json3, pageable);
}
```

#### 3.4. Native Query - Tìm variant với numeric range ⚠️ WARNING

**⚠️ WARNING: Query này sử dụng `->>` operator, có thể không tận dụng GIN index hiệu quả**

**Repository Method:**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND (pv.cached_attributes->:attributeKey->>'numericValue')::numeric BETWEEN :minValue AND :maxValue
    """, nativeQuery = true)
Page<ProductVariant> findByNumericAttributeRange(
    @Param("attributeKey") String attributeKey,
    @Param("minValue") BigDecimal minValue,
    @Param("maxValue") BigDecimal maxValue,
    Pageable pageable
);
```

**⚠️ Performance Optimization: Tạo Expression Index nếu query này được dùng thường xuyên:**

```sql
-- Tạo index riêng cho numeric attribute nếu cần
CREATE INDEX idx_variants_longevity_numeric
ON product_variants
((cached_attributes->'longevity'->>'numericValue')::numeric)
WHERE status = 'ACTIVE';
```

#### 3.5. Native Query - Full-text search trong JSONB

**Repository Method:**

```java
@Query(value = """
    SELECT * FROM product_variants pv
    WHERE pv.status = 'ACTIVE'
      AND EXISTS (
          SELECT 1 FROM jsonb_each(pv.cached_attributes) AS attr
          WHERE LOWER(attr.value->>'display') LIKE LOWER(CONCAT('%', :searchTerm, '%'))
             OR LOWER(attr.value->>'value') LIKE LOWER(CONCAT('%', :searchTerm, '%'))
      )
    """, nativeQuery = true)
Page<ProductVariant> searchByAttributeDisplayValue(
    @Param("searchTerm") String searchTerm,
    Pageable pageable
);
```

#### 3.6. JPQL - Lưu ý quan trọng

**⚠️ JPQL không hỗ trợ trực tiếp JSONB operators của PostgreSQL.**

Bạn **PHẢI** sử dụng **Native Query** cho các thao tác JSONB như:

- `->` (get JSON object field)
- `->>` (get JSON object field as text)
- `@>` (contains)
- `?` (key exists)
- `jsonb_each()` (iterate over JSONB)

**Không thể dùng JPQL thuần túy:**

```java
// ❌ KHÔNG HOẠT ĐỘNG
@Query("SELECT pv FROM ProductVariant pv WHERE pv.cachedAttributes->'color'->>'value' = :color")
List<ProductVariant> findByColor(String color);

// ✅ PHẢI DÙNG NATIVE QUERY
@Query(value = "SELECT * FROM product_variants WHERE cached_attributes->'color'->>'value' = :color", nativeQuery = true)
List<ProductVariant> findByColor(String color);
```

---

### 4. Repository Methods Summary

`ProductVariantRepository` có 11 methods cho JSONB queries:

- `findByAttributeValue()` - Single attribute
- `findByMultipleAttributes()` - Multiple attributes (AND) ⚡ OPTIMIZED
- `findByAttributeKeyValue()` - Key-value pair ⚡ OPTIMIZED
- `findByAttributeValueIn()` - IN clause ⚡ OPTIMIZED
- `findByNumericAttributeRange()` - Numeric range ⚠️ WARNING
- `findByAttributeValueLike()` - LIKE pattern ⚠️ WARNING
- `findByAttributesAndPriceRange()` - Attributes + price
- `findByCategoryAndAttributes()` - Category + attributes
- `searchByAttributeDisplayValue()` - Full-text search
- `hasAttributeKey()` - Check existence
- `getAttributeValue()` - Get value

---

### 5. Service & Utility

#### Service: ProductVariantAttributeCacheService

- `syncVariantAttributes(Long variantId)` - Sync một variant
- `syncProductVariants(Long productId)` - Sync tất cả variants của product
- `syncAllVariants()` - Sync tất cả variants

#### Utility: JsonbQueryBuilder

- `buildAttributeQuery()` - Single attribute
- `buildMultipleAttributesQuery()` - Multiple attributes
- `buildNumericAttributeQuery()` - Numeric attribute
- `buildInClauseString()` - IN clause helper

---

### 6. Best Practices

#### 6.1. Index JSONB Column ⚡ CRITICAL

**✅ ALWAYS: Tạo GIN index cho cột JSONB**

```sql
CREATE INDEX idx_variants_cached_attributes_gin
ON product_variants USING GIN (cached_attributes);
```

**⚠️ IMPORTANT: GIN index chỉ hoạt động hiệu quả với `@>` (containment) operator**

- ✅ `cached_attributes @> '{"color": {"value": "Red"}}'::jsonb` → Uses GIN index
- ❌ `cached_attributes->'color'->>'value' = 'Red'` → Table scan (unless expression index)

**Rule of thumb:**

- **Luôn ưu tiên `@>` operator** cho exact match queries
- **Tránh `->>` operator** trừ khi thực sự cần thiết (range, LIKE)
- **Tạo expression index** chỉ cho các attribute được query range/LIKE thường xuyên

#### 6.2. Sử dụng Partial Index

Tạo partial index cho các query thường dùng:

```sql
CREATE INDEX idx_variants_color_active
ON product_variants ((cached_attributes->'color'->>'value'))
WHERE status = 'ACTIVE';
```

#### 6.3. Validate JSON Structure

Luôn validate JSON structure trước khi lưu:

```java
public void setCachedAttributes(Map<String, Object> attributes) {
    // Validate structure
    for (Map.Entry<String, Object> entry : attributes.entrySet()) {
        if (!(entry.getValue() instanceof Map)) {
            throw new IllegalArgumentException("Invalid attribute structure");
        }
    }
    this.cachedAttributes = attributes;
}
```

#### 6.4. Type Safety

Sử dụng DTO hoặc wrapper class thay vì `Map<String, Object>` nếu có thể:

```java
// Better approach (if possible)
@Type(JsonType.class)
@Column(name = "cached_attributes", columnDefinition = "jsonb")
private CachedAttributes cachedAttributes;

// Where CachedAttributes is a POJO
public class CachedAttributes {
    private Map<String, AttributeData> attributes;
    // getters, setters
}
```

#### 6.5. Performance Tips

1. **Sử dụng `@>` operator** cho exact match (nhanh nhất)
2. **Tránh `LIKE` trên JSONB** nếu có thể, dùng full-text search
3. **Cache kết quả query** nếu dữ liệu ít thay đổi
4. **Pagination** luôn sử dụng `Pageable` để tránh load quá nhiều data
5. **Always use EAV for writes**: Write to `product_attributes` table, let triggers handle sync
6. **Use JSONB for reads**: Use `cached_attributes` for filtering and searching
7. **Sync after bulk operations**: Manually sync after bulk attribute updates
8. **Monitor cache consistency**: Periodically verify cache matches EAV data

---

### 7. Performance Benefits

| Metric      | Before (EAV) | After (Hybrid) |
| ----------- | ------------ | -------------- |
| Query Time  | 500-2000ms   | 10-50ms        |
| Index Usage | Limited      | GIN index      |
| Scalability | Poor         | Excellent      |

---

### 8. Auto-Sync Mechanism

- **Database triggers** tự động sync khi attributes/variants thay đổi
- **Manual sync** qua `ProductVariantAttributeCacheService` khi cần

Xem chi tiết trong `DATABASE_SCHEMA_ENHANCED.md` → Performance Optimizations section.

---

### 9. Troubleshooting

#### Lỗi: "No Dialect mapping for JDBC type: 1111"

**Nguyên nhân:** Hibernate không nhận diện được JSONB type.

**Giải pháp:** Đảm bảo đã thêm dependency `hypersistence-utils-hibernate-63` và sử dụng `@Type(JsonType.class)`.

#### Lỗi: "operator does not exist: jsonb = text"

**Nguyên nhân:** Đang so sánh JSONB với text trực tiếp.

**Giải pháp:** Sử dụng `->>` để convert JSONB sang text:

```sql
-- ❌ SAI
WHERE cached_attributes->'color' = 'Red'

-- ✅ ĐÚNG
WHERE cached_attributes->'color'->>'value' = 'Red'
```

#### Lỗi: "could not extract ResultSet"

**Nguyên nhân:** JSONB structure không khớp với entity mapping.

**Giải pháp:** Kiểm tra lại cấu trúc JSONB trong database và đảm bảo `Map<String, Object>` có thể deserialize được.

---

### 10. References

- [Hypersistence Utils Documentation](https://vladmihalcea.com/hypersistence-utils/)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Hibernate 6 User Guide](https://docs.jboss.org/hibernate/orm/6.3/userguide/html_single/Hibernate_User_Guide.html)

---

## 🔐 Admin Authentication Features

### Đã Hoàn Thành

#### 1. **JWT Authentication với Spring Security 6** ⭐ NEW

- **Stateless Session**: `SessionCreationPolicy.STATELESS`
- **JWT Token**: Access token (1 hour) + Refresh token (7 days)
- **Token Claims**: userId, email, roles, authorities
- **Filter**: `JwtAuthenticationFilter` tự động validate và load authorities

#### 2. **RBAC (Role-Based Access Control)** ⭐ ENHANCED

- **Multiple Roles**: User có thể có nhiều roles qua `user_roles` table
- **JSONB Permissions**: Permissions lưu trong JSONB format
- **Fine-grained Access**: Resource:action format (e.g., `product:view`, `order:update`)
- **Entity Graph**: Eager fetch roles và permissions để tránh LazyInitializationException

#### 3. **Login API** ⭐ NEW

- **Endpoint**: `POST /api/auth/login`
- **Request**: `LoginRequestDTO` (email, password, rememberMe)
- **Response**: `LoginResponseDTO` (accessToken, refreshToken, user info, roles, authorities)
- **Features**:
  - Account lockout check
  - Failed login attempts tracking
  - Update last login
  - Generate access + refresh tokens

#### 4. **Remember Me**

- Checkbox "Ghi nhớ đăng nhập (30 ngày)" trên login form
- Token expiration: 1 giờ (default) hoặc 30 ngày (rememberMe = true)
- Config: `app.jwt.long-lived-expiration-ms=2592000000`

#### 5. **Change Password**

- Endpoint: `PUT /api/admin/auth/change-password`
- Password strength validation:
  - Tối thiểu 8 ký tự
  - Có chữ hoa, chữ thường, số
- Auto logout sau khi đổi mật khẩu thành công

#### 6. **Account Lockout**

- Sau 5 lần đăng nhập sai → Lock account 30 phút
- Hiển thị số lần thử còn lại
- Tự động reset khi đăng nhập thành công

#### 7. **Login History**

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

---

## 🎯 Event-Driven Architecture - VIP Tier Calculation

### Tổng Quan

Logic tính toán CustomerLifetimeValue và nâng hạng VIP đã được chuyển từ **Database Triggers** sang **Spring Event-Driven Architecture** để:

- ✅ Giảm tải cho Database
- ✅ Tách logic phức tạp ra khỏi Transaction đặt hàng
- ✅ Dễ debug và maintain
- ✅ Scale tốt hơn với async processing

### Kiến Trúc

```
OrderService (Transaction)
    ↓ publish OrderPaidEvent
ApplicationEventPublisher
    ↓ @Async
CustomerEventListener
    ↓ async processing
CustomerService
    ├── updateLifetimeValue()
    └── updateVipTier()
```

### Implementation

#### 1. Event: OrderPaidEvent

File: `modules/customer/event/OrderPaidEvent.java`

Chứa thông tin: `orderId`, `customerId`, `amount`, `customerEmail`, `customerPhone`, `customerName`

#### 2. Publisher: OrderService

File: `modules/order/service/OrderServiceImpl.java`

- Method `updatePaymentStatus()` publish event khi `paymentStatus = "PAID"`
- Sử dụng `ApplicationEventPublisher` để publish event

#### 3. Listener: CustomerEventListener

File: `modules/customer/listener/CustomerEventListener.java`

- `@Async` annotation để xử lý bất đồng bộ
- `@EventListener` để lắng nghe `OrderPaidEvent`
- Gọi `CustomerService.updateLifetimeValueAndVipTier()`

#### 4. Service: CustomerService

File: `modules/customer/service/CustomerServiceImpl.java`

- `findOrCreateCustomer()` - Tìm hoặc tạo customer record
- `updateLifetimeValueAndVipTier()` - Cập nhật lifetime value và kiểm tra VIP tier
- `updateVipTier()` - Tính lại và cập nhật VIP tier

#### 5. Async Configuration

File: `config/AsyncConfig.java`

- `@EnableAsync` để enable async processing
- Thread pool configuration: corePoolSize=5, maxPoolSize=10, queueCapacity=100

### Entities

- `Customer` - Thông tin khách hàng và VIP tier
- `MemberPricingTier` - Các bậc VIP (STANDARD, SILVER, GOLD, PLATINUM, DIAMOND)
- `CustomerLifetimeValue` - Lịch sử giá trị khách hàng
- `CustomerVipHistory` - Lịch sử thay đổi VIP tier
- `Order` - Đơn hàng

### Usage Example

```java
// Trong OrderService, khi order được thanh toán
orderService.updatePaymentStatus(orderId, "PAID");

// Event sẽ được publish tự động
// CustomerEventListener sẽ xử lý bất đồng bộ:
// 1. Tìm/ tạo customer
// 2. Cập nhật total_purchase_amount
// 3. Kiểm tra và upgrade VIP tier nếu đủ điều kiện
// 4. Lưu snapshot vào customer_lifetime_value
// 5. Lưu lịch sử vào customer_vip_history
```

### Benefits

| Aspect           | Before (DB Trigger) | After (Event-Driven) |
| ---------------- | ------------------- | -------------------- |
| Transaction Load | High (blocking)     | Low (async)          |
| Debugging        | Difficult           | Easy (Java code)     |
| Scalability      | Limited             | Excellent            |
| Error Handling   | Database level      | Application level    |
| Testing          | Complex             | Simple (unit tests)  |

---

**Last Updated**: 2024-12-19
