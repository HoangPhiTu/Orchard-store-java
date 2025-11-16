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
- **Spring DevTools**: Hot reload
- **Maven**: Dependency management

---

## 📁 Cấu Trúc Project

```
JAVA-ORCHARD-STORE/
├── .vscode/                        # VS Code workspace settings
│   ├── settings.json
│   └── extensions.json
│
├── orchard-store-backend/          # Spring Boot Backend
│   ├── logs/                       # Backend logs
│   ├── src/
│   │   ├── main/java/com/orchard/orchard_store_backend/
│   │   │   ├── entity/             # JPA Entities
│   │   │   ├── repository/         # JPA Repositories
│   │   │   ├── service/            # Business Logic
│   │   │   ├── controller/         # REST Controllers
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── exception/          # Exception Handlers
│   │   │   └── config/             # Configuration
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
├── orchard-store-admin/            # Admin Panel (Next.js)
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React Components
│   ├── lib/                        # Utilities & API clients
│   ├── types/                      # TypeScript types
│   ├── package.json
│   └── ...
│
├── orchard-store-frontend/         # User Frontend (sẽ có)
│   └── ...
│
├── docs/                           # 📚 Documentation
│   ├── DOCUMENTATION.md            # Tài liệu kỹ thuật (Bean Validation, etc.)
│   ├── DATABASE_SCHEMA_ENHANCED.md # Database schema (38 tables)
│   └── ROADMAP_ENHANCED.md         # Lộ trình phát triển
│
├── .gitignore
└── README.md                       # This file
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

### 6. **Bean Validation** (Xác Thực Dữ Liệu)

#### Implementation
- ✅ Validation cho tất cả DTOs:
  - `BrandDTO`: name, slug, URLs, status
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

### Brands API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | Lấy tất cả brands (có filter activeOnly) |
| GET | `/brands/{id}` | Lấy brand theo ID |
| GET | `/brands/slug/{slug}` | Lấy brand theo slug |
| POST | `/brands` | Tạo brand mới |
| PUT | `/brands/{id}` | Cập nhật brand |
| DELETE | `/brands/{id}` | Xóa brand |

### Categories API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Lấy tất cả categories |
| GET | `/categories/roots` | Lấy root categories |
| GET | `/categories/{id}` | Lấy category theo ID |
| GET | `/categories/slug/{slug}` | Lấy category theo slug |
| GET | `/categories/parent/{parentId}/children` | Lấy children categories |
| POST | `/categories` | Tạo category mới |
| PUT | `/categories/{id}` | Cập nhật category |
| DELETE | `/categories/{id}` | Xóa category |

### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Lấy tất cả products (pagination) |
| GET | `/products/{id}` | Lấy product theo ID |
| GET | `/products/slug/{slug}` | Lấy product theo slug (auto-increment view) |
| GET | `/products/search` | Tìm kiếm products (filters: brandId, categoryId, minPrice, maxPrice, searchTerm) |
| GET | `/products/featured` | Lấy featured products |
| GET | `/products/new` | Lấy new products (pagination) |
| GET | `/products/bestseller` | Lấy bestseller products (pagination) |
| GET | `/products/brand/{brandId}` | Lấy products theo brand |
| GET | `/products/category/{categoryId}` | Lấy products theo category |
| POST | `/products` | Tạo product mới |
| PUT | `/products/{id}` | Cập nhật product |
| DELETE | `/products/{id}` | Xóa product |

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

### Yêu Cầu Hệ Thống
- Java 21+
- Maven 3.6+
- PostgreSQL (hoặc Supabase account)
- IDE (IntelliJ IDEA / Eclipse / VS Code)

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd JAVA-ORCHARD-STORE
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

## 📚 Tài Liệu Tham Khảo

### Documentation Files
- **[DATABASE_SCHEMA_ENHANCED.md](./docs/DATABASE_SCHEMA_ENHANCED.md)** - Chi tiết database schema (38 tables)
- **[ROADMAP_ENHANCED.md](./docs/ROADMAP_ENHANCED.md)** - Lộ trình phát triển 8 phases

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

### Phase 2: Dynamic Attributes System (Chưa Bắt Đầu)
- [ ] Product attributes management
- [ ] Attribute values management
- [ ] Dynamic filtering
- [ ] Attribute-based search

### Phase 3: Inventory Intelligence (Chưa Bắt Đầu)
- [ ] Stock tracking
- [ ] Low stock alerts
- [ ] Pre-orders
- [ ] Restock notifications

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

**Last Updated**: 2024-01-20  
**Version**: 0.0.1-SNAPSHOT  
**Status**: 🟢 In Development (Phase 1 Complete)

