# 📋 Project Planning & Roadmap - Orchard Store

**Last Updated**: 2025-11-22

> **📌 Xem thêm:**
> - **[BACKEND.md](./BACKEND.md)**: Backend documentation
> - **[FRONTEND.md](./FRONTEND.md)**: Frontend documentation
> - **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**: Coding standards

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Technology Stack](#-technology-stack)
3. [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
4. [Lộ Trình Phát Triển](#-lộ-trình-phát-triển)
5. [Delivery Plan](#-delivery-plan)
6. [Implementation Priority](#-implementation-priority)

---

## 🎯 Tổng Quan Dự Án

### Mục Tiêu

Xây dựng nền tảng thương mại điện tử bán nước hoa và mỹ phẩm chính hãng, tương tự [orchard.vn](https://orchard.vn/), sử dụng Java Spring Boot làm backend chính.

**Mục tiêu**: Đạt **95% tính năng** so với Orchard.vn

### Business Context Analysis

**Orchard.vn Feature Mapping:**

- 🎯 **Product Discovery**: Advanced filtering by fragrance, concentration, gender, price range
- 📦 **Inventory Intelligence**: Real-time stock tracking, pre-orders, restock notifications
- 🎁 **Product Bundling**: Curated sets, gift packages, combo deals
- 📈 **Analytics & Insights**: Product views, conversion tracking, popular products
- 💰 **Pricing Strategy**: Price history, discount tracking, member pricing
- 🔍 **SEO Optimization**: URL structure, redirects, canonical URLs
- ⚡ **Performance**: Fast filtering, search, product comparisons

### Đặc Điểm Nổi Bật

- ✅ **Simplified Authentication**: Khách hàng không cần đăng ký, xác thực đơn hàng qua email
- ✅ **VIP Customer System**: Tự động nâng cấp VIP tier dựa trên tổng giá trị đơn hàng
- ✅ **Dynamic Attributes**: Hệ thống thuộc tính động cho sản phẩm
- ✅ **Monolithic Architecture**: Cấu trúc đơn giản, dễ phát triển

---

## 🛠️ Technology Stack

### Backend

- **Framework**: Spring Boot 3.5.7
- **Java Version**: 21
- **Build Tool**: Maven
- **Database**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Validation**: Jakarta Bean Validation
- **File Upload**: Spring Multipart + Cloud Storage (AWS S3 / Cloudinary)
- **Email**: Spring Mail
- **Caching**: Redis (optional)
- **WebSocket**: Spring WebSocket + STOMP

### Frontend (Admin Dashboard)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Notifications**: Sonner (Toast) + WebSocket (STOMP)
- **JWT**: jose (Edge Runtime compatible)

### Infrastructure

- **Containerization**: Docker
- **CI/CD**: GitHub Actions / Jenkins
- **Cloud**: AWS / Azure / Google Cloud (optional)
- **CDN**: CloudFlare (cho static assets)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (Next.js) - Admin Dashboard, Product Discovery         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│              Spring Boot Backend                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers (REST API)                          │   │
│  │  - ProductController                             │   │
│  │  - AttributeController (Filtering)               │   │
│  │  - AnalyticsController                           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Services (Business Logic)                       │   │
│  │  - ProductService                                │   │
│  │  - AttributeService (Dynamic Filtering)          │   │
│  │  - InventoryService                              │   │
│  │  - AnalyticsService                              │   │
│  │  - PricingService                                │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Repositories (Data Access)                      │   │
│  │  - JPA Repositories                              │   │
│  │  - Custom Queries (Filtering, Analytics)        │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Security (JWT + RBAC)                           │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┬──────────────┐
    │                │                │              │
┌───▼───┐    ┌──────▼──────┐  ┌──────▼──────┐  ┌───▼───┐
│PostgreSQL│  │   Redis     │  │Elasticsearch│  │File   │
│(Supabase)│  │  (Cache)    │  │  (Search)   │  │Storage│
└─────────┘  └─────────────┘  └─────────────┘  └───────┘
```

---

## 🚀 Lộ Trình Phát Triển (8 Phases)

### **PHASE 1: Foundation & Core Setup** ✅ **HOÀN THÀNH**

#### 1.1 Project Setup & Infrastructure

- [x] Cấu hình Spring Boot với dependencies
- [x] Setup database (Supabase PostgreSQL)
- [x] Cấu hình application.properties
- [x] Setup project structure
- [x] Setup logging (Logback)
- [x] Setup exception handling global

#### 1.2 Core Entities (Foundation)

- [x] **User** entity + repository
- [x] **Brand** entity + repository
- [x] **Category** entity + repository (hierarchical)
- [x] Setup JPA repositories
- [x] Seed data cơ bản (brands, categories)

#### 1.3 Security Foundation

- [x] Setup Spring Security (chỉ cho Admin APIs)
- [x] Implement JWT authentication (chỉ cho Admin/Staff)
- [x] Admin/Staff login
- [x] Password encryption (BCrypt)
- [x] Role-based access control (RBAC) - ADMIN, STAFF
- [x] Public APIs không cần authentication (orders, customers lookup)

**Deliverables**: ✅
- Backend API chạy được
- Database connection thành công
- Admin authentication (JWT)
- Public APIs không cần authentication

---

### **PHASE 2: Dynamic Attributes System** ✅ **HOÀN THÀNH**

#### 2.1 Attributes System Core

- [x] **ProductAttribute** entity + repository
- [x] **AttributeValue** entity + repository
- [x] **ProductAttributeValue** entity + repository
- [x] **CategoryAttribute** entity + repository
- [x] CRUD operations cho attributes
- [x] Attribute management API

#### 2.2 Attributes Configuration

- [x] Setup default attributes (fragrance_group, concentration, gender, etc.)
- [x] Seed attribute values
- [x] Attribute validation rules

#### 2.3 Product-Attribute Integration

- [x] Assign attributes to products
- [x] Variant-specific attributes
- [x] Attribute-based product queries
- [x] Filtering by attributes
- [x] **Integration vào ProductDTO**

**Deliverables**: ✅
- Hệ thống attributes động hoàn chỉnh
- API quản lý attributes
- Product-attribute assignment
- Integration vào ProductDTO response

---

### **PHASE 3: Core Product Management** ✅ **PHẦN LỚN HOÀN THÀNH**

#### 3.1 Product Core ✅ **HOÀN THÀNH**

- [x] **Product** entity + repository
- [x] **ProductVariant** entity + repository
- [x] **ProductImage** entity + repository
- [x] CRUD operations cho Product
- [x] Product image upload
- [x] Product variants management
- [x] **Product Reviews** system
- [x] **Product Price History** tracking

#### 3.2 Product Display & Filtering

- [ ] Get products by category
- [ ] Get products by brand
- [ ] Get products by attributes (dynamic filtering)
- [ ] Advanced filtering API (multi-attribute, price range, etc.)
- [ ] Product search với full-text search
- [ ] Product pagination & sorting

#### 3.3 Product Relationships

- [ ] **RelatedProduct** entity + repository
- [ ] **ProductGift** entity + repository
- [ ] Related products logic
- [ ] Product recommendations

**Deliverables**:
- API quản lý sản phẩm đầy đủ
- Dynamic filtering system
- Upload và quản lý hình ảnh
- Product relationships

---

### **PHASE 4: Inventory Intelligence** ✅ **HOÀN THÀNH**

#### 4.1 Inventory Management

- [x] **InventoryTransaction** entity + repository
- [x] Real-time stock tracking
- [x] Stock quantity updates
- [x] Reserved quantity tracking (cart, pre-order)
- [x] Available quantity calculation
- [x] **Integration vào ProductVariantDTO**

#### 4.2 Pre-Orders & Notifications

- [x] **PreOrder** entity + repository
- [x] **StockAlert** entity + repository
- [x] Pre-order management
- [x] Restock notifications
- [x] Low stock alerts
- [x] Email notifications (Spring Mail) - Ready

**Deliverables**: ✅
- Hệ thống quản lý kho hàng thông minh
- Pre-order system
- Stock alerts & notifications
- Integration vào ProductVariantDTO với stockStatus

---

### **PHASE 5: Pricing Strategy & Bundling** ✅ **PHẦN LỚN HOÀN THÀNH**

#### 5.1 Pricing Management

- [x] **ProductPriceHistory** entity + repository
- [ ] **MemberPricingTier** entity + repository - Chưa triển khai
- [ ] **ProductMemberPrice** entity + repository - Chưa triển khai
- [x] Price history tracking
- [x] Tự động record khi giá thay đổi
- [x] Query theo variant, promotion, change type

#### 5.2 Product Bundling ✅ **HOÀN THÀNH**

- [x] **ProductBundle** entity + repository
- [x] **BundleItem** entity + repository
- [x] Bundle management (CRUD đầy đủ)
- [x] Bundle pricing calculation (tự động)
- [x] Customizable bundles (isCustomizable flag)
- [x] Bundle types (CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET)
- [x] Discount calculation (amount & percentage)

**Deliverables**: ✅ (Phần lớn)
- ✅ Hệ thống pricing history tracking
- ✅ Product bundling system hoàn chỉnh
- ⏳ Promotion management - Chưa triển khai

---

### **PHASE 6: Shopping Cart & Checkout** ⚙️ **IN PROGRESS**

#### 6.1 Shopping Cart

- [x] **Cart** entity + repository
- [x] Add to cart (with variant selection)
- [x] Update cart item quantity
- [x] Remove from cart
- [x] Get cart by session_id
- [x] Cart expiration handling
- [x] Guest cart (session-based)
- [x] Rate limiting Redis (10 lần/60s)

#### 6.2 Order Management

- [x] **Order** entity + repository (với verification_code)
- [x] **OrderItem** entity + repository
- [x] Create order from cart (guest checkout)
- [x] Generate verification_code (6-10 ký tự, unique)
- [x] Email service - Gửi email xác nhận đặt hàng
- [x] Email verification endpoint
- [x] Order status management
- [x] Order tracking (bằng verification_code + email)
- [x] Order cancellation

#### 6.3 Checkout Process

- [x] Guest checkout form (name, email, phone, address)
- [x] Auto create customer record
- [x] Payment method selection
- [x] Order summary calculation
- [x] Apply promotion codes
- [x] Member pricing application (VIP discount)
- [x] Generate and send verification code via email

**Deliverables**:
- ✅ Giỏ hàng hoàn chỉnh
- ✅ Quy trình checkout
- ✅ Quản lý đơn hàng

---

### **PHASE 7: Payment & User Features** ⏳ **PENDING**

#### 7.1 Payment Integration

- [ ] **Payment** entity + repository
- [ ] Payment gateway integration (VNPay, MoMo, PayPal)
- [ ] Payment status tracking
- [ ] Payment webhook handling
- [ ] Refund processing

#### 7.2 User Features

- [ ] **Wishlist** entity + repository
- [ ] User profile management
- [ ] Address book management
- [ ] Order tracking
- [ ] Change password
- [ ] Email verification

#### 7.3 Reviews & Ratings

- [x] **Review** entity + repository (enhanced)
- [x] **ReviewImage** entity + repository
- [x] **ReviewHelpful** entity + repository
- [x] Product reviews CRUD
- [x] Rating system
- [x] Review moderation
- [x] Review statistics
- [x] Helpful votes

**Deliverables**:
- ⏳ Tích hợp thanh toán
- ⏳ Tính năng người dùng đầy đủ
- ✅ Hệ thống đánh giá nâng cao

---

### **PHASE 8: Analytics, SEO & Optimization** ⏳ **PENDING**

#### 8.1 Analytics & Insights

- [ ] **ProductView** entity + repository
- [ ] **ProductConversionTracking** entity + repository
- [ ] **SearchQuery** entity + repository
- [ ] **ProductComparison** entity + repository
- [ ] Product view tracking
- [ ] Conversion tracking (view → cart → purchase)
- [ ] Search analytics
- [ ] Product comparison tracking
- [ ] Daily aggregation jobs (Spring Scheduler)
- [ ] Analytics dashboard API

#### 8.2 SEO Optimization

- [ ] **SEOUrl** entity + repository
- [ ] **UrlSlugsHistory** entity + repository
- [ ] URL redirect management (301/302)
- [ ] Canonical URLs
- [ ] Slug history tracking
- [ ] SEO metadata management

#### 8.3 Performance Optimization

- [ ] Caching strategy (Redis)
- [ ] Database query optimization
- [ ] Image optimization & CDN
- [ ] API response optimization
- [ ] Pagination improvements
- [ ] Lazy loading strategies

**Deliverables**:
- ⏳ Analytics system hoàn chỉnh
- ⏳ SEO optimization
- ⏳ Performance optimization

---

## 📦 Delivery Plan

### 1. Backend (Spring Boot)

#### Mục Tiêu

- Cung cấp API REST cho Admin và Storefront
- Đảm bảo RBAC, JWT auth, OTP guest login, rate limiting
- Hỗ trợ schema Supabase với Flyway và JSONB caching cho search

#### Kiến Trúc & Thành phần chính

- Modules: Auth, Catalog (Products/Variants/Attributes), Orders, Customers/VIP, Inventory, Promotion, Analytics
- Công nghệ: Spring Boot 3.5, JPA/Hibernate, Hypersistence Utils, Redis, PostgreSQL Supabase, Flyway
- Phụ trợ: Image upload (local/S3), Email service (SMTP), Event-driven (CLV update)

#### Roadmap triển khai

| Giai đoạn | Hạng mục                     | Status |
| --------- | ---------------------------- | ------ |
| ✅        | Flyway V1 schema             | ✅     |
| ✅        | Auth & RBAC                  | ✅     |
| ✅        | Product Admin API            | ✅     |
| ✅        | Product Store API            | ✅     |
| ✅        | Cart & Checkout              | ✅     |
| ⚙️        | Admin endpoints bổ sung      | ⚙️     |
| ⚙️        | Order/Customer API cho admin | ⚙️     |
| ⏳        | Analytics API                | ⏳     |

#### Checklist bàn giao backend

- [x] Flyway scripts + hướng dẫn chạy
- [ ] Swagger/OpenAPI hoặc Postman collection
- [x] Scripts seed (default admin/user)
- [ ] Monitoring: Actuator `/actuator/health`, metrics
- [x] Tài liệu `.md` đồng bộ (BACKEND.md)

---

### 2. Admin Dashboard (Next.js)

#### Mục Tiêu

- Giao diện quản trị tập trung (sản phẩm, đơn hàng, khách hàng, promotion)
- Sử dụng token admin (`ROLE_ADMIN`/`ROLE_STAFF`), phân quyền menu theo role
- Trải nghiệm mượt (React Query, form validation rõ ràng)

#### Stack & Thư viện

- Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui
- State/Data: TanStack Query, Zustand, Axios interceptor
- Form: React Hook Form + Zod
- Build & lint: ESLint, Prettier

#### Roadmap chi tiết

| Pha | Nội dung                    | Status |
| --- | --------------------------- | ------ |
| ✅  | **Flow đăng nhập + layout** | ✅     |
| ✅  | **Brand & Category**        | ✅     |
| ⚙️  | **Product Admin**           | ⚙️     |
| ⏳  | **Promotion & Pricing**     | ⏳     |
| ⏳  | **Orders & Customers**      | ⏳     |
| ⏳  | **Inventory**               | ⏳     |
| ⏳  | **Analytics**               | ⏳     |
| ⏳  | **System settings**         | ⏳     |

#### Tiến độ đã hoàn thành (11/2025)

- ✅ **Enterprise folder structure** cho `orchard-store-dashboad`
- ✅ **Auth foundation**: Zustand store, custom hooks, axios client với interceptor
- ✅ **Login Experience**: Shadcn/Tailwind UI, RHF + Zod, toast feedback
- ✅ **Dashboard shell**: Sidebar/Header responsive, collapse + mobile drawer
- ✅ **Admin UI placeholders**: shared Logo/Spinner, admin StatsCard/Chart
- ✅ **User Management**: Full CRUD với search, filter, pagination, inline error handling
- ✅ **Brand & Category Management**: Full CRUD với search, pagination, image upload
- ✅ **Centralized Error Handling**: Axios interceptor với Vietnamese error messages
- ✅ **WebSocket Notifications**: Real-time notifications với STOMP

---

### 3. Orchard Storefront (Next.js)

#### Mục Tiêu

- Giao diện khách hàng với focus search performance, filter mạnh, checkout OTP
- Kết nối trực tiếp API `/api/store/**`
- SEO, Lighthouse cao, responsive mobile

#### Kiến trúc trang

- Pages chính: Home, Brand listing, Category listing, Product detail (variant slug), Search results
- Cart/Checkout: giỏ hàng session + merge khi login, OTP login, payment options placeholder
- Profile khách hàng: `/store/profile/me`, `/store/profile/orders`

#### Lộ trình triển khai

| Bước | Nội dung           | Status |
| ---- | ------------------ | ------ |
| ⏳   | Foundation         | ⏳     |
| ⏳   | Home + listing     | ⏳     |
| ⏳   | Filter/Search      | ⏳     |
| ⏳   | Product detail     | ⏳     |
| ⏳   | Cart & Checkout    | ⏳     |
| ⏳   | Customer dashboard | ⏳     |
| ⏳   | Extras             | ⏳     |

---

## 🎯 Implementation Priority

### High Priority (MVP)

1. ✅ Core Entities (User, Brand, Category, Product)
2. ✅ Dynamic Attributes System
3. ✅ Product Management & Filtering
4. ✅ Shopping Cart & Checkout
5. ✅ Order Management

### Medium Priority

6. ✅ Inventory Intelligence
7. ✅ Pricing Strategy
8. ✅ Reviews & Ratings
9. ⏳ User Features

### Low Priority (Nice to Have)

10. ⏳ Analytics & Insights
11. ⏳ SEO Optimization
12. ✅ Product Bundling
13. ⏳ Performance Optimization

---

## 📊 Phối hợp liên hệ giữa 3 khối

### API Contract

- Mỗi endpoint dùng bởi Admin/Storefront phải có schema rõ, ghi chú trong BACKEND.md
- Khi backend đổi DTO, admin & storefront cần upgrade đồng bộ → maintain changelog

### Testing chéo

- Backend: viết integration tests cho endpoints dùng chung
- Admin & Storefront: dùng môi trường staging chung (Supabase schema copy) để UAT

### Deployment pipeline

1. Backend build (mvn package) + Flyway migration
2. Admin build (npm run build) → deploy
3. Storefront build
4. Smoke tests (đăng nhập admin, create product, hiển thị ở storefront)

---

## 📝 Ghi Chú Quan Trọng

1. **Security**: Luôn validate input, sử dụng prepared statements, bảo vệ API endpoints
2. **Performance**: Sử dụng pagination, caching, lazy loading khi cần
3. **Scalability**: Thiết kế để có thể scale horizontal
4. **Testing**: Viết tests cho các business logic quan trọng
5. **Documentation**: Giữ API documentation cập nhật
6. **Error Handling**: Xử lý lỗi một cách nhất quán và thân thiện
7. **Attributes System**: Sử dụng dynamic attributes thay vì hardcode fragrance_info
8. **Analytics**: Track mọi interaction để có insights tốt hơn

---

## 🎯 Kết Luận

Lộ trình này cung cấp một kế hoạch phát triển toàn diện để đạt 95% tính năng so với Orchard.vn. Bắt đầu với Phase 1 và phát triển từng bước một cách có hệ thống.

**Thời gian ước tính**: 18 tuần (4.5 tháng) cho một team nhỏ (2-3 developers)

**Ưu tiên**: Bắt đầu với Phase 1, 2, 3 để có MVP (Minimum Viable Product) sớm nhất.

---

**Last Updated**: 2025-11-22  
**Status**: 🟢 In Development (Phase 1-6 Complete)

