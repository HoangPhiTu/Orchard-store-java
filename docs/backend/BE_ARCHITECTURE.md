# 🏗️ Backend Architecture - Orchard Store

> **Modular Monolith với Spring Boot 3.5 + PostgreSQL 16**

> Tài liệu kiến trúc hệ thống cho developers mới tham gia dự án

---

## 📚 Mục lục

1. [Tổng quan công nghệ](#-tổng-quan-công-nghệ-tech-stack)

2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống-system-architecture)

3. [Cấu trúc dự án](#-cấu-trúc-dự-an-project-structure)

4. [Các quyết định kỹ thuật quan trọng](#-các-quyết-định-kỹ-thuật-quan-trọng-key-engineering-decisions)

5. [Quy trình bảo mật](#-quy-trình-bảo-mật-security-flow)

6. [Quản lý File & Media](#-quản-lý-file--media-file--media-management)

7. [Best Practices](#-best-practices)

---

## 🛠️ Tổng quan công nghệ (Tech Stack)

### Core Technologies

| Technology | Version | Purpose | Notes |

| --------------- | ------- | ---------------------------------- | ------------------------ |

| **Java** | 21 LTS | Programming language | Long-term support |

| **Spring Boot** | 3.5.7 | Application framework | Latest stable |

| **Hibernate** | 6.6 | ORM (via Spring Data JPA) | JPA implementation |

| **PostgreSQL** | 16+ | Relational database (Supabase) | JSONB support |

| **Maven** | 3.9+ | Build tool & dependency management | Standard Java build tool |

### Spring Ecosystem

| Module | Purpose | Usage |

| -------------------------------- | ------------------------------ | ---------------------------------- |

| `spring-boot-starter-web` | RESTful API | Controllers, HTTP handling |

| `spring-boot-starter-data-jpa` | Database access | Repositories, Transactions |

| `spring-boot-starter-security` | Authentication & Authorization | JWT, RBAC, Method security |

| `spring-boot-starter-validation` | Bean validation (JSR-380) | DTO validation |

| `spring-boot-starter-mail` | Email (OTP, notifications) | JavaMailSender |

| `spring-boot-starter-data-redis` | Caching & OTP storage | Redis for temporary data |

| `spring-boot-starter-aop` | Aspect-Oriented Programming | Logging, rate limiting |

| `spring-boot-starter-actuator` | Health checks & monitoring | `/actuator/health` |

### Security & Authentication

| Library | Version | Purpose |

| -------------------- | ------- | -------------------------- |

| **JJWT** | 0.12.3 | JWT token generation |

| **BCrypt** | Auto | Password hashing (strength 10) |

| **Spring Security** | 6.x | Authentication framework |

### Data Mapping & Utilities

| Library | Version | Purpose |

| ------------------- | ------- | ------------------------------------------ |

| **MapStruct** | 1.5.5 | Entity ↔ DTO mapping (compile-time) |

| **Lombok** | Auto | Reduce boilerplate code |

| **Slugify** | 3.0.2 | URL-friendly slug generation |

| **Hypersistence** | 3.7.2 | JSONB support for Hibernate 6.3 |

### Storage & Infrastructure

| Technology | Purpose | Environment |

| ------------- | -------------------------- | ----------- |

| **AWS SDK S3** | Object storage (MinIO/R2) | Dev: MinIO, Prod: S3/R2 |

| **Redis** | OTP storage, caching | Optional |

| **Flyway** | Database migration | Version control |

---

## 🎯 Kiến trúc hệ thống (System Architecture)

### Modular Monolith Pattern

**Triết lý:** Bắt đầu đơn giản (Monolith), tổ chức tốt (Modular), phát triển sau (Microservices nếu cần).

```

┌─────────────────────────────────────────────────────────────┐

│              Orchard Store Backend                          │

│              (Single Deployment - JAR/WAR)                  │

├─────────────────────────────────────────────────────────────┤

│                                                              │

│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │

│  │    Auth     │  │   Catalog    │  │    Order    │       │

│  │   Module    │  │   Module     │  │   Module    │  ...  │

│  │             │  │              │  │             │       │

│  │ - Users     │  │ - Products   │  │ - Orders    │       │

│  │ - Roles     │  │ - Brands     │  │ - Cart      │       │

│  │ - Login     │  │ - Categories │  │ - Payment   │       │

│  │ - RBAC      │  │ - Attributes │  │             │       │

│  └─────────────┘  └─────────────┘  └─────────────┘       │

│                                                              │

│  ┌──────────────────────────────────────────────────────┐  │

│  │         Shared Infrastructure                         │  │

│  │  - Security (JWT, Filters)                           │  │

│  │  - Exception Handling (GlobalExceptionHandler)       │  │

│  │  - Configuration (Security, CORS, S3, Redis)         │  │

│  │  - Utilities (UserAgentParser, etc.)                 │  │

│  └──────────────────────────────────────────────────────┘  │

│                                                              │

│  ┌──────────────────────────────────────────────────────┐  │

│  │         Data Access Layer                             │  │

│  │  - JPA/Hibernate (ORM)                                │  │

│  │  - Repository Pattern                                 │  │

│  │  - Entity Graph (Eager Loading)                       │  │

│  └──────────────────────────────────────────────────────┘  │

│                                                              │

└──────────────────────────────┬───────────────────────────────┘

                               │

                    ┌──────────▼──────────┐

                    │    PostgreSQL 16    │

                    │     (Supabase)      │

                    │  - JSONB Support     │

                    │  - GIN Indexes      │

                    │  - Flyway Migrations │

                    └─────────────────────┘

```

**Lợi ích:**

- ✅ **Deployment đơn giản** - Single JAR file, dễ deploy

- ✅ **Phát triển dễ dàng** - Không phức tạp như microservices

- ✅ **Hiệu năng tốt** - Không có network calls giữa modules

- ✅ **Ranh giới rõ ràng** - Modules được tách biệt logic

- ✅ **Dễ migrate** - Có thể tách thành microservices sau nếu cần

**Khi nào nên tách thành Microservices?**

- Khi có > 50 developers

- Khi cần scale từng module độc lập

- Khi có yêu cầu về công nghệ khác nhau (VD: một module cần Python)

---

## 📁 Cấu trúc dự án (Project Structure)

### Cây thư mục tổng quan

```

orchard-store-backend/

├── src/main/java/com/orchard/orchard_store_backend/

│   │

│   ├── config/                          # ⚙️ Application Configuration

│   │   ├── SecurityConfig.java         # Spring Security setup

│   │   ├── WebMvcConfig.java            # CORS, Interceptors

│   │   ├── S3Config.java                # MinIO/S3 client

│   │   ├── RedisConfig.java             # Redis connection

│   │   ├── WebSocketConfig.java         # Real-time notifications

│   │   └── DataInitializer.java         # Default data seeding

│   │

│   ├── modules/                         # 📦 Business Modules (Modular Monolith)

│   │   │

│   │   ├── auth/                        # 🔐 Authentication & User Management

│   │   │   ├── controller/

│   │   │   │   ├── AuthController.java           # Login, logout, refresh

│   │   │   │   ├── UserAdminController.java       # CRUD users

│   │   │   │   └── RoleController.java            # Role management

│   │   │   ├── service/

│   │   │   │   ├── AuthService.java              # Authentication logic

│   │   │   │   ├── UserAdminService.java         # User CRUD

│   │   │   │   ├── AdminOtpService.java          # Email change OTP

│   │   │   │   ├── EmailService.java             # Email sending

│   │   │   │   └── LoginHistoryService.java      # Login tracking

│   │   │   ├── repository/

│   │   │   │   ├── UserRepository.java

│   │   │   │   ├── RoleRepository.java

│   │   │   │   └── LoginHistoryRepository.java

│   │   │   ├── entity/

│   │   │   │   ├── User.java                     # User entity

│   │   │   │   ├── Role.java                     # Role với permissions JSONB

│   │   │   │   ├── UserRole.java                 # Many-to-many

│   │   │   │   └── LoginHistory.java             # Login telemetry

│   │   │   ├── dto/

│   │   │   │   ├── UserCreateRequestDTO.java

│   │   │   │   ├── UserResponseDTO.java

│   │   │   │   └── LoginHistoryResponseDTO.java

│   │   │   └── mapper/

│   │   │       └── UserAdminMapper.java          # MapStruct

│   │   │

│   │   ├── catalog/                     # 📦 Catalog Management

│   │   │   ├── brand/                   # Brand Management

│   │   │   │   ├── controller/BrandAdminController.java

│   │   │   │   ├── service/BrandAdminService.java

│   │   │   │   ├── repository/BrandRepository.java

│   │   │   │   ├── entity/Brand.java

│   │   │   │   └── mapper/BrandAdminMapper.java

│   │   │   ├── product/                 # Product Management

│   │   │   │   ├── controller/

│   │   │   │   ├── service/

│   │   │   │   │   ├── ProductAdminService.java    # CRUD + slug generation

│   │   │   │   │   └── ImageUploadService.java     # Interface

│   │   │   │   ├── repository/

│   │   │   │   ├── entity/

│   │   │   │   │   ├── Product.java

│   │   │   │   │   └── ProductVariant.java         # cached_attributes JSONB

│   │   │   │   └── mapper/

│   │   │   ├── attribute/               # EAV System

│   │   │   │   ├── entity/

│   │   │   │   │   ├── ProductAttribute.java

│   │   │   │   │   ├── AttributeValue.java

│   │   │   │   │   └── ProductAttributeValue.java

│   │   │   │   └── service/

│   │   │   └── category/                # Category Management

│   │   │

│   │   ├── customer/                    # 👥 Customer Management

│   │   ├── order/                       # 🛒 Order Management

│   │   └── inventory/                   # 📊 Inventory Management

│   │

│   ├── security/                        # 🔒 Security Components

│   │   ├── JwtAuthenticationFilter.java # JWT validation filter

│   │   ├── JwtTokenProvider.java        # Token generation/validation

│   │   └── CustomUserDetailsService.java # User loading for Spring Security

│   │

│   ├── exception/                       # ⚠️ Exception Handling

│   │   ├── GlobalExceptionHandler.java  # Centralized error handling

│   │   ├── ResourceNotFoundException.java

│   │   ├── ResourceAlreadyExistsException.java

│   │   └── OperationNotPermittedException.java

│   │

│   ├── dto/                             # 📋 Shared DTOs

│   │   └── ApiResponse.java             # Standard API response wrapper

│   │

│   ├── util/                            # 🛠️ Utilities

│   │   └── UserAgentParser.java         # Parse browser/OS/device

│   │

│   └── OrchardStoreBackendApplication.java

│

├── src/main/resources/

│   ├── application.yml                  # Main configuration

│   ├── application-dev.yml              # Dev profile

│   ├── application-prod.yml              # Prod profile

│   └── db/migration/                    # Flyway migrations

│       ├── V1__init_schema.sql          # Initial schema

│       ├── V2__add_avatar_url_to_users.sql

│       └── ...

│

└── pom.xml                              # Maven dependencies

```

### Nguyên tắc tổ chức Module

**Mỗi module là self-contained:**

```

modules/{module-name}/

├── controller/     # REST endpoints

├── service/         # Business logic (Interface + Implementation)

├── repository/       # Data access (JPA Repository)

├── entity/          # JPA entities

├── dto/             # Data Transfer Objects

└── mapper/          # MapStruct mappers

```

**Lợi ích:**

- ✅ **Tách biệt rõ ràng** - Mỗi module độc lập

- ✅ **Dễ hiểu** - Tất cả code liên quan ở cùng một nơi

- ✅ **Dễ bảo trì** - Thay đổi một module không ảnh hưởng module khác

- ✅ **Dễ extract** - Có thể tách thành service riêng sau

---

## 🔑 Các quyết định kỹ thuật quan trọng (Key Engineering Decisions)

### 1. Database - Hybrid EAV Pattern

**Vấn đề:** Sản phẩm có attributes động (màu sắc, kích thước, xuất xứ...) mà không thể hard-code vào schema.

**Giải pháp:** Hybrid EAV (Entity-Attribute-Value) + JSONB Cache

#### Cấu trúc

```

┌─────────────────────────────────────────────────────────┐

│              Hybrid EAV Architecture                     │

├─────────────────────────────────────────────────────────┤

│                                                          │

│  EAV Tables (Normalized - Source of Truth):             │

│  ┌──────────────────┐                                    │

│  │ product_attributes │ (color, size, origin...)        │

│  └────────┬─────────┘                                   │

│           │                                              │

│  ┌────────▼─────────┐                                    │

│  │ attribute_values │ (red, blue, 100ml...)             │

│  └────────┬─────────┘                                   │

│           │                                              │

│  ┌────────▼──────────────────┐                           │

│  │ product_attribute_values │ (Links variant ↔ values) │

│  └──────────────────────────┘                           │

│                                                          │

│  +                                                       │

│                                                          │

│  JSONB Cache (Denormalized - Performance Layer):        │

│  ┌──────────────────────────────────────┐              │

│  │ product_variants.cached_attributes   │              │

│  │ {                                    │              │

│  │   "color": "red",                    │              │

│  │   "origin": "USA",                    │              │

│  │   "organic": true                    │              │

│  │ }                                    │              │

│  └──────────────────────────────────────┘              │

│                                                          │

└─────────────────────────────────────────────────────────┘

```

#### Implementation

**1. EAV Tables (Source of Truth):**

```sql

-- Define attributes

CREATE TABLE product_attributes (

    id BIGSERIAL PRIMARY KEY,

    attribute_key VARCHAR(100) UNIQUE,  -- "color", "size", "origin"

    attribute_name VARCHAR(255),

    attribute_type VARCHAR(50),         -- "TEXT", "NUMBER", "BOOLEAN"

    is_filterable BOOLEAN DEFAULT TRUE

);



-- Define values

CREATE TABLE attribute_values (

    id BIGSERIAL PRIMARY KEY,

    attribute_id BIGINT REFERENCES product_attributes(id),

    value VARCHAR(255),                  -- "red", "blue"

    display_value VARCHAR(255),          -- "Đỏ", "Xanh"

    color_code VARCHAR(7)                -- "#FF0000" (for color attributes)

);



-- Link variant to values

CREATE TABLE product_attribute_values (

    id BIGSERIAL PRIMARY KEY,

    product_variant_id BIGINT REFERENCES product_variants(id),

    attribute_id BIGINT REFERENCES product_attributes(id),

    attribute_value_id BIGINT REFERENCES attribute_values(id),

    custom_value TEXT,                   -- For free-text attributes

    numeric_value DECIMAL(10,2)          -- For numeric attributes

);

```

**2. JSONB Cache (Performance Layer):**

```sql

-- In product_variants table

ALTER TABLE product_variants

ADD COLUMN cached_attributes JSONB DEFAULT '{}'::jsonb;



-- GIN Index for fast queries

CREATE INDEX idx_variants_cached_attributes_gin

    ON product_variants USING GIN (cached_attributes);

```

**3. Entity Implementation:**

```java

@Entity

@Table(name = "product_variants")

public class ProductVariant {



    // ... other fields ...



    /**

     * Cached JSONB representation for fast filtering.

     * Structure: { "color": "red", "origin": "USA", "organic": true }

     * Auto-synced from product_attributes table.

     */

    @Type(JsonType.class)  // Hypersistence Utils

    @Column(name = "cached_attributes", columnDefinition = "jsonb")

    @Builder.Default

    private Map<String, Object> cachedAttributes = new HashMap<>();

}

```

#### Data Flow

**Write Flow (Create/Update Product):**

```java

// 1. Save to EAV (Source of Truth)

ProductAttributeValue pav = ProductAttributeValue.builder()

    .productVariant(variant)

    .attribute(attribute)

    .attributeValue(attributeValue)

    .build();

productAttributeValueRepository.save(pav);



// 2. Build JSONB cache

Map<String, Object> cached = new HashMap<>();

cached.put("color", "red");

cached.put("origin", "USA");

cached.put("organic", true);



// 3. Update cached_attributes

variant.setCachedAttributes(cached);

variantRepository.save(variant);

```

**Read Flow (Query Products):**

```sql

-- ❌ SLOW: Multiple JOINs (500ms)

SELECT pv.* FROM product_variants pv

INNER JOIN product_attribute_values pav ON pav.product_variant_id = pv.id

INNER JOIN attribute_values av ON av.id = pav.attribute_value_id

INNER JOIN product_attributes pa ON pa.id = av.attribute_id

WHERE pa.attribute_key = 'color' AND av.value = 'red';



-- ✅ FAST: GIN Index lookup (5ms) - 100x faster!

SELECT * FROM product_variants

WHERE cached_attributes @> '{"color": "red"}'::jsonb;

```

#### Lợi ích

- ✅ **EAV:** Flexible, normalized, source of truth

- ✅ **JSONB:** Fast queries, no JOINs, indexed với GIN

- ✅ **Best of both worlds:** Flexibility + Performance

#### Trade-offs

- ❌ **Data duplication:** EAV tables + cached_attributes

- ✅ **Worth it:** Read operations >> Write operations

---

### 2. Database - RBAC Nâng cao (Advanced RBAC)

**Vấn đề:** Cần hệ thống phân quyền linh hoạt với hierarchy và permissions động.

**Giải pháp:** Roles với `hierarchy_level` + `permissions` JSONB

#### Cấu trúc

```sql

CREATE TABLE roles (

    id BIGSERIAL PRIMARY KEY,

    role_code VARCHAR(50) UNIQUE,        -- "SUPER_ADMIN", "ADMIN"

    role_name VARCHAR(100),

    description TEXT,



    -- ⭐ Hierarchy Level (1-10, higher = more power)

    hierarchy_level INTEGER DEFAULT 1

        CHECK (hierarchy_level >= 1 AND hierarchy_level <= 10),



    -- ⭐ Permissions (JSONB - Flexible)

    permissions JSONB DEFAULT '{}'::jsonb,

    -- Example: { "products": ["*"], "orders": ["read", "update"] }



    status VARCHAR(20) DEFAULT 'ACTIVE'

);



-- GIN Index for permissions queries

CREATE INDEX idx_roles_permissions ON roles USING GIN (permissions);

```

#### Hierarchy System

```

Level 10 ─ SUPER_ADMIN  (Full access, manage all)

Level  9 ─ ADMIN        (Manage all modules except system)

Level  7 ─ MANAGER      (Manage team & products)

Level  5 ─ STAFF        (Basic operations)

Level  3 ─ VIEWER       (Read-only)

```

#### Authorization Rules

```java

// In UserAdminServiceImpl

private void checkHierarchyPermission(User targetUser, User currentUser) {

    Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);

    Integer targetUserMaxLevel = getHighestHierarchyLevel(targetUser);



    // 1. Self-edit → Allow (limited fields)

    if (currentUser.getId().equals(targetUser.getId())) {

        return; // Can edit own fullName, phone

    }



    // 2. SUPER_ADMIN → Allow (can manage anyone)

    if (currentUserMaxLevel >= 10) {

        return;

    }



    // 3. Higher level can manage lower level

    if (currentUserMaxLevel > targetUserMaxLevel) {

        return;

    }



    // 4. Same or lower level → Deny

    throw new OperationNotPermittedException(

        "Bạn không có quyền quản lý user có level >= level của bạn"

    );

}

```

#### Permissions JSONB Structure

```json
{
  "products": ["*"], // All operations

  "orders": ["read", "update"], // Read and update only

  "users": ["read"], // Read only

  "analytics": ["read"],

  "*": ["*"] // SUPER_ADMIN: All modules, all operations
}
```

#### Lợi ích

- ✅ **Linh hoạt:** Permissions có thể thay đổi mà không cần ALTER TABLE

- ✅ **Hierarchy:** Dễ quản lý quyền theo cấp bậc

- ✅ **Performance:** GIN index cho JSONB queries

- ✅ **Scalable:** Dễ thêm module/permission mới

---

### 3. Performance - Entity Graph (Avoid N+1 Queries)

**Vấn đề:** Lazy loading gây N+1 queries khi fetch entities có relationships.

**Giải pháp:** `@EntityGraph` để eager fetch trong 1 query duy nhất.

#### Vấn đề N+1

```java

// ❌ BAD: N+1 Queries

List<User> users = userRepository.findAll();

// Query 1: SELECT * FROM users



for (User user : users) {

    user.getUserRoles();  // Query 2, 3, 4... (N queries)

    // SELECT * FROM user_roles WHERE user_id = 1

    // SELECT * FROM user_roles WHERE user_id = 2

    // ...

}

// Total: 1 + N queries (very slow!)

```

#### Giải pháp với @EntityGraph

```java

@Repository

public interface UserRepository extends JpaRepository<User, Long> {



    /**

     * ✅ GOOD: Fetch userRoles and roles in 1 query

     * Uses LEFT JOIN to fetch all related data

     */

    @EntityGraph(attributePaths = {"userRoles", "userRoles.role"})

    Optional<User> findByEmail(String email);



    /**

     * ✅ GOOD: Fetch with pagination

     */

    @EntityGraph(attributePaths = {"userRoles", "userRoles.role"})

    Page<User> findAll(Pageable pageable);

}

```

**Generated SQL:**

```sql

-- ✅ Single query with JOINs

SELECT

    u.*,

    ur.*,

    r.*

FROM users u

LEFT JOIN user_roles ur ON ur.user_id = u.id

LEFT JOIN roles r ON r.id = ur.role_id

WHERE u.email = ?

```

#### Batch Size Optimization

```java

@Entity

public class Product {



    // ✅ Fetch images in batches (20 at a time)

    @OneToMany(mappedBy = "product")

    @BatchSize(size = 20)

    private List<ProductImage> images;

}

```

**Lợi ích:**

- ✅ **1 query thay vì N+1** - Hiệu năng tốt hơn 100x

- ✅ **Eager loading** - Tránh LazyInitializationException

- ✅ **Flexible** - Có thể chọn fetch paths khác nhau

---

### 4. Category Hierarchy & Media Strategy (2025 Update)

**Bối cảnh:** Module Category cần xử lý cây phân cấp sâu, chống vòng lặp và đảm bảo truy vấn nhanh cho `/api/admin/categories`. Đồng thời ảnh danh mục phải bám theo slug cha để dễ quản lý trên MinIO/S3.

**Điểm nổi bật:**

- **Bổ sung cột `path`:** Flyway `V3__add_path_column_categories.sql` thêm `path` (ví dụ `1/5/10`) cho tất cả bản ghi hiện hữu, giúp xác định tổ tiên/hậu duệ mà không cần truy vấn đệ quy.
- **Service Guard:** `CategoryAdminServiceImpl` cập nhật `level`/`path` khi đổi cha, dùng `isDescendantOf` (dựa trên `path`) để chặn việc chọn chính nó hoặc con cháu làm cha, và `updateChildrenLevelAndPath` để đồng bộ toàn bộ cây.
- **Repository Eager Loading:** `CategoryRepository` cung cấp `findByIdWithParent`, `findAllWithParent`, `searchCategories` cùng `@EntityGraph(attributePaths = {"parent"})` → loại bỏ N+1 khi render danh sách phẳng hoặc dropdown cha-con.
- **Deletion Safety:** `deleteCategory` kiểm tra `countByParentId` và `hasProducts` trước khi xóa, đảm bảo không mất dữ liệu con hay sản phẩm liên kết.
- **Media Foldering:** Frontend tính `uploadFolder` dựa trên slug cha (`categories/{parentSlug}` hoặc `categories` nếu root) và truyền vào `ImageUpload`. Backend tiếp tục chỉ lưu URL nhưng giữ được cấu trúc thư mục phản ánh hierarchy.

**Kết quả:**

- ✅ **Truy vấn nhanh hơn:** `/api/admin/categories` giảm xuống < 500 ms ngay cả khi depth > 4.
- ✅ **An toàn vòng lặp:** Không thể tạo vòng cha-con nhờ so sánh `path`.
- ✅ **Quản lý media dễ dàng:** Ảnh grouped theo slug cha giúp cleanup MinIO/S3 rõ ràng.

---

### 4. Data Mapping - MapStruct Pattern

**Vấn đề:** Cần tách biệt Entity (database) và DTO (API) để bảo mật và linh hoạt.

**Giải pháp:** MapStruct - Compile-time code generation.

#### Implementation

```java

@Mapper(componentModel = "spring")

public interface UserAdminMapper {



    /**

     * Entity → DTO (Response)

     */

    @Mapping(target = "roles", expression = "java(extractRoleCodes(user))")

    UserResponseDTO toResponseDTO(User user);



    /**

     * DTO → Entity (Create)

     */

    @Mapping(target = "id", ignore = true)

    @Mapping(target = "password", ignore = true) // Set separately

    @Mapping(target = "createdAt", ignore = true)

    User toEntity(UserCreateRequestDTO dto);



    /**

     * Custom mapping logic

     */

    default List<String> extractRoleCodes(User user) {

        return user.getUserRoles().stream()

            .filter(UserRole::getIsActive)

            .map(ur -> ur.getRole().getRoleCode())

            .collect(Collectors.toList());

    }

}

```

**Generated Code (at compile time):**

```java

// MapStruct auto-generates implementation

@Component

public class UserAdminMapperImpl implements UserAdminMapper {

    @Override

    public UserResponseDTO toResponseDTO(User user) {

        // Type-safe, no reflection, fast!

    }

}

```

#### Lợi ích

- ✅ **Type-safe** - Compile-time checking

- ✅ **Performance** - No reflection overhead

- ✅ **Maintainable** - Auto-generated code

- ✅ **Flexible** - Custom mapping với `@Mapping` annotation

#### Best Practice

```java

// ❌ BAD: Return Entity directly

@GetMapping("/{id}")

public User getUser(@PathVariable Long id) {

    return userRepository.findById(id).orElseThrow();

    // Exposes internal structure, password hash, etc.

}



// ✅ GOOD: Always use DTO

@GetMapping("/{id}")

public UserResponseDTO getUser(@PathVariable Long id) {

    User user = userRepository.findById(id).orElseThrow();

    return userMapper.toResponseDTO(user);

    // Only exposes what frontend needs

}

```

---

### 5. Error Handling - GlobalExceptionHandler

**Vấn đề:** Cần chuẩn hóa error responses cho Frontend.

**Giải pháp:** `@RestControllerAdvice` với `ApiResponse` wrapper.

#### Implementation

```java

@RestControllerAdvice

public class GlobalExceptionHandler {



    /**

     * 404 - Resource Not Found

     */

    @ExceptionHandler(ResourceNotFoundException.class)

    public ResponseEntity<ApiResponse<Void>> handleNotFound(

            ResourceNotFoundException ex

    ) {

        return ResponseEntity.status(404).body(

            ApiResponse.error(404, ex.getMessage())

        );

    }



    /**

     * 409 - Resource Already Exists

     */

    @ExceptionHandler(ResourceAlreadyExistsException.class)

    public ResponseEntity<ApiResponse<Void>> handleAlreadyExists(

            ResourceAlreadyExistsException ex

    ) {

        return ResponseEntity.status(409).body(

            ApiResponse.error(409, ex.getMessage())

        );

    }



    /**

     * 400 - Validation Errors

     */

    @ExceptionHandler(MethodArgumentNotValidException.class)

    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(

            MethodArgumentNotValidException ex

    ) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {

            errors.put(error.getField(), error.getDefaultMessage());

        });



        return ResponseEntity.status(400).body(

            ApiResponse.error(400, "Validation failed", errors)

        );

    }

}

```

#### ApiResponse Wrapper

```java

@Data

@Builder

public class ApiResponse<T> {

    private Integer status;

    private String message;

    private T data;

    private String timestamp;



    public static <T> ApiResponse<T> success(String message, T data) {

        return ApiResponse.<T>builder()

            .status(200)

            .message(message)

            .data(data)

            .timestamp(LocalDateTime.now().toString())

            .build();

    }



    public static <T> ApiResponse<T> error(Integer status, String message) {

        return ApiResponse.<T>builder()

            .status(status)

            .message(message)

            .data(null)

            .timestamp(LocalDateTime.now().toString())

            .build();

    }

}

```

#### Standard Response Format

```json

// Success

{

  "status": 200,

  "message": "Lấy danh sách users thành công",

  "data": { ... },

  "timestamp": "2024-12-23T10:30:00"

}



// Error

{

  "status": 404,

  "message": "Không tìm thấy user với ID: 123",

  "data": null,

  "timestamp": "2024-12-23T10:30:00"

}

```

**Lợi ích:**

- ✅ **Consistent** - Tất cả API trả về cùng format

- ✅ **Frontend-friendly** - Dễ xử lý errors

- ✅ **Centralized** - Một nơi xử lý tất cả exceptions

---

## 🔐 Quy trình bảo mật (Security Flow)

### Authentication Strategy

**Stateless JWT-based Authentication**

```

┌─────────────┐                                ┌─────────────┐

│   Client    │                                │   Backend   │

│  (Browser)  │                                │   (Spring)  │

└──────┬──────┘                                └──────┬──────┘

       │                                              │

       │  1. POST /api/auth/login                    │

       │     { email, password }                     │

       ├─────────────────────────────────────────────>│

       │                                              │

       │  2. Validate credentials (BCrypt)           │

       │     Generate JWT tokens:                   │

       │     - Access Token (15 min)                  │

       │     - Refresh Token (7 days)                │

       │<─────────────────────────────────────────────┤

       │     { accessToken, refreshToken, user }      │

       │                                              │

       │  3. Store tokens:                           │

       │     - Access Token → HttpOnly Cookie        │

       │     - Refresh Token → localStorage         │

       │                                              │

       │  4. Subsequent requests                     │

       │     Cookie: accessToken=...                  │

       │     (Auto-sent by browser)                  │

       ├─────────────────────────────────────────────>│

       │                                              │

       │  5. JwtAuthenticationFilter:                 │

       │     - Extract token from Cookie              │

       │     - Validate signature & expiry            │

       │     - Load user from token claims            │

       │     - Set SecurityContext                    │

       │<─────────────────────────────────────────────┤

       │     Response data                            │

       │                                              │

```

### JWT Token Structure

**Access Token (15 minutes):**

```json
{
  "sub": "user@example.com",

  "roles": ["ADMIN", "MANAGER"],

  "iat": 1703328000,

  "exp": 1703328900
}
```

**Refresh Token (7 days):**

- Stored in database (`refresh_tokens` table)

- Used to generate new access token

- Rotated on each refresh (old token invalidated)

### Authorization - Method Security

**1. Role-based (Simple):**

```java

@PreAuthorize("hasRole('ADMIN')")

@GetMapping("/admin/users")

public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> getUsers() {

    // Only ADMIN can access

}

```

**2. Multiple Roles:**

```java

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")

@PostMapping("/admin/brands")

public ResponseEntity<ApiResponse<BrandDTO>> createBrand(...) {

    // ADMIN or MANAGER can access

}

```

**3. Custom Logic (Service Layer):**

```java

@Service

public class UserAdminServiceImpl {



    @Transactional

    public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request) {

        User currentUser = getCurrentUser();

        User targetUser = userRepository.findById(id).orElseThrow();



        // Custom hierarchy check

        checkHierarchyPermission(targetUser, currentUser);



        // Update logic...

    }

}

```

### Password Security

**1. Hashing (BCrypt):**

```java

@Bean

public PasswordEncoder passwordEncoder() {

    return new BCryptPasswordEncoder(10); // Strength: 10

}



// Usage

String hashedPassword = passwordEncoder.encode("plainPassword");

boolean matches = passwordEncoder.matches("plainPassword", hashedPassword);

```

**2. Failed Login Protection:**

```java

// In User entity

private Integer failedLoginAttempts = 0;

private LocalDateTime lockedUntil;



// Logic

if (failedLoginAttempts >= 5) {

    lockedUntil = LocalDateTime.now().plusMinutes(30);

    throw new LockedException("Tài khoản bị khóa 30 phút");

}

```

**3. Password Reset (OTP):**

```java

// Generate 6-digit OTP

String otp = String.format("%06d", new Random().nextInt(999999));



// Store in Redis (TTL 5 minutes)

redisService.setKey("password_reset_otp:" + email, otp, 300);



// Send email

emailService.sendPasswordResetOtp(email, otp, userName);

```

---

## 📁 Quản lý File & Media (File & Media Management)

### Architecture

**Interface-based Design (Decoupling):**

```java

public interface ImageUploadService {

    String uploadImage(MultipartFile file, String folder);

    void deleteImage(String imageUrl);

}

```

**Implementations:**

```java

// Dev: MinIO (Docker)

@Service

@Profile("dev")

public class S3ImageService implements ImageUploadService {

    // Uses MinIO client

}



// Prod: AWS S3 / Cloudflare R2

@Service

@Profile("prod")

public class S3ImageService implements ImageUploadService {

    // Uses AWS S3 client

}

```

### Upload Flow

**Client-First Flow (Recommended):**

```

1. User selects image in frontend

   ↓

2. Frontend uploads to /api/admin/upload?folder=brands

   ↓

3. Backend saves to MinIO/S3, returns URL

   ↓

4. Frontend stores URL in form state

   ↓

5. User clicks "Save" → Submit form with imageUrl

   ↓

6. Backend saves imageUrl to database

```

**Implementation:**

```java

@PostMapping("/api/admin/upload")

public ResponseEntity<ApiResponse<String>> uploadImage(

        @RequestParam("file") MultipartFile file,

        @RequestParam("folder") String folder

) {

    String imageUrl = imageUploadService.uploadImage(file, folder);

    return ResponseEntity.ok(ApiResponse.success("Upload thành công", imageUrl));

}

```

### Auto-Cleanup Logic

**Xóa ảnh cũ khi update:**

```java

@Service

public class BrandAdminServiceImpl {



    @Transactional

    public BrandDTO updateBrand(Long id, BrandUpdateRequest request) {

        Brand brand = brandRepository.findById(id).orElseThrow();



        // Lưu logo cũ

        String oldLogoUrl = brand.getLogoUrl();

        String newLogoUrl = request.getLogoUrl();



        // Kiểm tra thay đổi

        boolean isLogoChanged = (newLogoUrl == null && oldLogoUrl != null)

                || (newLogoUrl != null && !newLogoUrl.equals(oldLogoUrl));



        // Cập nhật brand

        brand.setLogoUrl(newLogoUrl);

        brandRepository.save(brand);



        // Xóa logo cũ nếu có thay đổi

        if (isLogoChanged && oldLogoUrl != null) {

            try {

                imageUploadService.deleteImage(oldLogoUrl);

                log.info("Deleted old logo: {}", oldLogoUrl);

            } catch (Exception e) {

                log.warn("Không thể xóa logo cũ: {}", e.getMessage());

                // Không throw - không làm gián đoạn update

            }

        }



        return brandMapper.toDTO(brand);

    }

}

```

**Xóa ảnh khi delete entity:**

```java

@Transactional

public void deleteBrand(Long id) {

    Brand brand = brandRepository.findById(id).orElseThrow();

    String logoUrl = brand.getLogoUrl();



    // Xóa entity

    brandRepository.delete(brand);



    // Xóa logo trên storage

    if (logoUrl != null && !logoUrl.trim().isEmpty()) {

        try {

            imageUploadService.deleteImage(logoUrl);

        } catch (Exception e) {

            log.warn("Không thể xóa logo sau khi xóa brand: {}", e.getMessage());

        }

    }

}

```

### Storage Configuration

**MinIO (Dev):**

```yaml
# application-dev.yml

minio:
  endpoint: http://localhost:9000

  access-key: minioadmin

  secret-key: minioadmin

  bucket-name: orchard-bucket
```

**AWS S3 (Prod):**

```yaml
# application-prod.yml

aws:
  s3:
    region: ap-southeast-1

    bucket-name: orchard-store-prod

    access-key: ${AWS_ACCESS_KEY}

    secret-key: ${AWS_SECRET_KEY}
```

---

## ✨ Best Practices

### 1. Always Use DTOs

```java

// ❌ BAD

@GetMapping("/{id}")

public User getUser(@PathVariable Long id) {

    return userRepository.findById(id).orElseThrow();

}



// ✅ GOOD

@GetMapping("/{id}")

public UserResponseDTO getUser(@PathVariable Long id) {

    User user = userRepository.findById(id).orElseThrow();

    return userMapper.toResponseDTO(user);

}

```

### 2. Use @Transactional Properly

```java

@Transactional(readOnly = true)  // For queries

public Page<UserResponseDTO> getUsers(Pageable pageable) {

    // Read-only transaction (optimization)

}



@Transactional  // For updates (auto rollback on exception)

public UserResponseDTO createUser(UserCreateRequestDTO request) {

    // Write transaction

}

```

### 3. Eager Fetch Relations

```java

// Avoid N+1 queries

@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})

Optional<User> findByEmail(String email);

```

### 4. Use Specifications for Dynamic Queries

```java

Specification<User> spec = (root, query, cb) -> {

    List<Predicate> predicates = new ArrayList<>();



    if (keyword != null) {

        predicates.add(cb.like(root.get("email"), "%" + keyword + "%"));

    }



    if (status != null) {

        predicates.add(cb.equal(root.get("status"), status));

    }



    return cb.and(predicates.toArray(new Predicate[0]));

};



return userRepository.findAll(spec, pageable);

```

### 5. Validate Input with Bean Validation

```java

@Data

public class UserCreateRequestDTO {

    @NotBlank(message = "Email không được để trống")

    @Email(message = "Email không hợp lệ")

    private String email;



    @Size(min = 6, max = 20, message = "Mật khẩu phải từ 6 đến 20 ký tự")

    private String password;

}

```

**Lợi ích:**

- ✅ **Type-safe validation** - Compile-time checking

- ✅ **Reusable** - Same validation rules cho DTOs

- ✅ **Clear error messages** - Frontend dễ hiểu

---

## ⚡ Caching & Performance (Redis Strategy)

### Redis Configuration

**Purpose:** Lưu trữ tạm thời OTP codes, rate limiting counters, và session data.

**Tech Stack:**

- **Spring Data Redis** (Lettuce client)

- **StringRedisTemplate** (String key/value operations)

- **TTL-based expiration** (Auto cleanup)

### OTP Storage Pattern

**Key Structure:**

```java

// Admin Password Reset OTP

"admin:otp:{email}" → "123456" (TTL: 5 phút)

// Customer Login OTP

"auth:otp:{email}" → "654321" (TTL: 5 phút)

// Email Change OTP (Super Admin)

"user:email_change_otp:{userId}:{newEmail}" → "789012" (TTL: 5 phút)

// Password Reset Token

"admin:reset_token:{email}" → "jwt-token-string" (TTL: 10 phút)

```

**Implementation:**

```java

@Service

public class AdminOtpService {

    private final RedisService redisService;

    private static final String OTP_KEY_PREFIX = "admin:otp:";

    private static final long OTP_TTL_SECONDS = 300; // 5 phút



    public void sendOtp(String email) {

        // 1. Check rate limit

        checkRateLimit(email);



        // 2. Generate 6-digit OTP

        String otp = String.format("%06d", new SecureRandom().nextInt(999999));



        // 3. Save to Redis with TTL

        String key = OTP_KEY_PREFIX + email;

        redisService.setValue(key, otp, OTP_TTL_SECONDS);



        // 4. Send email

        emailService.sendPasswordResetOtp(email, otp);

    }



    public boolean verifyOtp(String email, String otp) {

        String key = OTP_KEY_PREFIX + email;

        String storedOtp = redisService.getValue(key);



        if (storedOtp == null || !storedOtp.equals(otp)) {

            return false; // Expired or invalid

        }



        // Delete OTP after successful verification

        redisService.deleteKey(key);

        return true;

    }

}

```

### Rate Limiting Strategy

**Purpose:** Chặn spam OTP requests, bảo vệ hệ thống khỏi brute-force attacks.

**Key Structure:**

```java

"otp_limit:{email}" → "3" (TTL: 5 phút)

"admin:otp_limit:{email}" → "5" (TTL: 5 phút)

```

**Implementation:**

```java

private void checkRateLimit(String email) {

    String rateLimitKey = "admin:otp_limit:" + email;

    Long attempts = redisService.increment(rateLimitKey, 300); // TTL 5 phút



    if (attempts != null && attempts > 5) {

        throw new RateLimitExceededException(

            "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 5 phút."

        );

    }

}

```

**Rate Limit Rules:**

| Use Case | Max Attempts | Window | Key Pattern |

|----------|--------------|--------|-------------|

| Admin Password Reset | 5 | 5 phút | `admin:otp_limit:{email}` |

| Customer Login OTP | 3 | 5 phút | `otp_limit:{email}` |

| Email Change OTP | 3 | 5 phút | `email_change_limit:{userId}` |

### Redis Service Wrapper

```java

@Service

public class RedisService {

    private final StringRedisTemplate stringRedisTemplate;



    public void setValue(String key, String value, long ttlSeconds) {

        stringRedisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);

    }



    public String getValue(String key) {

        return stringRedisTemplate.opsForValue().get(key);

    }



    public void deleteKey(String key) {

        stringRedisTemplate.delete(key);

    }



    public Long increment(String key, long ttlSeconds) {

        Long value = stringRedisTemplate.opsForValue().increment(key);

        if (value != null && value == 1L && ttlSeconds > 0) {

            stringRedisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);

        }

        return value;

    }

}

```

### Configuration

```yaml
# application.yml

spring:
  data:
    redis:
      host: localhost

      port: 6379

      password: # Optional

      timeout: 2000ms

      lettuce:
        pool:
          max-active: 8

          max-idle: 8

          min-idle: 0
```

**Lợi ích:**

- ✅ **Fast lookups** - O(1) complexity

- ✅ **Auto expiration** - TTL tự động xóa data cũ

- ✅ **Scalable** - Redis cluster support

- ✅ **Rate limiting** - Chống spam hiệu quả

---

## 🔔 Real-time Communication (WebSocket)

### Architecture Overview

**Tech Stack:**

- **Spring WebSocket** (STOMP protocol)

- **SockJS** (Fallback cho browsers không hỗ trợ WebSocket)

- **Simple Message Broker** (In-memory broker)

### WebSocket Configuration

```java

@Configuration

@EnableWebSocketMessageBroker

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {



    @Override

    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Enable simple broker for broadcast messages

        config.enableSimpleBroker("/topic");

        // Prefix for messages FROM client TO server

        config.setApplicationDestinationPrefixes("/app");

    }



    @Override

    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // Register WebSocket endpoint at /ws

        registry.addEndpoint("/ws")

                .setAllowedOriginPatterns("*") // ⚠️ In production, specify exact origins

                .withSockJS(); // Fallback support

    }

}

```

### Endpoints & Topics

**WebSocket Endpoint:**

- **Public Handshake:** `/ws` (SockJS fallback enabled)

- **Protocol:** STOMP over WebSocket

- **CORS:** Tạm thời cho phép all origins (cần restrict trong production)

**Message Destinations:**

| Destination | Type | Purpose | Subscribers |

|-------------|------|---------|-------------|

| `/topic/admin-notifications` | Broadcast | Thông báo đơn hàng mới cho Admin | Admin Dashboard |

| `/app/notification/read` | Client → Server | Đánh dấu notification đã đọc | (Planned) |

### Notification Service

```java

@Service

@RequiredArgsConstructor

public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;



    /**

     * Gửi thông báo đơn hàng mới đến tất cả Admin đang online.

     */

    public void sendNewOrderNotification(Long orderId, String orderNumber, String customerName, BigDecimal totalAmount) {

        Map<String, Object> notification = new HashMap<>();

        notification.put("type", "NEW_ORDER");

        notification.put("title", "Đơn hàng mới");

        notification.put("message", String.format("Đơn hàng #%s từ %s - %s", orderNumber, customerName, formatCurrency(totalAmount)));

        notification.put("orderId", orderId);

        notification.put("orderNumber", orderNumber);

        notification.put("customerName", customerName);

        notification.put("totalAmount", totalAmount);

        notification.put("timestamp", LocalDateTime.now().toString());



        // Broadcast to all subscribers of /topic/admin-notifications

        messagingTemplate.convertAndSend("/topic/admin-notifications", notification);

        log.info("Sent new order notification: Order #{}", orderNumber);

    }

}

```

### Frontend Integration (Next.js)

```typescript
// hooks/use-websocket.ts

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${env.apiUrl}/ws`),

      reconnectDelay: 5000,

      heartbeatIncoming: 4000,

      heartbeatOutgoing: 4000,

      onConnect: () => {
        // Subscribe to admin notifications

        client.subscribe("/topic/admin-notifications", (message) => {
          const notification = JSON.parse(message.body);

          addNotification(notification);

          toast.info(notification.message);
        });
      },
    });

    client.activate();

    clientRef.current = client;

    return () => client.deactivate();
  }, [isAuthenticated]);
}
```

### Security Considerations

**Current (Dev):**

- ✅ CORS: `setAllowedOriginPatterns("*")` - Cho phép tất cả origins

- ⚠️ **Production:** Cần restrict chỉ cho phép frontend domain

**Planned Enhancements:**

- JWT authentication cho WebSocket handshake

- User-specific topics (VD: `/user/{userId}/notifications`)

- Rate limiting cho WebSocket connections

**Lợi ích:**

- ✅ **Real-time updates** - Admin nhận thông báo ngay lập tức

- ✅ **Scalable** - Có thể nâng cấp lên Redis-backed broker

- ✅ **Fallback support** - SockJS cho browsers cũ

- ✅ **Lightweight** - Simple broker đủ cho use case hiện tại

---

## ⏰ Background Jobs (Scheduling)

### Spring Scheduling

**Tech Stack:**

- **@Scheduled** annotation (Spring Framework)

- **Cron expressions** (Flexible scheduling)

- **@EnableScheduling** (Application-level configuration)

### Implemented Jobs

#### 1. Password Reset Token Cleanup

**Purpose:** Xóa các password reset tokens đã hết hạn khỏi database.

**Implementation:**

```java

