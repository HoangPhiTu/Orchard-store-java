# 🌳 Orchard Store - E-Commerce Platform

Nền tảng thương mại điện tử bán nước hoa và mỹ phẩm chính hãng, tương tự [orchard.vn](https://orchard.vn/), được xây dựng bằng Java Spring Boot.

---

## 📋 Mục Lục

- [Tổng Quan Dự Án](#-tổng-quan-dự-án)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Project](#-cấu-trúc-project)
- [Tiến Trình Phát Triển](#-tiến-trình-phát-triển)
- [Chức Năng Đã Hoàn Thành](#-chức-năng-đã-hoàn-thành)
- [API Endpoints](#-api-endpoints)
- [Hướng Dẫn Setup](#-hướng-dẫn-setup)
- [Git & GitHub](#-git--github)
- [Tài Liệu Tham Khảo](#-tài-liệu-tham-khảo)

---

## 🎯 Tổng Quan Dự Án

### Mục Tiêu

Xây dựng nền tảng e-commerce với **95% tính năng** so với Orchard.vn, bao gồm:

- 🎯 Product Discovery với advanced filtering
- 📦 Inventory Intelligence (real-time stock tracking)
- 🎁 Product Bundling
- 📈 Analytics & Insights
- 💰 Pricing Strategy với VIP tiers
- 🔍 SEO Optimization
- ⚡ High Performance

### Đặc Điểm Nổi Bật

- ✅ **Simplified Authentication**: Khách hàng không cần đăng ký, xác thực đơn hàng qua email
- ✅ **VIP Customer System**: Tự động nâng cấp VIP tier dựa trên tổng giá trị đơn hàng
- ✅ **Dynamic Attributes**: Hệ thống thuộc tính động cho sản phẩm
- ✅ **Monolithic Architecture**: Cấu trúc đơn giản, dễ phát triển

### 🔄 Product Data Architecture (Nov 2025)

- `products` chỉ giữ thông tin “gốc” (brand, category, concentration, SEO chung, thống kê).
- `product_variants` trở thành sản phẩm hoàn chỉnh với slug riêng, tên đầy đủ (ví dụ “Dior Sauvage EDP”), mã nồng độ (`concentration_code`), mô tả/SEO riêng, cờ quản lý tồn kho (`manage_inventory`, `allow_backorder`, `allow_out_of_stock_purchase`).
- Bảng `concentrations` chuẩn hóa nồng độ (EDP, EDT, Parfum…) để gợi ý sản phẩm liên quan.
- `product_attributes` bổ sung `scope` (PRODUCT/VARIANT) + trigger đảm bảo attribute_value khớp attribute_type.
- Bộ chỉ số real-time lưu ở `product_analytics` và `product_daily_sales` để phục vụ dashboard.
- 👉 Chi tiết SQL & migration plan: xem `docs/BACKEND.md`.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

- **Framework**: Spring Boot 3.5.7
- **Java Version**: 21
- **Build Tool**: Maven
- **Database**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA / Hibernate
- **Validation**: Jakarta Bean Validation
- **Security**: Spring Security + JWT (cho Admin/Staff)

### Database

- **Provider**: Supabase (PostgreSQL)
- **Connection Pool**: HikariCP
- **DDL Mode**: Update (development)

### Development Tools

- **Lombok**: Giảm boilerplate code
- **MapStruct**: Tự động map Entity ↔ DTO theo từng module
- **Spring DevTools**: Hot reload
- **Maven**: Dependency management

---

## 📁 Cấu Trúc Project

### 📁 Thư Mục Gốc (`JAVA-ORCHARD-STORE/`)

```
JAVA-ORCHARD-STORE/
├── README.md                         # Tài liệu tổng quan & hướng dẫn setup
├── docs/                             # Bộ tài liệu kỹ thuật chuyên sâu
│   ├── BACKEND.md                    # Tài liệu Backend (Database Schema, Entities, APIs, Security)
│   ├── FRONTEND.md                   # Tài liệu Frontend (Error Handling, Components, WebSocket)
│   ├── PROJECT.md                    # Planning & Roadmap (Lộ trình phát triển)
│   ├── CODING_STANDARDS_COMPLETE.md    # Complete coding standards guide
├── logs/                             # Nhật ký chạy ứng dụng (backend/admin)
├── orchard-store-backend/            # Monolithic Spring Boot backend
├── orchard-store-admin/              # Next.js 14 Admin Panel
├── push-to-github.ps1                # Script PowerShell tự động push GitHub
├── push-to-github-simple.ps1         # Phiên bản rút gọn (không hỏi nhiều)
└── setup-github-repo.ps1             # Script khởi tạo repo + remote
```

### ☕ Backend – `orchard-store-backend/`

```
orchard-store-backend/
├── pom.xml                           # Khai báo dependency: Spring Boot, JPA, Security, MapStruct, Mail, JWT...
├── mvnw*, .mvn/                      # Maven Wrapper
├── logs/                             # Log file khi chạy backend
└── src/
    ├── main/java/com/orchard/orchard_store_backend/
    │   ├── OrchardStoreBackendApplication.java   # Điểm vào Spring Boot (main method)
    │   │
    │   ├── config/                   # Cấu hình lõi ứng dụng
    │   │   ├── DataInitializer.java          # Khởi tạo admin mặc định khi app start
    │   │   ├── SecurityConfig.java          # Định nghĩa filter chain, CORS, route public/protected
    │   │   ├── SchedulerConfig.java         # Bật @EnableScheduling cho cron jobs
    │   │   └── properties/
    │   │       ├── AppProperties.java               # map app.frontend.url
    │   │       ├── JwtProperties.java               # map app.jwt.*
    │   │       └── PasswordResetProperties.java     # map app.password-reset.*
    │   │
    │   ├── exception/
    │   │   └── GlobalExceptionHandler.java  # Bắt validation error, auth error, chuẩn hoá response
    │   │
    │   ├── security/
    │   │   ├── JwtTokenProvider.java        # Sinh/verify JWT (short-lived & long-lived)
    │   │   ├── JwtAuthenticationFilter.java # Filter đọc token từ header
    │   │   └── CustomUserDetailsService.java# Load UserDetails cho Spring Security
    │   │
    │   ├── util/
    │   │   └── UserAgentParser.java         # Phân tích User-Agent (device/browser/OS/IP)
    │   │
    │   └── modules/
    │       ├── auth/                        # Toàn bộ chức năng đăng nhập admin
    │       │   ├── controller/AuthController.java          # REST API: login, /me, change password, login history...
    │       │   ├── dto/                             # DTO request/response (AuthRequestDTO, LoginHistoryDTO,...)
    │       │   ├── entity/                          # User, LoginHistory, PasswordResetToken
    │       │   ├── mapper/                          # MapStruct map Entity <-> DTO
    │       │   ├── repository/                      # JPA repositories tương ứng
    │       │   ├── scheduler/PasswordResetTokenCleanupJob.java # Cron xoá token reset hết hạn
    │       │   └── service/                         # AuthService, LoginHistoryService, PasswordResetService, EmailService (+ implementations)
    │       │
    │       └── catalog/                   # Domain quản lý sản phẩm
    │           ├── brand/                 # Module hoá theo thương hiệu
    │           │   ├── controller/BrandController.java   # CRUD REST cho thương hiệu
    │           │   ├── dto/BrandDTO.java                # DTO validate bằng Bean Validation
    │           │   ├── entity/Brand.java                # Entity + enum Status
    │           │   ├── mapper/BrandMapper.java          # MapStruct cho Brand
    │           │   ├── repository/BrandRepository.java  # Query slug, active list
    │           │   └── service/BrandService(.impl).java # Business logic & validation
    │           │
    │           ├── category/              # Quản lý danh mục dạng cây
    │           │   ├── controller/CategoryController.java
    │           │   ├── dto/CategoryDTO.java            # Có children, SEO fields
    │           │   ├── entity/Category.java            # Parent-child self reference
    │           │   ├── mapper/CategoryMapper.java
    │           │   ├── repository/CategoryRepository.java # Lấy root/children theo level
    │           │   └── service/CategoryService(.impl).java # Tính level, cập nhật quan hệ cha-con
    │           │
    │           ├── product/               # Sản phẩm + biến thể + ảnh
    │           │   ├── controller/ProductController.java
    │           │   ├── dto/ProductDTO.java, ProductVariantDTO.java, ProductImageDTO.java
    │           │   ├── entity/Product.java, ProductVariant.java, ProductImage.java
    │           │   ├── mapper/ProductMapper, ProductVariantMapper, ProductImageMapper
    │           │   ├── repository/ProductRepository với search, featured, bestseller
    │           │   └── service/ProductService(.impl).java  # CRUD + mapping variant/image + attributeValues
    │           │
    │           ├── attribute/             # Dynamic Attributes System
    │           │   ├── controller/        # ProductAttributeController, CategoryAttributeController, ProductAttributeValueController
    │           │   ├── dto/               # ProductAttributeDTO, AttributeValueDTO, CategoryAttributeDTO, ProductAttributeValueDTO
    │           │   ├── entity/            # ProductAttribute, AttributeValue, CategoryAttribute, ProductAttributeValue
    │           │   ├── mapper/            # MapStruct mappers cho attributes
    │           │   ├── repository/        # JPA repositories với query methods
    │           │   └── service/           # Service interfaces + implementations
    │           │
    │           ├── bundle/                # Product Bundling (Gói sản phẩm)
    │           │   ├── controller/ProductBundleController.java  # CRUD bundles, filter theo type/status
    │           │   ├── dto/ProductBundleDTO.java, BundleItemDTO.java
    │           │   ├── entity/ProductBundle.java, BundleItem.java
    │           │   ├── mapper/ProductBundleMapper.java, BundleItemMapper.java
    │           │   ├── repository/ProductBundleRepository.java, BundleItemRepository.java
    │           │   └── service/ProductBundleService(.impl).java  # Auto tính giá bundle, discount calculation
    │           │
    │           ├── pricing/               # Pricing Strategy (Chiến lược giá)
    │           │   ├── controller/ProductPriceHistoryController.java  # Track lịch sử giá
    │           │   ├── dto/ProductPriceHistoryDTO.java
    │           │   ├── entity/ProductPriceHistory.java  # Track price changes, promotions
    │           │   ├── mapper/ProductPriceHistoryMapper.java
    │           │   ├── repository/ProductPriceHistoryRepository.java
    │           │   └── service/ProductPriceHistoryService(.impl).java  # Auto record khi giá thay đổi
    │           │
    │           └── review/                # Product Reviews System
    │               ├── controller/ReviewController.java  # Review management, moderation
    │               ├── dto/ReviewDTO.java, ReviewImageDTO.java, ReviewHelpfulDTO.java
    │               ├── entity/Review.java, ReviewImage.java, ReviewHelpful.java
    │               ├── mapper/ReviewMapper.java, ReviewImageMapper.java
    │               ├── repository/ReviewRepository.java, ReviewImageRepository.java, ReviewHelpfulRepository.java
    │               └── service/ReviewService(.impl).java  # Auto update product rating
    │       │
    │       └── inventory/                 # Inventory Intelligence (Quản lý kho thông minh)
    │           ├── controller/            # InventoryTransactionController, StockAlertController, PreOrderAdminController, PreOrderPublicController
    │           ├── dto/                   # InventoryTransactionDTO, StockAlertDTO, PreOrderDTO
    │           ├── entity/                # InventoryTransaction, StockAlert, PreOrder
    │           ├── mapper/                # MapStruct mappers
    │           ├── repository/            # JPA repositories
    │           └── service/               # InventoryService, StockAlertService, PreOrderService (+ implementations)
    │
    └── main/resources/
        ├── application.properties           # Config mẫu (DB, JWT, Mail, password reset cron...)
        ├── application.properties.example   # Mẫu copy khi setup
        └── data/, db/migration/, static/    # Dự phòng (chưa dùng)
```

### ⚡ Frontend Admin – `orchard-store-admin/`

```
orchard-store-admin/
├── package.json, tsconfig.json, next.config.js  # Cấu hình dự án Next.js 14 + TypeScript
├── app/                                        # App Router cấu trúc trang
│   ├── layout.tsx                              # Root layout, import Tailwind & Providers
│   ├── providers.tsx                           # Khởi tạo React Query Client
│   ├── (auth)/                                 # Nhóm trang public (login/forgot/reset)
│   │   ├── login/page.tsx                      # Form đăng nhập admin + Remember Me
│   │   ├── forgot-password/page.tsx            # Form yêu cầu reset password
│   │   └── reset-password/page.tsx             # Submit token + mật khẩu mới
│   └── (admin)/                                # Nhóm trang bảo vệ cần auth
│       ├── layout.tsx                          # Kiểm tra Zustand authStore, redirect nếu chưa đăng nhập
│       ├── dashboard/page.tsx                  # Placeholder dashboard (stats cards)
│       ├── products/                           # Quản lý sản phẩm (CRUD)
│       ├── brands/                             # Quản lý thương hiệu (CRUD)
│       ├── categories/                         # Quản lý danh mục (CRUD)
│       └── settings/page.tsx                   # Form đổi mật khẩu (gọi API change-password)
├── components/
│   ├── admin/Header.tsx                        # Header hiển thị user + dropdown logout
│   ├── admin/Sidebar.tsx                       # Navigation sidebar (responsive)
│   ├── admin/ProductVariantManager.tsx         # Quản lý variants trong form sản phẩm
│   └── ui/                                     # Bộ UI cơ bản (button/card/input/checkbox/dialog/table/select/textarea/label/badge)
├── lib/
│   ├── api/axios.ts                            # Axios instance + interceptor gắn JWT & xử lý 401
│   ├── api/auth.ts                             # Wrapper call API auth (login, me, change pw, forgot/reset)
│   ├── api/products.ts                         # API client cho products
│   ├── api/brands.ts                           # API client cho brands
│   ├── api/categories.ts                       # API client cho categories
│   └── utils/cn.ts                             # Helper gộp class Tailwind
├── middleware.ts                               # Định nghĩa route public (login/forgot/reset)
├── store/authStore.ts                          # Zustand + persist quản lý token/user/isAuthenticated
├── types/                                      # TypeScript interface dùng chung (AuthResponseDTO, ProductDTO, BrandDTO, CategoryDTO)
└── app/globals.css + tailwind.config.ts        # Styling (Tailwind + shadcn/ui theme)
```

### 📂 Tổ Chức Thư Mục

#### **`.vscode/` - VS Code Settings**

- **Vị trí**: ✅ **ROOT** (`JAVA-ORCHARD-STORE/.vscode/`)
- **Lý do**: Workspace settings áp dụng cho toàn bộ project
- **Nội dung**: Java, TypeScript, ESLint configurations

#### **`logs/` - Log Files**

- **Vị trí**: ✅ **Tách riêng cho từng module**
- **Backend**: `orchard-store-backend/logs/`
- **Admin**: `orchard-store-admin/logs/` (nếu cần)
- **Lý do**: Dễ debug, tránh conflict, dễ cleanup

#### **`docs/` - Documentation**

- **Vị trí**: ✅ **ROOT** (`JAVA-ORCHARD-STORE/docs/`)
- **Nội dung**: Tài liệu kỹ thuật chuyên sâu, database schema, roadmap, development plans

---

## 📊 Tiến Trình Phát Triển

### ✅ Phase 1: Foundation & Core Setup (Hoàn Thành)

#### 1.1 Project Setup

- [x] Tạo Spring Boot project với Maven
- [x] Cấu hình dependencies (JPA, PostgreSQL, Validation)
- [x] Setup Supabase PostgreSQL connection
- [x] Cấu hình HikariCP connection pool
- [x] Setup logging configuration

#### 1.2 Database Schema Design

- [x] Thiết kế database schema (38 tables)
- [x] ERD documentation
- [x] Database functions & triggers (VIP system)
- [x] Indexes optimization

#### 1.3 Core Entities & Repositories

- [x] Brand entity & repository
- [x] Category entity & repository (hierarchical)
- [x] Product entity & repository
- [x] ProductVariant entity & repository
- [x] ProductImage entity & repository

#### 1.4 Services & Controllers

- [x] BrandService & BrandController
- [x] CategoryService & CategoryController
- [x] ProductService & ProductController

#### 1.5 Validation & Exception Handling

- [x] Bean Validation cho tất cả DTOs
- [x] GlobalExceptionHandler
- [x] Validation error messages (tiếng Việt)

#### 1.6 Admin Authentication

- [x] Spring Security với JWT
- [x] User entity & repository
- [x] JWT Token Provider (short-lived & long-lived)
- [x] AuthService & AuthController
- [x] Login với Remember Me
- [x] Account Lockout mechanism
- [x] Change Password
- [x] Auto-create default admin account
- [x] Protected admin routes
- [x] Frontend login page
- [x] Settings page với Change Password

#### 1.7 Service Layer Refactor (Interface + Implementation)

- [x] Tách `AuthService`, `LoginHistoryService`, `PasswordResetService`, `BrandService`, `CategoryService`, `ProductService` thành interface riêng
- [x] Tạo `*ServiceImpl` tương ứng với `@Service` để giữ business logic
- [x] Controllers & schedulers (PasswordResetTokenCleanupJob) inject qua interface → dễ mock/test
- [x] Đảm bảo cấu trúc module hóa hoàn chỉnh, chuẩn bị tốt cho bước viết test theo domain

---

## ✅ Chức Năng Đã Hoàn Thành

### 1. **Brand Management** (Quản Lý Thương Hiệu)

#### Entities & Repositories

- ✅ `Brand` entity với đầy đủ fields (name, slug, description, logo, country, website)
- ✅ `BrandRepository` với các query methods:
  - Tìm theo slug
  - Lấy tất cả brands active
  - Kiểm tra slug tồn tại

#### Services

- ✅ `BrandService` với đầy đủ CRUD operations
- ✅ Business logic validation (slug unique, etc.)

#### Controllers & APIs

- ✅ `BrandController` với REST endpoints
- ✅ Validation với Bean Validation

#### Features

- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Tìm kiếm theo slug
- ✅ Filter theo status (ACTIVE/INACTIVE)
- ✅ Sắp xếp theo displayOrder

---

### 2. **Category Management** (Quản Lý Danh Mục)

#### Entities & Repositories

- ✅ `Category` entity với hierarchical structure (parent-child)
- ✅ `CategoryRepository` với các query methods:
  - Lấy root categories
  - Lấy children categories
  - Tìm theo slug
  - Filter theo level

#### Services

- ✅ `CategoryService` với đầy đủ CRUD operations
- ✅ Hierarchical operations (add/remove children)
- ✅ Auto-calculate level

#### Controllers & APIs

- ✅ `CategoryController` với REST endpoints
- ✅ Support hierarchical queries

#### Features

- ✅ CRUD operations
- ✅ Hierarchical structure (parent-child)
- ✅ Auto-calculate level
- ✅ Tìm kiếm theo slug
- ✅ Lấy root categories
- ✅ Lấy children categories

---

### 3. **Product Management** (Quản Lý Sản Phẩm)

#### Entities & Repositories

- ✅ `Product` entity với đầy đủ fields:
  - Basic info (name, slug, description)
  - Pricing (basePrice, salePrice)
  - SEO (metaTitle, metaDescription, metaKeywords)
  - Statistics (viewCount, soldCount, rating)
  - Display flags (isFeatured, isNew, isBestseller)
- ✅ `ProductRepository` với advanced queries:
  - Search với filters (brand, category, price range, search term)
  - Pagination & sorting
  - Featured/New/Bestseller products
  - Top viewed/selling products

#### Services

- ✅ `ProductService` với đầy đủ CRUD operations
- ✅ Search & filter functionality
- ✅ Auto-increment viewCount khi xem chi tiết
- ✅ Load variants & images

#### Controllers & APIs

- ✅ `ProductController` với REST endpoints
- ✅ Advanced search & filtering
- ✅ Pagination support

#### Features

- ✅ CRUD operations
- ✅ Advanced search (brand, category, price, keyword)
- ✅ Pagination & sorting
- ✅ Featured/New/Bestseller products
- ✅ Auto-increment view count
- ✅ SEO fields support

---

### 4. **Product Variant Management** (Quản Lý Biến Thể Sản Phẩm)

#### Entities & Repositories

- ✅ `ProductVariant` entity với:
  - Pricing (price, salePrice, costPrice)
  - Inventory (stockQuantity, reservedQuantity, availableQuantity)
  - Weight & dimensions
  - SKU management
- ✅ `ProductVariantRepository` với queries:
  - Tìm theo SKU
  - Lấy variants theo product
  - Low stock & out of stock alerts

#### Services

- ✅ Auto-calculate availableQuantity
- ✅ Stock management

#### Features

- ✅ CRUD operations
- ✅ SKU management
- ✅ Inventory tracking
- ✅ Auto-calculate available quantity
- ✅ Low stock threshold

---

### 5. **Product Image Management** (Quản Lý Hình Ảnh)

#### Entities & Repositories

- ✅ `ProductImage` entity với:
  - imageUrl, thumbnailUrl
  - altText
  - displayOrder
  - isPrimary flag
- ✅ `ProductImageRepository` với queries:
  - Lấy primary image
  - Sắp xếp theo displayOrder

#### Features

- ✅ CRUD operations
- ✅ Primary image support
- ✅ Display order
- ✅ Thumbnail support

---

### 6. **Admin Authentication** (Xác Thực Admin/Staff)

#### Entities & Repositories

- ✅ `User` entity cho Admin/Staff:
  - Email, password, fullName, phone
  - Role (ADMIN, STAFF)
  - Status (ACTIVE, INACTIVE, BANNED)
  - Failed login attempts tracking
  - Account lockout mechanism
- ✅ `UserRepository` với queries:
  - Tìm theo email
  - Kiểm tra email tồn tại

#### Security

- ✅ Spring Security với JWT authentication
- ✅ JWT Token Provider (short-lived & long-lived tokens)
- ✅ JWT Authentication Filter
- ✅ Custom UserDetailsService
- ✅ Password encryption (BCrypt)
- ✅ Role-based access control (RBAC)

#### Services & Controllers

- ✅ `AuthService` với:
  - Login với remember me support
  - Account lockout sau 5 lần sai
  - Change password
- ✅ `AuthController` với endpoints:
  - `POST /api/admin/auth/login` - Đăng nhập
  - `GET /api/admin/auth/me` - Lấy thông tin user hiện tại
  - `PUT /api/admin/auth/change-password` - Đổi mật khẩu
  - `GET /api/admin/auth/login-history` - Lấy lịch sử đăng nhập (pagination)
  - `GET /api/admin/auth/login-history/recent` - Lấy 10 lần đăng nhập gần nhất
  - `GET /api/admin/auth/login-history/stats` - Thống kê đăng nhập
  - `POST /api/admin/auth/forgot-password` - Yêu cầu đặt lại mật khẩu
  - `POST /api/admin/auth/reset-password` - Đặt lại mật khẩu với token
  - `GET /api/admin/auth/validate-reset-token` - Xác thực reset token

#### Features

- ✅ Login với email/password
- ✅ Remember Me (30 ngày token)
- ✅ Account Lockout (5 lần sai → lock 30 phút)
- ✅ Change Password với validation
- ✅ JWT token-based authentication
- ✅ Protected admin routes
- ✅ Auto-create default admin account
- ✅ Login History tracking (IP, device, browser, OS, location)
- ✅ Forgot/Reset Password với email token (cần cấu hình email service)

#### Frontend (Admin Panel)

- ✅ Login page với form validation
- ✅ Remember Me checkbox
- ✅ Protected routes middleware
- ✅ Auth store (Zustand) với persistence
- ✅ Settings page với Change Password form
- ✅ Header với user menu & logout
- ✅ Forgot Password page
- ✅ Reset Password page với token validation

---

### 7. **Bean Validation** (Xác Thực Dữ Liệu)

#### Implementation

- ✅ Validation cho tất cả DTOs:
  - `BrandDTO`: name, slug, URLs, status
  - `AuthRequestDTO`: email, password, rememberMe
  - `ChangePasswordDTO`: password strength validation
  - `CategoryDTO`: name, slug, URLs, status
  - `ProductDTO`: name, slug, prices, brandId, categoryId
  - `ProductVariantDTO`: SKU, price, stock, dimensions
  - `ProductImageDTO`: imageUrl, displayOrder

#### Validation Rules

- ✅ `@NotBlank` - Required fields
- ✅ `@NotNull` - Non-null fields
- ✅ `@Size` - String length
- ✅ `@Pattern` - Regex validation (slug, URL, status)
- ✅ `@Min/@Max` - Number range
- ✅ `@DecimalMin/@DecimalMax` - Decimal range
- ✅ `@Digits` - Number format
- ✅ `@Positive` - Positive numbers
- ✅ `@Valid` - Nested object validation

#### Error Handling

- ✅ `GlobalExceptionHandler` xử lý validation errors
- ✅ Error messages tiếng Việt
- ✅ Chi tiết lỗi theo từng field

---

### 7. **Exception Handling** (Xử Lý Lỗi)

#### Implementation

- ✅ `GlobalExceptionHandler` với `@RestControllerAdvice`
- ✅ Xử lý `MethodArgumentNotValidException` (validation errors)
- ✅ Xử lý `RuntimeException` (business logic errors)
- ✅ Xử lý generic `Exception`

#### Error Response Format

```json
{
  "timestamp": "2024-01-20T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường sau:",
  "errors": {
    "name": "Tên sản phẩm không được để trống",
    "slug": "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
  }
}
```

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:8080/api
```

### Admin Authentication API

| Method | Endpoint                      | Description                 | Auth Required |
| ------ | ----------------------------- | --------------------------- | ------------- |
| POST   | `/admin/auth/login`           | Đăng nhập Admin/Staff       | ❌ No         |
| GET    | `/admin/auth/me`              | Lấy thông tin user hiện tại | ✅ Yes        |
| PUT    | `/admin/auth/change-password` | Đổi mật khẩu                | ✅ Yes        |

**Login Request:**

```json
{
  "email": "tuhoang.170704@gmail.com",
  "password": "admin123",
  "rememberMe": false
}
```

**Login Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "tuhoang.170704@gmail.com",
  "fullName": "Administrator",
  "role": "ADMIN"
}
```

**Change Password Request:**

```json
{
  "currentPassword": "admin123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Lưu ý:**

- Default admin account: `tuhoang.170704@gmail.com` / `admin123`
- Token expiration: 1 giờ (default) hoặc 30 ngày (nếu rememberMe = true)
- Account lockout: Sau 5 lần đăng nhập sai → Lock 30 phút

---

### Brands API

| Method | Endpoint              | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/brands`             | Lấy tất cả brands (có filter activeOnly) |
| GET    | `/brands/{id}`        | Lấy brand theo ID                        |
| GET    | `/brands/slug/{slug}` | Lấy brand theo slug                      |
| POST   | `/brands`             | Tạo brand mới                            |
| PUT    | `/brands/{id}`        | Cập nhật brand                           |
| DELETE | `/brands/{id}`        | Xóa brand                                |

### Categories API

| Method | Endpoint                                 | Description             |
| ------ | ---------------------------------------- | ----------------------- |
| GET    | `/categories`                            | Lấy tất cả categories   |
| GET    | `/categories/roots`                      | Lấy root categories     |
| GET    | `/categories/{id}`                       | Lấy category theo ID    |
| GET    | `/categories/slug/{slug}`                | Lấy category theo slug  |
| GET    | `/categories/parent/{parentId}/children` | Lấy children categories |
| POST   | `/categories`                            | Tạo category mới        |
| PUT    | `/categories/{id}`                       | Cập nhật category       |
| DELETE | `/categories/{id}`                       | Xóa category            |

### Products API

| Method | Endpoint                          | Description                                                                      |
| ------ | --------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/products`                       | Lấy tất cả products (pagination)                                                 |
| GET    | `/products/{id}`                  | Lấy product theo ID                                                              |
| GET    | `/products/slug/{slug}`           | Lấy product theo slug (auto-increment view)                                      |
| GET    | `/products/search`                | Tìm kiếm products (filters: brandId, categoryId, minPrice, maxPrice, searchTerm) |
| GET    | `/products/featured`              | Lấy featured products                                                            |
| GET    | `/products/new`                   | Lấy new products (pagination)                                                    |
| GET    | `/products/bestseller`            | Lấy bestseller products (pagination)                                             |
| GET    | `/products/brand/{brandId}`       | Lấy products theo brand                                                          |
| GET    | `/products/category/{categoryId}` | Lấy products theo category                                                       |
| POST   | `/products`                       | Tạo product mới                                                                  |
| PUT    | `/products/{id}`                  | Cập nhật product                                                                 |
| DELETE | `/products/{id}`                  | Xóa product                                                                      |

#### Query Parameters (Products)

**Pagination:**

- `page` (default: 0) - Số trang
- `size` (default: 20) - Số items mỗi trang
- `sortBy` (default: "createdAt") - Field để sort
- `sortDir` (default: "DESC") - Hướng sort (ASC/DESC)

**Search Filters:**

- `brandId` - Filter theo brand
- `categoryId` - Filter theo category
- `minPrice` - Giá tối thiểu
- `maxPrice` - Giá tối đa
- `searchTerm` - Từ khóa tìm kiếm

---

## 🚀 Hướng Dẫn Setup

> **📖 Xem hướng dẫn chi tiết:** [SETUP.md](./SETUP.md)

### Yêu Cầu Hệ Thống

- Java 21+
- Maven 3.6+ (hoặc dùng Maven Wrapper đã có sẵn)
- Node.js 20+
- PostgreSQL (hoặc Supabase account)
- IDE (IntelliJ IDEA / Eclipse / VS Code)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git
cd Orchard-store-java-private

# 2. Setup Backend
cd orchard-store-backend
mvn clean install
mvn spring-boot:run

# 3. Setup Dashboard (terminal mới)
cd orchard-store-dashboad
npm install
npm run dev
```

**Xem hướng dẫn đầy đủ và troubleshooting:** [SETUP.md](./SETUP.md)

### Bước 1: Clone Repository

```bash
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git
cd Orchard-store-java-private
```

### Bước 2: Cấu Hình Database

1. Tạo Supabase project tại [supabase.com](https://supabase.com)
2. Lấy connection string từ Supabase Dashboard > Settings > Database
3. Cập nhật `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### Bước 2.1: Cấu Hình Email (Forgot Password)

Forgot/Reset Password sử dụng SMTP để gửi email. Bạn có thể dùng Gmail (App Password) hoặc dịch vụ khác (SendGrid, Mailgun, AWS SES, ...).

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Cấu hình frontend/url để generate link reset
app.frontend.url=http://localhost:3001
app.password-reset.token-expiration-hours=24
app.password-reset.max-requests-per-day=5
app.password-reset.cleanup-cron=0 0 * * * *
```

> **Lưu ý:** Nếu dùng Gmail bạn phải bật 2FA và tạo App Password. Đối với các nhà cung cấp SMTP khác chỉ cần thay host/port/username/password tương ứng.

### Bước 3: Build Project

```bash
cd orchard-store-backend
mvn clean install
```

### Bước 4: Chạy Application

```bash
mvn spring-boot:run
```

Hoặc chạy từ IDE:

- Mở `OrchardStoreBackendApplication.java`
- Click Run

### Bước 5: Kiểm Tra

- Application chạy tại: `http://localhost:8080`
- Test API: `http://localhost:8080/api/brands`

---

## 🎛️ Admin Panel Setup

### Yêu Cầu

- Node.js 18+
- npm hoặc yarn
- Spring Boot backend đang chạy tại `http://localhost:8080`

### Setup Admin Panel

```bash
# Di chuyển vào thư mục admin
cd orchard-store-admin

# Install dependencies
npm install

# Tạo file .env.local (nếu chưa có)
# Copy từ .env.local.example hoặc tạo mới với nội dung:
# NEXT_PUBLIC_API_URL=http://localhost:8080/api
# NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# Chạy development server
npm run dev
```

Admin panel sẽ chạy tại: `http://localhost:3001`

### Cấu Trúc Admin Panel

```
orchard-store-admin/
├── app/
│   ├── (auth)/                    # Authentication routes
│   ├── (admin)/                   # Admin routes (protected)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── brands/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── customers/
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── admin/                     # Admin-specific components
├── lib/
│   ├── api/                       # API clients
│   └── utils/                     # Helper functions
└── types/                         # TypeScript types
```

### Tính Năng Admin Panel

- ✅ Dashboard với statistics
- ✅ Product Management (CRUD)
- ✅ Brand Management (CRUD)
- ✅ Category Management (CRUD, Hierarchical)
- ✅ Order Management (View, Update status)
- ✅ Customer Management (View, Analytics)
- ✅ Authentication (JWT) - Sẽ implement

### Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

---

## 🔧 Git & GitHub

### ⚡ Quick Start - Push Lên GitHub (3 Bước Nhanh)

#### 1. Tạo Repository Trên GitHub

1. Vào https://github.com/new
2. Đặt tên: `orchard-store` (hoặc tên bạn muốn)
3. Chọn **Private** (khuyến nghị)
4. **KHÔNG** tích "Initialize with README"
5. Click **Create repository**

#### 2. Add Remote và Push

```bash
# Thay YOUR_USERNAME và YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: Orchard Store E-Commerce Platform

- Spring Boot backend với Product, Brand, Category management
- Next.js admin panel setup
- Database schema design (38 tables)
- Bean Validation implementation"

# Push lên GitHub
git branch -M main
git push -u origin main
```

**Lưu ý:** Nếu hỏi username/password:

- Username: GitHub username của bạn
- Password: **Personal Access Token** (không phải password GitHub)

#### 3. Tạo Personal Access Token (Nếu Cần)

1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token (classic)
3. Chọn scope: `repo`
4. Generate và copy token
5. Dùng token này khi push (thay vì password)

---

### 🚀 Setup Repository Lần Đầu (Chi Tiết)

#### Bước 1: Tạo GitHub Repository

1. Đăng nhập vào [GitHub](https://github.com)
2. Click **New repository** (hoặc vào: https://github.com/new)
3. Điền thông tin:
   - **Repository name**: `orchard-store` (hoặc tên bạn muốn)
   - **Description**: `E-Commerce Platform for Perfumes & Cosmetics - Orchard Store`
   - **Visibility**: Private (khuyến nghị) hoặc Public
   - **Không** tích "Initialize with README" (vì đã có README.md)
4. Click **Create repository**

#### Bước 2: Khởi Tạo Git Repository (Local)

```powershell
# Di chuyển vào thư mục project
cd C:\xampp\htdocs\JAVA-ORCHARD-STORE

# Khởi tạo git repository
git init

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### Bước 3: Push Code Lên GitHub

```powershell
# Add files
git add .

# Commit
git commit -m "Initial commit: Orchard Store E-Commerce Platform"

# Push
git branch -M main
git push -u origin main
```

**Lưu ý:** Nếu gặp lỗi authentication, sử dụng **Personal Access Token** (PAT) thay vì password.

---

### 📋 Git Workflow Hàng Ngày

#### Khi Bắt Đầu Làm Việc:

```powershell
# Pull code mới nhất (nếu làm việc nhóm)
git pull origin main

# Kiểm tra status
git status
```

#### Khi Làm Xong Một Tính Năng:

```powershell
# Xem thay đổi
git status
git diff

# Add files
git add .

# Commit với message rõ ràng
git commit -m "feat: Add product search functionality"

# Push lên GitHub
git push origin main
```

#### Commit Message Format:

```
<type>: <subject>

<body>
```

**Types:**

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Formatting, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

**Ví dụ:**

```bash
git commit -m "feat: Add product search with filters

- Implement search by brand, category, price range
- Add pagination support
- Add sorting functionality"
```

---

### 🔄 Lấy Lại Code Cũ Từ GitHub

#### 1. Xem Code Cũ Trên GitHub

- Vào repository > Click vào số commits > Chọn commit bạn muốn xem
- Hoặc vào file > Click "History" > Chọn commit

#### 2. Xem Code Cũ Bằng Git (Local)

```powershell
# Xem lịch sử commits
git log --oneline

# Xem file tại commit cụ thể
git show <commit-hash>:<file-path>

# Ví dụ
git show d8a32df:README.md
```

#### 3. Restore File Từ Commit Cũ

```powershell
# Lấy lại 1 file từ commit cũ
git checkout <commit-hash> -- <file-path>

# Ví dụ: Lấy lại README.md từ commit d8a32df
git checkout d8a32df -- README.md

# Commit lại
git add README.md
git commit -m "restore: Restore README.md from previous commit"
git push origin main
```

#### 4. Revert Commit (Undo Thay Đổi)

```powershell
# Revert commit cuối cùng (an toàn)
git revert HEAD
git push origin main

# Revert commit cụ thể
git revert <commit-hash>
```

**Lưu ý:** `revert` tạo commit mới để undo thay đổi, **KHÔNG xóa** commit cũ (an toàn).

#### 5. Tạo Branch Từ Commit Cũ

```powershell
# Tạo branch mới từ commit cũ
git checkout -b <branch-name> <commit-hash>

# Ví dụ
git checkout -b old-version d8a32df

# Push branch lên GitHub
git push -u origin old-version
```

---

### 📜 PowerShell Scripts

#### 1. `setup-github-repo.ps1` - Setup Repository Lần Đầu

```powershell
.\setup-github-repo.ps1 -GitHubUsername "YOUR_USERNAME" -RepositoryName "orchard-store"
```

**Tính năng:**

- ✅ Kiểm tra và khởi tạo Git repository
- ✅ Cấu hình Git user.name và user.email
- ✅ Thêm remote origin
- ✅ Kiểm tra .gitignore

#### 2. `push-to-github.ps1` - Push Code (Đầy Đủ)

```powershell
# Sử dụng mặc định
.\push-to-github.ps1

# Với tham số
.\push-to-github.ps1 -CommitMessage "feat: Your feature"
```

**Tính năng:**

- ✅ Kiểm tra Git đã cài đặt
- ✅ Tự động thêm remote (nếu chưa có)
- ✅ Cảnh báo nếu application.properties bị commit
- ✅ Preview files sẽ commit
- ✅ Error handling đầy đủ

#### 3. `push-to-github-simple.ps1` - Push Code (Đơn Giản)

```powershell
.\push-to-github-simple.ps1
```

**Phù hợp cho:** Người đã quen với Git, muốn push nhanh.

---

### 🔒 Bảo Mật

#### Files Đã Được Bảo Vệ

✅ **Đã ignore:**

- `application.properties` (chứa database password, JWT secrets)
- `.env.local` (chứa API keys)
- `logs/`, `node_modules/`, `target/`

✅ **Đã tạo file example:**

- `application.properties.example` (template không có credentials)
- `.env.local.example` (template không có credentials)

#### Hướng Dẫn Cho Team Members

Khi clone project:

1. **Backend:**

```bash
cd orchard-store-backend/src/main/resources
cp application.properties.example application.properties
# Sau đó điền credentials thực tế vào application.properties
```

2. **Admin Panel:**

```bash
cd orchard-store-admin
cp .env.local.example .env.local
# Sau đó điền API URL vào .env.local
```

---

### 🆘 Troubleshooting

#### Lỗi: "Authentication failed"

- Sử dụng Personal Access Token thay vì password
- Tạo token: GitHub > Settings > Developer settings > Personal access tokens

#### Lỗi: "Updates were rejected"

```powershell
# Pull code mới nhất
git pull origin main

# Resolve conflicts (nếu có)
# Sau đó push lại
git push origin main
```

#### Lỗi: "application.properties bị commit"

```powershell
# Xóa khỏi Git (nhưng giữ file local)
git rm --cached orchard-store-backend/src/main/resources/application.properties
git commit -m "Remove application.properties from Git"
git push origin main
```

---

## 📚 Tài Liệu Tham Khảo

### Documentation Files

- **[SETUP.md](./SETUP.md)** - Complete setup guide with troubleshooting
- **[docs/ADMIN_DASHBOARD_COMPLETE.md](./docs/ADMIN_DASHBOARD_COMPLETE.md)** - Admin dashboard analysis & fix roadmap
- **[docs/PRODUCTS_MANAGEMENT_COMPLETE.md](./docs/PRODUCTS_MANAGEMENT_COMPLETE.md)** - Complete products management development plan
- **[docs/CODING_STANDARDS_COMPLETE.md](./docs/CODING_STANDARDS_COMPLETE.md)** - Complete coding standards guide
- **[docs/BACKEND.md](./docs/BACKEND.md)** - Database schema & backend documentation
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Frontend documentation
- **[docs/PROJECT.md](./docs/PROJECT.md)** - Planning & roadmap

### External Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Supabase Documentation](https://supabase.com/docs)
- [Jakarta Bean Validation](https://beanvalidation.org/)

---

## 📝 Ghi Chú

### Database Schema

- Database schema được thiết kế với **38 tables** bao gồm:
  - Core entities (Brands, Categories, Products)
  - Dynamic attributes system
  - Inventory intelligence
  - Product bundling
  - Analytics & SEO
  - VIP customer system
  - Order management

### Authentication

- **Admin/Staff**: JWT authentication (chưa implement)
- **Customers**: Không cần đăng ký, xác thực qua email verification code

### VIP System

- Tự động nâng cấp VIP tier dựa trên tổng giá trị đơn hàng
- 5 tiers: Standard, Silver, Gold, Platinum, Diamond
- Database functions & triggers tự động xử lý

---

## 🔄 Tiếp Theo

### Phase 2: Dynamic Attributes System (✅ Hoàn Thành)

- [x] Product attributes management
- [x] Attribute values management
- [x] Category attributes assignment
- [x] Product attribute values assignment
- [x] Integration vào ProductDTO (attributeValues field)

### Phase 3: Inventory Intelligence (✅ Hoàn Thành)

- [x] Stock tracking (InventoryTransaction)
- [x] Low stock alerts (StockAlert)
- [x] Pre-orders (PreOrder)
- [x] Restock notifications
- [x] Integration vào ProductVariantDTO (stockStatus field)

### Phase 4: Shopping Cart & Checkout (Chưa Bắt Đầu)

- [ ] Shopping cart
- [ ] Guest checkout
- [ ] Email verification
- [ ] Order management

### Phase 5: VIP Customer System (Chưa Bắt Đầu)

- [ ] Customer tracking
- [ ] VIP tier auto-upgrade
- [ ] Discount calculation
- [ ] Lifetime value tracking

---

## 👥 Contributors

- **Developer**: [Your Name]
- **Project**: Orchard Store E-Commerce Platform

---

## 📄 License

This project is private and proprietary.

---

**Last Updated**: 2025-11-18  
**Version**: 0.1.0-SNAPSHOT  
**Status**: 🟢 In Development (Phase 1-3 Complete)

### ✅ Recent Completions (2025-11-18)

#### Product Bundling Module

- ✅ Entity, Repository, DTO, Mapper, Service, Controller hoàn chỉnh
- ✅ CRUD operations, tự động tính giá bundle và discount
- ✅ Hỗ trợ 4 loại bundle: CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET
- ✅ API: `/api/admin/bundles`

#### Product Price History

- ✅ Track lịch sử thay đổi giá, tự động record khi giá thay đổi
- ✅ Query theo variant, promotion, change type
- ✅ API: `/api/admin/price-history`

#### Product Reviews System

- ✅ Review management với moderation, images, helpful votes
- ✅ Auto update product rating, verified purchase reviews
- ✅ API: `/api/reviews`

#### ProductDTO Enhancements

- ✅ Dynamic Attributes integration: ProductDTO có `attributeValues` list
- ✅ Inventory integration: ProductVariantDTO có `stockStatus` (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
