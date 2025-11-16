# Lộ Trình Phát Triển Enhanced - Orchard Store E-Commerce Platform

## 🎯 Mục Tiêu: Đạt 95% Tính Năng So Với Orchard.vn

---

## 📋 Tổng Quan Dự Án

Xây dựng nền tảng thương mại điện tử bán nước hoa và mỹ phẩm chính hãng, tương tự [orchard.vn](https://orchard.vn/), sử dụng Java Spring Boot làm backend chính.

### Business Context Analysis

**Orchard.vn Feature Mapping:**

- 🎯 **Product Discovery**: Advanced filtering by fragrance, concentration, gender, price range
- 📦 **Inventory Intelligence**: Real-time stock tracking, pre-orders, restock notifications  
- 🎁 **Product Bundling**: Curated sets, gift packages, combo deals
- 📈 **Analytics & Insights**: Product views, conversion tracking, popular products
- 💰 **Pricing Strategy**: Price history, discount tracking, member pricing
- 🔍 **SEO Optimization**: URL structure, redirects, canonical URLs
- ⚡ **Performance**: Fast filtering, search, product comparisons

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Java Version**: 21
- **Build Tool**: Maven
- **Database**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Validation**: Jakarta Bean Validation
- **File Upload**: Spring Multipart + Cloud Storage (AWS S3 / Cloudinary)
- **Email**: Spring Mail
- **Caching**: Redis (optional)
- **Search**: Elasticsearch (optional, cho tìm kiếm nâng cao)
- **Scheduling**: Spring Scheduler (cho analytics aggregation)

### Frontend (Khuyến Nghị: Next.js 14+)
- **Framework**: **Next.js 14+** (React-based) ⭐ **RECOMMENDED**
  - ✅ **SSR/SSG**: SEO tối ưu cho e-commerce (quan trọng cho Google ranking)
  - ✅ **Performance**: Tốc độ tải nhanh, Core Web Vitals tốt
  - ✅ **Image Optimization**: Built-in Image component tự động optimize
  - ✅ **API Routes**: Có thể tạo API routes nếu cần
  - ✅ **Ecosystem**: Thư viện phong phú, cộng đồng lớn
  - ✅ **Tương thích**: Hoạt động tốt với Spring Boot REST API
  - ✅ **Production Ready**: Được sử dụng bởi Vercel, Netflix, TikTok, Nike, v.v.

- **UI Library**: 
  - **Tailwind CSS** ⭐ (Recommended - Utility-first, nhanh, linh hoạt)
  - **shadcn/ui** (Built on Tailwind, components đẹp, customizable)
  - Hoặc **Ant Design** (Nhiều components sẵn có, phù hợp admin panel)

- **State Management**: 
  - **Zustand** ⭐ (Recommended - Nhẹ, đơn giản, đủ mạnh)
  - Hoặc **Redux Toolkit** (Nếu cần state management phức tạp)
  - **React Query / TanStack Query** (Cho server state, caching API calls)

- **HTTP Client**: 
  - **Axios** hoặc **Fetch API** (Next.js built-in)
  - **React Query** (Tự động caching, refetching, error handling)

- **Form Handling**: 
  - **React Hook Form** ⭐ (Recommended - Performance cao, validation tốt)
  - **Zod** (Schema validation, type-safe)

- **Type Safety**: 
  - **TypeScript** ⭐ (Bắt buộc - Type safety, better DX)

#### Lý Do Chọn Next.js Cho E-Commerce:

1. **SEO Tối Ưu** 🔍
   - SSR (Server-Side Rendering) cho dynamic content
   - SSG (Static Site Generation) cho product pages
   - Automatic meta tags, Open Graph, structured data
   - → Google ranking tốt hơn, traffic cao hơn

2. **Performance** ⚡
   - Code splitting tự động
   - Image optimization built-in
   - Font optimization
   - → Core Web Vitals tốt, conversion rate cao hơn

3. **Developer Experience** 👨‍💻
   - File-based routing (dễ hiểu)
   - Hot reload nhanh
   - TypeScript support tốt
   - → Phát triển nhanh, ít bug

4. **Ecosystem** 📦
   - Nhiều thư viện hỗ trợ
   - Cộng đồng lớn
   - Documentation tốt
   - → Dễ tìm giải pháp, dễ học

5. **Production Ready** 🚀
   - Deploy dễ dàng (Vercel, AWS, etc.)
   - Monitoring tools
   - Analytics integration
   - → Sẵn sàng cho production

#### Alternative Options (Nếu Không Chọn Next.js):

- **Nuxt.js 3** (Vue-based): Tương tự Next.js nhưng dùng Vue, dễ học hơn
- **Remix** (React-based): Modern, focus vào web standards
- **SvelteKit**: Performance cao nhất, bundle size nhỏ nhất

### Infrastructure
- **Containerization**: Docker
- **CI/CD**: GitHub Actions / Jenkins
- **Cloud**: AWS / Azure / Google Cloud (optional)
- **CDN**: CloudFlare (cho static assets)

---

## 📊 Kiến Trúc Hệ Thống Enhanced

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (React/Vue/Next.js) - Product Discovery, Filtering     │
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
│  │  - Custom Queries (Filtering, Analytics)         │   │
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

## 🚀 Lộ Trình Phát Triển Enhanced (8 Phases)

### **PHASE 1: Foundation & Core Setup** (Tuần 1-2)

#### 1.1 Project Setup & Infrastructure
- [x] Cấu hình Spring Boot với dependencies
- [x] Setup database (Supabase PostgreSQL)
- [x] Cấu hình application.properties
- [x] Setup project structure
- [ ] Cấu hình CORS cho frontend
- [ ] Setup logging (Logback)
- [ ] Setup exception handling global
- [ ] Setup API documentation (Swagger/OpenAPI)

#### 1.2 Core Entities (Foundation)
- [ ] **User** entity + repository
- [ ] **Brand** entity + repository
- [ ] **Category** entity + repository (hierarchical)
- [ ] Setup JPA repositories
- [ ] Database migration scripts (Flyway/Liquibase)
- [ ] Seed data cơ bản (brands, categories)

#### 1.3 Security Foundation (Simplified - Chỉ cho Admin/Staff)
- [ ] Setup Spring Security (chỉ cho Admin APIs)
- [ ] Implement JWT authentication (chỉ cho Admin/Staff)
- [ ] Admin/Staff login
- [ ] Password encryption (BCrypt)
- [ ] Role-based access control (RBAC) - ADMIN, STAFF
- [ ] Public APIs không cần authentication (orders, customers lookup)

**Lưu ý:** 
- Khách hàng KHÔNG cần đăng ký/đăng nhập
- Xác thực đơn hàng qua email với mã xác thực
- Tra cứu đơn hàng bằng verification_code + email

**Deliverables**: 
- Backend API chạy được
- Database connection thành công
- Admin authentication (JWT)
- Public APIs không cần authentication

---

### **PHASE 2: Dynamic Attributes System** (Tuần 3-4)

#### 2.1 Attributes System Core
- [ ] **ProductAttribute** entity + repository
- [ ] **AttributeValue** entity + repository
- [ ] **ProductAttributeValue** entity + repository
- [ ] **CategoryAttribute** entity + repository
- [ ] CRUD operations cho attributes
- [ ] Attribute management API

#### 2.2 Attributes Configuration
- [ ] Setup default attributes (fragrance_group, concentration, gender, etc.)
- [ ] Seed attribute values
- [ ] Attribute validation rules
- [ ] Multi-language support (Vietnamese/English)

#### 2.3 Product-Attribute Integration
- [ ] Assign attributes to products
- [ ] Variant-specific attributes
- [ ] Attribute-based product queries
- [ ] Filtering by attributes

**Deliverables**:
- Hệ thống attributes động hoàn chỉnh
- API quản lý attributes
- Product-attribute assignment

---

### **PHASE 3: Core Product Management** (Tuần 5-7)

#### 3.1 Product Core
- [ ] **Product** entity + repository
- [ ] **ProductVariant** entity + repository
- [ ] **ProductImage** entity + repository
- [ ] CRUD operations cho Product
- [ ] Product image upload (local/cloud storage)
- [ ] Product variants management

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

### **PHASE 4: Inventory Intelligence** (Tuần 8-9)

#### 4.1 Inventory Management
- [ ] **InventoryTransaction** entity + repository
- [ ] Real-time stock tracking
- [ ] Stock quantity updates
- [ ] Reserved quantity tracking (cart, pre-order)
- [ ] Available quantity calculation

#### 4.2 Pre-Orders & Notifications
- [ ] **PreOrder** entity + repository
- [ ] **StockAlert** entity + repository
- [ ] Pre-order management
- [ ] Restock notifications
- [ ] Low stock alerts
- [ ] Email notifications (Spring Mail)

#### 4.3 Inventory Analytics
- [ ] Stock movement reports
- [ ] Inventory valuation
- [ ] Stock turnover analysis

**Deliverables**:
- Hệ thống quản lý kho hàng thông minh
- Pre-order system
- Stock alerts & notifications

---

### **PHASE 5: Pricing Strategy & Bundling** (Tuần 10-11)

#### 5.1 Pricing Management
- [ ] **ProductPriceHistory** entity + repository
- [ ] **MemberPricingTier** entity + repository
- [ ] **ProductMemberPrice** entity + repository
- [ ] Price history tracking
- [ ] Member pricing tiers
- [ ] Price change notifications

#### 5.2 Product Bundling
- [ ] **ProductBundle** entity + repository
- [ ] **BundleItem** entity + repository
- [ ] Bundle management
- [ ] Bundle pricing calculation
- [ ] Customizable bundles

#### 5.3 Promotion Integration
- [ ] **Promotion** entity + repository (enhanced)
- [ ] **PromotionUsage** entity + repository
- [ ] Promotion application logic
- [ ] Promotion validation

**Deliverables**:
- Hệ thống pricing strategy hoàn chỉnh
- Product bundling system
- Promotion management

---

### **PHASE 6: Shopping Cart & Checkout** (Tuần 12-13)

#### 6.1 Shopping Cart (Session-based, không cần đăng nhập)
- [ ] **Cart** entity + repository
- [ ] Add to cart (with variant selection)
- [ ] Update cart item quantity
- [ ] Remove from cart
- [ ] Get cart by session_id
- [ ] Cart expiration handling
- [ ] Guest cart (session-based)

#### 6.2 Order Management (Email Verification)
- [ ] **Order** entity + repository (với verification_code)
- [ ] **OrderItem** entity + repository
- [ ] Create order from cart (guest checkout)
- [ ] Generate verification_code (6-10 ký tự, unique)
- [ ] Email service - Gửi email xác nhận đặt hàng
- [ ] Email verification endpoint
- [ ] Order status management
- [ ] Order tracking (bằng verification_code + email)
- [ ] Order cancellation

#### 6.3 Checkout Process (Simplified)
- [ ] Guest checkout form (name, email, phone, address)
- [ ] Auto create customer record
- [ ] Payment method selection
- [ ] Order summary calculation
- [ ] Apply promotion codes
- [ ] Member pricing application (VIP discount)
- [ ] Generate and send verification code via email

**Deliverables**:
- Giỏ hàng hoàn chỉnh
- Quy trình checkout
- Quản lý đơn hàng

---

### **PHASE 7: Payment & User Features** (Tuần 14-15)

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
- [ ] **Review** entity + repository (enhanced)
- [ ] **ReviewImage** entity + repository
- [ ] **ReviewHelpful** entity + repository
- [ ] Product reviews CRUD
- [ ] Rating system
- [ ] Review moderation
- [ ] Review statistics
- [ ] Helpful votes

**Deliverables**:
- Tích hợp thanh toán
- Tính năng người dùng đầy đủ
- Hệ thống đánh giá nâng cao

---

### **PHASE 8: Analytics, SEO & Optimization** (Tuần 16-18)

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

#### 8.4 Admin Panel
- [ ] Admin dashboard API
- [ ] Product management interface
- [ ] Order management interface
- [ ] User management
- [ ] Analytics dashboard
- [ ] Reports & exports (Excel, PDF)

**Deliverables**:
- Analytics system hoàn chỉnh
- SEO optimization
- Performance optimization
- Admin panel APIs

---

## 📁 Cấu Trúc Thư Mục Đề Xuất (Enhanced)

```
orchard-store-backend/
├── src/
│   ├── main/
│   │   ├── java/com/orchard/orchard_store_backend/
│   │   │   ├── config/              # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   └── SwaggerConfig.java
│   │   │   ├── controller/          # REST Controllers
│   │   │   │   ├── auth/
│   │   │   │   ├── product/
│   │   │   │   ├── attribute/
│   │   │   │   ├── inventory/
│   │   │   │   ├── analytics/
│   │   │   │   └── admin/
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── request/
│   │   │   │   ├── response/
│   │   │   │   └── mapper/
│   │   │   ├── entity/              # JPA Entities
│   │   │   │   ├── core/
│   │   │   │   ├── attribute/
│   │   │   │   ├── inventory/
│   │   │   │   ├── analytics/
│   │   │   │   └── pricing/
│   │   │   ├── exception/           # Exception handlers
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── CustomExceptions.java
│   │   │   ├── repository/          # JPA Repositories
│   │   │   │   ├── core/
│   │   │   │   ├── attribute/
│   │   │   │   └── custom/
│   │   │   ├── security/            # Security config & JWT
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── UserPrincipal.java
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── AttributeService.java
│   │   │   │   ├── InventoryService.java
│   │   │   │   ├── AnalyticsService.java
│   │   │   │   └── PricingService.java
│   │   │   ├── util/                # Utilities
│   │   │   │   ├── SlugGenerator.java
│   │   │   │   └── ImageUploader.java
│   │   │   └── OrchardStoreBackendApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── db/migration/        # Flyway migrations
│   └── test/
└── pom.xml
```

---

## 🔌 API Endpoints Chính (Enhanced)

### Authentication (Chỉ cho Admin/Staff)
- `POST /api/admin/auth/login` - Admin/Staff đăng nhập
- `POST /api/admin/auth/refresh` - Refresh token
- `POST /api/admin/auth/logout` - Đăng xuất

**Lưu ý:** Khách hàng KHÔNG cần đăng ký/đăng nhập

### Attributes (Dynamic Filtering)
- `GET /api/attributes` - Lấy tất cả attributes
- `GET /api/attributes/{id}` - Chi tiết attribute
- `GET /api/attributes/filterable` - Attributes có thể filter
- `GET /api/attributes/{id}/values` - Giá trị của attribute
- `POST /api/admin/attributes` - Tạo attribute (Admin)
- `PUT /api/admin/attributes/{id}` - Cập nhật attribute (Admin)

### Products (Enhanced)
- `GET /api/products` - Danh sách sản phẩm (với pagination, filter, sort)
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/filter` - Advanced filtering
  - Query params: `brands`, `categories`, `attributes`, `priceRange`, `rating`, etc.
- `GET /api/products/search?q={query}` - Tìm kiếm
- `GET /api/products/{id}/variants` - Biến thể của sản phẩm
- `GET /api/products/{id}/related` - Sản phẩm liên quan
- `GET /api/products/{id}/comparison` - So sánh sản phẩm

### Inventory
- `GET /api/inventory/variants/{id}/stock` - Kiểm tra tồn kho
- `POST /api/inventory/pre-orders` - Đặt hàng trước
- `GET /api/inventory/pre-orders` - Danh sách pre-orders
- `GET /api/admin/inventory/transactions` - Lịch sử nhập/xuất (Admin)
- `GET /api/admin/inventory/alerts` - Cảnh báo tồn kho (Admin)

### Pricing
- `GET /api/products/{id}/price-history` - Lịch sử giá
- `GET /api/pricing/member-tiers` - Bậc giá thành viên
- `GET /api/products/{id}/member-prices` - Giá thành viên

### Bundles
- `GET /api/bundles` - Danh sách gói sản phẩm
- `GET /api/bundles/{id}` - Chi tiết gói
- `GET /api/bundles/{id}/items` - Sản phẩm trong gói

### Cart (Session-based, không cần đăng nhập)
- `GET /api/cart?session_id={session_id}` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ hàng (session-based)
- `PUT /api/cart/items/{id}` - Cập nhật số lượng
- `DELETE /api/cart/items/{id}` - Xóa khỏi giỏ hàng
- `POST /api/cart/clear` - Xóa toàn bộ giỏ hàng

### Orders (Email Verification - Không Cần Đăng Nhập)
- `POST /api/orders` - Tạo đơn hàng (guest checkout)
  - Tự động tạo customer record
  - Tạo verification_code
  - Gửi email xác nhận
- `POST /api/orders/verify` - Xác nhận đơn hàng qua email
  - Request: `{ "verification_code": "ABC123", "email": "customer@email.com" }`
- `GET /api/orders/track?code={verification_code}&email={email}` - Tra cứu đơn hàng
- `GET /api/orders?email={email}&phone={phone}` - Lịch sử đơn hàng (by email/phone)
- `GET /api/orders/{id}/track` - Theo dõi đơn hàng

### Reviews
- `GET /api/products/{id}/reviews` - Đánh giá sản phẩm
- `POST /api/products/{id}/reviews` - Thêm đánh giá
- `PUT /api/reviews/{id}` - Cập nhật đánh giá
- `DELETE /api/reviews/{id}` - Xóa đánh giá
- `POST /api/reviews/{id}/helpful` - Đánh dấu hữu ích

### Analytics (Admin)
- `GET /api/admin/analytics/products/{id}/views` - Lượt xem sản phẩm
- `GET /api/admin/analytics/products/{id}/conversion` - Conversion tracking
- `GET /api/admin/analytics/search/queries` - Search analytics
- `GET /api/admin/analytics/dashboard` - Dashboard statistics

### SEO
- `GET /api/seo/redirects` - URL redirects (Admin)
- `POST /api/admin/seo/redirects` - Tạo redirect (Admin)

---

## 📦 Dependencies Cần Thêm (Enhanced)

```xml
<!-- Database Migration -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Documentation -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>

<!-- File Upload -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.15.1</version>
</dependency>

<!-- Email -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Scheduling -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-quartz</artifactId>
</dependency>

<!-- Redis (Optional) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- JSON Processing -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

---

## 🎯 Implementation Priority

### High Priority (MVP)
1. ✅ Core Entities (User, Brand, Category, Product)
2. ✅ Dynamic Attributes System
3. ✅ Product Management & Filtering
4. ✅ Shopping Cart & Checkout
5. ✅ Order Management

### Medium Priority
6. Inventory Intelligence
7. Pricing Strategy
8. Reviews & Ratings
9. User Features

### Low Priority (Nice to Have)
10. Analytics & Insights
11. SEO Optimization
12. Product Bundling
13. Performance Optimization

---

## ✅ Checklist Trước Khi Bắt Đầu

- [x] Xác định database (Supabase PostgreSQL)
- [x] Setup development environment
- [x] Test database connection
- [ ] Tạo repository Git
- [ ] Quyết định frontend framework
- [ ] Thiết kế UI/UX mockups
- [ ] Lập kế hoạch deployment

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