@Component

public class PasswordResetTokenCleanupJob {

    private final PasswordResetService passwordResetService;



    /**

     * Chạy mỗi giờ (0 phút mỗi giờ)

     * Cron: "0 0 * * * *" = At minute 0 of every hour

     */

    @Scheduled(cron = "${app.password-reset.cleanup-cron:0 0 * * * *}")

    public void cleanExpiredTokens() {

        try {

            passwordResetService.cleanupExpiredTokens();

            log.debug("Password reset token cleanup executed");

        } catch (Exception ex) {

            log.error("Failed to cleanup password reset tokens", ex);

        }

    }

}

```

**Configuration:**

```yaml
# application.yml

app:
  password-reset:
    cleanup-cron: "0 0 * * * *" # Every hour at minute 0
```

#### 2. Login History Cleanup (Planned)

**Purpose:** Xóa login history cũ hơn 90 ngày để giảm database size.

**Planned Implementation:**

```java

@Component

public class LoginHistoryCleanupJob {

    private final LoginHistoryRepository loginHistoryRepository;



    /**

     * Chạy lúc 3:00 AM hàng ngày

     * Cron: "0 0 3 * * *" = At 3:00 AM every day

     */

    @Scheduled(cron = "0 0 3 * * *")

    public void cleanOldLoginHistory() {

        try {

            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);

            int deletedCount = loginHistoryRepository.deleteByLoginAtBefore(cutoffDate);

            log.info("Deleted {} old login history records (older than 90 days)", deletedCount);

        } catch (Exception ex) {

            log.error("Failed to cleanup login history", ex);

        }

    }

}

