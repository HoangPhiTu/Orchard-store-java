# 📝 Coding Standards & Documentation Conventions - Orchard Store

**Last Updated**: 2024-12-20

> **📌 Mục đích:** File này định nghĩa các quy tắc và chuẩn mực cho việc viết code, comment, và documentation trong dự án Orchard Store.

---

## 📋 Mục Lục

- [Việt Hóa Comment](#-việt-hóa-comment)
- [Naming Conventions](#-naming-conventions)
- [Documentation File Naming](#-documentation-file-naming)
- [Code Comment Guidelines](#-code-comment-guidelines)
- [Best Practices](#-best-practices)

---

## 🇻🇳 Việt Hóa Comment

### 🎯 Nguyên Tắc Chung

**TẤT CẢ comment trong code phải được viết bằng TIẾNG VIỆT** để:

- ✅ Dễ đọc và hiểu cho team người Việt
- ✅ Giảm thiểu rào cản ngôn ngữ
- ✅ Tăng tốc độ phát triển
- ✅ Dễ bảo trì và debug

### 📝 Các Loại Comment

#### 1. **Class-Level Comments**

```java
/**
 * Service xử lý logic nghiệp vụ cho Product.
 *
 * Bao gồm các chức năng:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Search và Filter products
 * - Quản lý product variants và images
 * - Tính toán giá và stock
 *
 * @author Orchard Store Team
 * @since 2024-12-20
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    // ...
}
```

#### 2. **Method-Level Comments**

```java
/**
 * Lấy danh sách products với phân trang và filter.
 *
 * @param pageable Thông tin phân trang (page, size, sort)
 * @return Page<ProductDTO> Danh sách products đã được map sang DTO
 * @throws IllegalArgumentException Nếu pageable không hợp lệ
 */
@Override
public Page<ProductDTO> getAllProducts(Pageable pageable) {
    // Implementation
}
```

#### 3. **Field-Level Comments**

```java
/**
 * Cached JSONB representation của product attributes để tối ưu query.
 *
 * Structure: { "attribute_key": { "value": "...", "display": "...", "type": "..." } }
 * Auto-synced từ product_attributes table qua database trigger.
 *
 * @see ProductVariantAttributeCacheService
 */
@Type(JsonType.class)
@Column(name = "cached_attributes", columnDefinition = "jsonb")
private Map<String, Object> cachedAttributes = new HashMap<>();
```

#### 4. **Inline Comments**

```java
// Kiểm tra account có bị lock không
if (user.isAccountLocked()) {
    throw new RuntimeException("Account is locked");
}

// Reset failed login attempts sau khi đăng nhập thành công
user.resetFailedLoginAttempts();
```

#### 5. **TODO/FIXME Comments**

```java
// TODO: Implement refresh token rotation mechanism
// TODO: Add rate limiting cho API endpoints
// FIXME: Handle edge case khi product không có variants
// NOTE: Cần optimize query này khi số lượng products tăng lên
```

### ✅ Ví Dụ Tốt

```java
/**
 * Repository cho Product entity với các tính năng:
 * - Entity Graph để eager fetch relationships
 * - Specification để dynamic filtering
 * - JSONB query optimization
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
                                          JpaSpecificationExecutor<Product> {

    /**
     * Tìm Product theo ID và eager fetch tất cả relationships.
     *
     * Sử dụng Entity Graph để tránh LazyInitializationException và N+1 problem.
     * Fetch: variants, images, seoUrls, brand trong 1 query duy nhất.
     *
     * @param id ID của product
     * @return Optional<Product> Product với đầy đủ relationships, hoặc empty nếu không tìm thấy
     */
    @EntityGraph(attributePaths = {"variants", "images", "seoUrls", "brand"})
    Optional<Product> findByIdWithDetails(Long id);
}
```

### ❌ Ví Dụ Không Tốt

```java
// ❌ Comment bằng tiếng Anh
/**
 * Service for handling product business logic
 */
@Service
public class ProductServiceImpl implements ProductService {
    // ❌ Comment không rõ ràng
    // Get products
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        // ❌ Comment không giải thích tại sao
        // Use repository
        return productRepository.findAll(pageable).map(mapper::toDTO);
    }
}
```

---

## 📛 Naming Conventions

### 🎯 Nguyên Tắc Chung

- **Tiếng Anh cho code**: Tên class, method, variable, constant → **TIẾNG ANH**
- **Tiếng Việt cho comment**: Tất cả comment → **TIẾNG VIỆT**
- **CamelCase**: Classes, Interfaces, Enums
- **camelCase**: Methods, Variables
- **UPPER_SNAKE_CASE**: Constants
- **kebab-case**: File names, URLs, slugs

### 📦 Classes & Interfaces

```java
// ✅ Tốt
public class ProductService { }
public interface ProductRepository { }
public enum ProductStatus { }
public class ProductDTO { }

// ❌ Không tốt
public class SanPhamService { }  // Không dùng tiếng Việt
public class productService { }  // Không đúng CamelCase
```

### 🔧 Methods

```java
// ✅ Tốt
public ProductDTO getProductById(Long id) { }
public void createProduct(ProductDTO productDTO) { }
public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) { }

// ❌ Không tốt
public ProductDTO laySanPham(Long id) { }  // Không dùng tiếng Việt
public void CreateProduct(ProductDTO dto) { }  // Không đúng camelCase
```

### 📝 Variables

```java
// ✅ Tốt
Product product = productRepository.findById(id).orElseThrow();
List<ProductVariant> variants = product.getVariants();
BigDecimal totalPrice = calculateTotalPrice(variants);

// ❌ Không tốt
Product sanPham = ...;  // Không dùng tiếng Việt
List<ProductVariant> danhSachVariants = ...;  // Không dùng tiếng Việt
```

### 🔒 Constants

```java
// ✅ Tốt
public static final int MAX_LOGIN_ATTEMPTS = 5;
public static final String DEFAULT_CURRENCY = "VND";
public static final long JWT_EXPIRATION_MS = 3600000L;

// ❌ Không tốt
public static final int soLanDangNhapToiDa = 5;  // Không dùng tiếng Việt
public static final String DEFAULT_CURRENCY = "VND";  // OK
```

### 🗂️ Packages

```java
// ✅ Tốt
com.orchard.orchard_store_backend.modules.catalog.product
com.orchard.orchard_store_backend.modules.auth
com.orchard.orchard_store_backend.security

// ❌ Không tốt
com.orchard.orchard_store_backend.modules.sanPham  // Không dùng tiếng Việt
```

---

## 📚 Documentation File Naming

### 🎯 Nguyên Tắc Đặt Tên File .md

#### 1. **UPPER_SNAKE_CASE cho Technical Documentation**

```
✅ CODING_STANDARDS.md                 # Coding standards (đọc đầu tiên)
✅ DOCUMENTATION.md                    # Technical documentation chính
✅ DATABASE_SCHEMA_ENHANCED.md         # Database schema chi tiết
✅ BACKEND_IMPLEMENTATION_STATUS.md    # Status của backend implementation
```

**Lý do:**

- Dễ phân biệt với code files
- Dễ tìm kiếm trong IDE
- Phù hợp với tài liệu kỹ thuật quan trọng
- Thứ tự alphabet giúp dễ tìm kiếm

#### 2. **UPPER_SNAKE_CASE cho Planning Documents**

```
✅ ROADMAP_ENHANCED.md                 # Lộ trình phát triển
✅ ADMIN_PANEL_DEVELOPMENT_PLAN.md     # Kế hoạch phát triển Admin Panel
```

**Thứ tự đề xuất:**

- Planning documents nên đặt sau technical documentation
- Sắp xếp theo mức độ tổng quát: Roadmap (tổng thể) → Specific Plans (chi tiết)

#### 3. **kebab-case cho Guides & Tutorials**

```
✅ getting-started.md                  # Hướng dẫn bắt đầu
✅ deployment-guide.md                 # Hướng dẫn deploy
✅ api-integration-guide.md            # Hướng dẫn tích hợp API
```

#### 4. **PascalCase cho Feature-Specific Docs**

```
✅ ProductManagement.md                # Tài liệu về Product Management
✅ AuthenticationFlow.md               # Tài liệu về Authentication Flow
```

### 📁 Cấu Trúc Thư Mục Documentation (Đề Xuất)

```
docs/
│
├── 📝 Standards & Conventions
│   └── CODING_STANDARDS.md             # ⭐ ĐỌC TRƯỚC - Coding standards
│
├── 📚 Technical Documentation
│   ├── DOCUMENTATION.md                # Technical docs chính
│   ├── DATABASE_SCHEMA_ENHANCED.md     # Database schema
│   └── BACKEND_IMPLEMENTATION_STATUS.md # Backend status
│
├── 📋 Planning & Roadmap
│   ├── ROADMAP_ENHANCED.md             # Lộ trình phát triển tổng thể
│   └── ADMIN_PANEL_DEVELOPMENT_PLAN.md # Kế hoạch Admin Panel
│
├── guides/                             # Hướng dẫn chi tiết (tương lai)
│   ├── getting-started.md
│   ├── deployment-guide.md
│   └── api-integration-guide.md
│
└── features/                           # Tài liệu tính năng (tương lai)
    ├── ProductManagement.md
    ├── AuthenticationFlow.md
    └── OrderProcessing.md
```

**Thứ tự đọc đề xuất:**

1. **CODING_STANDARDS.md** - Đọc đầu tiên để hiểu conventions
2. **DOCUMENTATION.md** - Technical documentation chính
3. **DATABASE_SCHEMA_ENHANCED.md** - Database reference
4. **BACKEND_IMPLEMENTATION_STATUS.md** - Implementation status
5. **ROADMAP_ENHANCED.md** - Planning tổng thể
6. **ADMIN_PANEL_DEVELOPMENT_PLAN.md** - Planning chi tiết

### ✅ Ví Dụ Tốt

```
✅ DOCUMENTATION.md
✅ BACKEND_IMPLEMENTATION_STATUS.md
✅ DATABASE_SCHEMA_ENHANCED.md
✅ CODING_STANDARDS.md
✅ getting-started.md
✅ deployment-guide.md
```

### ❌ Ví Dụ Không Tốt

```
❌ documentation.md                    # Nên dùng UPPER_SNAKE_CASE
❌ backend-implementation-status.md    # Nên dùng UPPER_SNAKE_CASE
❌ Database_Schema.md                  # Không nhất quán (PascalCase + underscore)
❌ coding-standards.md                 # Nên dùng UPPER_SNAKE_CASE cho technical docs
```

---

## 💬 Code Comment Guidelines

### 📋 Checklist Comment

Khi viết comment, đảm bảo:

- [ ] ✅ Comment bằng **TIẾNG VIỆT**
- [ ] ✅ Giải thích **TẠI SAO** (why), không chỉ **CÁI GÌ** (what)
- [ ] ✅ Ngắn gọn nhưng đầy đủ thông tin
- [ ] ✅ Cập nhật comment khi code thay đổi
- [ ] ✅ Sử dụng Javadoc cho public APIs
- [ ] ✅ Thêm TODO/FIXME cho code chưa hoàn thiện

### 🎯 Khi Nào Cần Comment?

#### ✅ **CẦN Comment:**

1. **Complex Logic**

```java
// Tính toán giá cuối cùng sau khi áp dụng tất cả discounts
// Ưu tiên: VIP discount > Promotion discount > Member pricing
BigDecimal finalPrice = calculateFinalPrice(variant, customer, promotion);
```

2. **Business Rules**

```java
// Chỉ cho phép đặt hàng nếu:
// 1. Product status = ACTIVE
// 2. Variant có stock > 0
// 3. Customer không bị block
if (!canPlaceOrder(product, variant, customer)) {
    throw new BusinessException("Không thể đặt hàng");
}
```

3. **Workarounds & Hacks**

```java
// FIXME: Temporary workaround cho bug trong Hibernate 6.3
// Issue: https://github.com/hibernate/hibernate-orm/issues/xxxx
// TODO: Remove khi upgrade lên Hibernate 6.4
```

4. **Performance Optimizations**

```java
// Sử dụng Entity Graph để tránh N+1 problem
// Thay vì 1 + N queries, chỉ cần 1 query với JOIN FETCH
@EntityGraph(attributePaths = {"variants", "images"})
Optional<Product> findByIdWithDetails(Long id);
```

#### ❌ **KHÔNG CẦN Comment:**

1. **Self-Explanatory Code**

```java
// ❌ Không cần comment này
// Get product by id
Product product = productRepository.findById(id).orElseThrow();

// ✅ Code đã tự giải thích
Product product = productRepository.findById(id)
    .orElseThrow(() -> new ProductNotFoundException(id));
```

2. **Simple Getters/Setters**

```java
// ❌ Không cần comment
// Get product name
public String getName() {
    return name;
}

// ✅ Đã rõ ràng từ tên method
public String getName() {
    return name;
}
```

---

## ✅ Best Practices

### 1. **Consistency**

- ✅ Luôn sử dụng cùng một style comment trong toàn bộ project
- ✅ Follow naming conventions một cách nhất quán
- ✅ Cập nhật documentation khi code thay đổi

### 2. **Clarity**

- ✅ Comment phải rõ ràng, dễ hiểu
- ✅ Tránh comment quá dài hoặc quá ngắn
- ✅ Sử dụng tiếng Việt chuẩn, không dùng từ lóng

### 3. **Maintenance**

- ✅ Xóa comment cũ khi code đã được refactor
- ✅ Cập nhật comment khi logic thay đổi
- ✅ Review comment trong code review

### 4. **Documentation**

- ✅ Cập nhật DOCUMENTATION.md khi thêm tính năng mới
- ✅ Cập nhật BACKEND_IMPLEMENTATION_STATUS.md khi implement entity mới
- ✅ Thêm examples và usage trong documentation

---

## 📖 Tài Liệu Tham Khảo

**📚 Technical Documentation:**

- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Technical documentation chi tiết
- **[DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**: Database schema
- **[BACKEND_IMPLEMENTATION_STATUS.md](./BACKEND_IMPLEMENTATION_STATUS.md)**: Implementation status

**📋 Planning:**

- **[ROADMAP_ENHANCED.md](./ROADMAP_ENHANCED.md)**: Lộ trình phát triển
- **[ADMIN_PANEL_DEVELOPMENT_PLAN.md](./ADMIN_PANEL_DEVELOPMENT_PLAN.md)**: Kế hoạch Admin Panel

---

## 🔄 Cập Nhật

**Last Updated**: 2024-12-20

Nếu có thay đổi về coding standards, vui lòng cập nhật file này và thông báo cho team.

---

**Lưu ý:** File này là **living document** - sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới.