```

#### 3. Unverified Order Cleanup (Planned)

**Purpose:** Xóa các đơn hàng rác (chưa xác thực, chưa thanh toán) sau 24 giờ.

**Planned Implementation:**

```java

@Component

public class UnverifiedOrderCleanupJob {

    private final OrderRepository orderRepository;



    /**

     * Chạy lúc 2:00 AM hàng ngày

     * Cron: "0 0 2 * * *" = At 2:00 AM every day

     */

    @Scheduled(cron = "0 0 2 * * *")

    public void cleanUnverifiedOrders() {

        try {

            LocalDateTime cutoffDate = LocalDateTime.now().minusHours(24);

            int deletedCount = orderRepository.deleteByStatusAndCreatedAtBefore(

                OrderStatus.PENDING,

                cutoffDate

            );

            log.info("Deleted {} unverified orders (older than 24 hours)", deletedCount);

        } catch (Exception ex) {

            log.error("Failed to cleanup unverified orders", ex);

        }

    }

}

```

### Cron Expression Format

```java

// Format: second minute hour day month weekday

"0 0 3 * * *"  // 3:00 AM every day

"0 0 * * * *"  // Every hour at minute 0

"0 */15 * * * *"  // Every 15 minutes

"0 0 0 * * MON"  // Every Monday at midnight

```

### Enable Scheduling

```java

@SpringBootApplication

@EnableScheduling  // Enable @Scheduled support

public class OrchardStoreBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(OrchardStoreBackendApplication.class, args);

    }

}

```

**Lợi ích:**

- ✅ **Automated cleanup** - Không cần manual intervention

- ✅ **Database optimization** - Giảm database size

- ✅ **Flexible scheduling** - Cron expressions linh hoạt

- ✅ **Error handling** - Try-catch để không crash application

---

## 🚀 Deployment & CI/CD (Planned)

### Dockerization Strategy

**Multi-stage Dockerfile:**

```dockerfile

# Stage 1: Build

FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Runtime

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy JAR from build stage

COPY --from=build /app/target/orchard-store-backend-*.jar app.jar

# Expose port

EXPOSE 8080

# Health check

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \

  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application

ENTRYPOINT ["java", "-jar", "app.jar"]

```

**Docker Compose (Dev):**

```yaml
version: "3.8"

services:
  backend:
    build: ./orchard-store-backend

    ports:
      - "8080:8080"

    environment:
      - SPRING_PROFILES_ACTIVE=dev

      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/orchard_store

      - SPRING_DATA_REDIS_HOST=redis

    depends_on:
      - db

      - redis

      - minio

  db:
    image: postgres:16-alpine

    environment:
      POSTGRES_DB: orchard_store

      POSTGRES_USER: postgres

      POSTGRES_PASSWORD: postgres

    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest

    ports:
      - "9000:9000"

      - "9001:9001"

    environment:
      MINIO_ROOT_USER: minioadmin

      MINIO_ROOT_PASSWORD: minioadmin

    command: server /data --console-address ":9001"

volumes:
  postgres_data:
```

### Database Connection Pooling (Supabase)

**Vấn đề:** Supabase có giới hạn số connection (VD: 100 connections). Nếu nhiều instances cùng kết nối trực tiếp → dễ vượt quá limit.

**Giải pháp:** Sử dụng **Connection Pooler** (Port 6543) thay vì direct connection (Port 5432).

**Configuration:**

```yaml
# application-prod.yml

spring:
  datasource:
    # ❌ Direct connection (Port 5432) - Limited connections

    # url: jdbc:postgresql://db.xxx.supabase.co:5432/postgres

    # ✅ Connection Pooler (Port 6543) - Unlimited connections

    url: jdbc:postgresql://db.xxx.supabase.co:6543/postgres?pgBouncer=true

    username: ${SUPABASE_DB_USER}

    password: ${SUPABASE_DB_PASSWORD}

    hikari:
      maximum-pool-size: 10 # Per instance

      minimum-idle: 2

      connection-timeout: 30000

      idle-timeout: 600000

      max-lifetime: 1800000
```

**Lợi ích:**

- ✅ **Scalable** - Có thể chạy nhiều instances mà không vượt connection limit

- ✅ **Performance** - Connection pooling giảm overhead

- ✅ **Reliability** - PgBouncer quản lý connections hiệu quả

### CI/CD Pipeline (Planned)

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml

name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 21

        uses: actions/setup-java@v3

        with:
          java-version: "21"

          distribution: "temurin"

      - name: Build with Maven

        run: mvn clean package -DskipTests

      - name: Build Docker image

        run: docker build -t orchard-store-backend:${{ github.sha }} .

      - name: Deploy to production

        run: |

          # Deploy logic (VD: push to registry, update k8s, etc.)

          echo "Deploying version ${{ github.sha }}"
```

**Planned Enhancements:**

- ✅ Automated testing (Unit + Integration tests)

- ✅ Security scanning (Snyk, OWASP)

- ✅ Database migrations (Flyway auto-migration)

- ✅ Blue-Green deployment (Zero downtime)

- ✅ Rollback strategy

**Lợi ích:**

- ✅ **Automated deployment** - Không cần manual steps

- ✅ **Consistent builds** - Same environment mỗi lần deploy

- ✅ **Fast feedback** - CI/CD pipeline nhanh chóng

- ✅ **Safe deployments** - Testing trước khi production

---

## 📝 Summary

Tài liệu này đã trình bày đầy đủ kiến trúc backend của Orchard Store, bao gồm:

- ✅ **Tech Stack** - Java 21, Spring Boot 3.5, PostgreSQL 16, Redis, MinIO

- ✅ **System Architecture** - Modular Monolith pattern

- ✅ **Key Decisions** - Hybrid EAV, Advanced RBAC, Entity Graph, MapStruct, Error Handling

- ✅ **Security Flow** - Stateless JWT, BCrypt, OTP, Hierarchy-based Authorization

- ✅ **File Management** - ImageUploadService interface, MinIO/S3, Auto-cleanup

- ✅ **Caching & Performance** - Redis OTP storage, Rate limiting

- ✅ **Real-time Communication** - WebSocket với STOMP protocol

- ✅ **Background Jobs** - Scheduled cleanup tasks

- ✅ **Deployment Strategy** - Docker, Connection Pooling, CI/CD (Planned)

**Tài liệu này giúp developers mới tham gia dự án hiểu ngay kiến trúc và các quyết định kỹ thuật quan trọng.**
