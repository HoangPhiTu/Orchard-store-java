# Brand Management - Documentation

**Module:** Brand Management (Quản lý Thương hiệu)  
**Version:** 1.0  
**Last Updated:** 2025-12-03

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Documentation](#api-documentation)
6. [Tính Năng Đặc Biệt](#tính-năng-đặc-biệt)
7. [Caching Strategy](#caching-strategy)
8. [Code Examples](#code-examples)
9. [Testing Guide](#testing-guide)

---

## 📊 Tổng Quan

Module **Brand Management** cung cấp đầy đủ các chức năng quản lý thương hiệu trong hệ thống admin, bao gồm:

- ✅ Xem danh sách brands với tìm kiếm, lọc và phân trang
- ✅ Xem chi tiết brand
- ✅ Tạo brand mới
- ✅ Cập nhật thông tin brand
- ✅ Xóa brand
- ✅ Upload logo brand
- ✅ Quản lý display order

### Tech Stack

**Backend:**

- Spring Boot 3.x
- Spring Data JPA
- Redis Cache (CacheService)
- Spring Security
- MapStruct (DTO Mapping)
- Flyway (Database Migration)

**Frontend:**

- Next.js 14 (App Router)
- React Query (TanStack Query)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod

---

## 🗄️ Database Schema

### Bảng `brands`

```sql
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    country VARCHAR(100),
    website_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_display_order ON brands(display_order);
```

### Mô Tả Các Trường

| Trường          | Kiểu         | Mô Tả                         | Ví Dụ                            |
| --------------- | ------------ | ----------------------------- | -------------------------------- |
| `id`            | BIGSERIAL    | Primary key tự động tăng      | `1`                              |
| `name`          | VARCHAR(255) | Tên thương hiệu               | `"Chanel"`                       |
| `slug`          | VARCHAR(255) | Mã định danh URL (unique)     | `"chanel"`                       |
| `description`   | TEXT         | Mô tả chi tiết về thương hiệu | `"Thương hiệu nước hoa cao cấp"` |
| `logo_url`      | VARCHAR(500) | URL logo thương hiệu          | `"https://..."`                  |
| `country`       | VARCHAR(100) | Quốc gia                      | `"France"`                       |
| `website_url`   | VARCHAR(500) | Website chính thức            | `"https://www.chanel.com"`       |
| `display_order` | INTEGER      | Thứ tự hiển thị               | `0`                              |
| `status`        | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE)  | `"ACTIVE"`                       |
| `created_at`    | TIMESTAMP    | Thời gian tạo                 | `2025-12-03 10:00:00`            |
| `updated_at`    | TIMESTAMP    | Thời gian cập nhật            | `2025-12-03 10:00:00`            |

### Constraints

- **Unique Constraint:** `slug` phải unique
- **Check Constraint:** `status` chỉ được là `ACTIVE` hoặc `INACTIVE`

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.catalog.brand
├── controller/
│   └── BrandAdminController.java
├── service/
│   ├── BrandAdminService.java
│   └── BrandAdminServiceImpl.java
├── repository/
│   └── BrandRepository.java
├── entity/
│   └── Brand.java
├── dto/
│   ├── BrandDTO.java
│   ├── BrandCreateRequest.java
│   └── BrandUpdateRequest.java
└── mapper/
    └── BrandAdminMapper.java
```

### Entity: `Brand.java`

```java
@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 100)
    private String country;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        ACTIVE, INACTIVE
    }
}
```

**Đặc điểm:**

- Slug unique để SEO-friendly URLs
- Logo URL để hiển thị logo brand
- Display order để sắp xếp thứ tự hiển thị
- Status để quản lý active/inactive

### DTO: `BrandDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String country;
    private String websiteUrl;
    private Integer displayOrder;
    private CatalogStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Validation Rules:**

- `name`: Required, 2-255 ký tự
- `slug`: Required, 2-255 ký tự, chỉ chứa chữ thường, số và dấu gạch ngang
- `logoUrl`: Optional, URL hợp lệ
- `websiteUrl`: Optional, URL hợp lệ
- `displayOrder`: 0-9999

### Repository: `BrandRepository.java`

```java
@Repository
public interface BrandRepository extends JpaRepository<Brand, Long>, JpaSpecificationExecutor<Brand> {

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    Optional<Brand> findBySlug(String slug);

    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE' ORDER BY b.displayOrder ASC, b.name ASC")
    List<Brand> findAllActiveBrands();
}
```

**Đặc điểm:**

- Extends `JpaSpecificationExecutor` để hỗ trợ dynamic queries
- Custom query để lấy danh sách active brands

### Service: `BrandAdminServiceImpl.java`

**Các phương thức chính:**

1. **`getBrands(keyword, status, pageable)`**

   - Tìm kiếm theo keyword (name hoặc slug)
   - Lọc theo status
   - Phân trang và sắp xếp

2. **`getBrandById(Long id)`**

   - **Caching:** Sử dụng `CacheService` với Redis
   - **Cache Key:** `"brand:detail:" + id`
   - **TTL:** 10 phút

3. **`createBrand(BrandCreateRequest request)`**

   - Kiểm tra trùng name và slug
   - Tự động tạo slug nếu chưa có
   - Logo upload (nếu có)

4. **`updateBrand(Long id, BrandUpdateRequest request)`**

   - Kiểm tra tồn tại
   - Kiểm tra trùng name/slug (trừ chính nó)
   - Logo management (xóa logo cũ nếu có thay đổi)
   - Cache eviction

5. **`deleteBrand(Long id)`**

   - Kiểm tra có đang được sử dụng trong products không
   - Xóa logo file khỏi storage
   - Xóa nếu không có ràng buộc

### Controller: `BrandAdminController.java`

**Endpoints:**

- `GET /api/admin/brands` - Lấy danh sách với phân trang
- `GET /api/admin/brands/all` - Lấy tất cả (cho dropdown)
- `GET /api/admin/brands/{id}` - Lấy chi tiết theo ID
- `GET /api/admin/brands/slug/{slug}` - Lấy chi tiết theo slug
- `POST /api/admin/brands` - Tạo mới
- `PUT /api/admin/brands/{id}` - Cập nhật
- `DELETE /api/admin/brands/{id}` - Xóa

**Security:**

- Tất cả endpoints yêu cầu role `ADMIN` hoặc `MANAGER`
- Sử dụng `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`

---

## 🎨 Frontend Implementation

### Package Structure

```
orchard-store-dashboad/src
├── components/
│   └── features/
│       └── catalog/
│           ├── brand-form-sheet.tsx
│           ├── brand-row.tsx
│           └── brand-table.tsx
├── hooks/
│   └── use-brands.ts
├── services/
│   └── brand.service.ts
└── types/
    └── brand.types.ts
```

### TypeScript Types: `brand.types.ts`

```typescript
export type BrandStatus = "ACTIVE" | "INACTIVE";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  websiteUrl?: string | null;
  displayOrder?: number | null;
  status: BrandStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BrandFilter {
  keyword?: string;
  status?: BrandStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}
```

### Service: `brand.service.ts`

```typescript
export const brandService = {
  // Public API (Store Frontend)
  getAll: (params?: { activeOnly?: boolean }) => ...,
  getById: (id: number) => ...,

  // Admin API
  getBrands: (params?: BrandFilter) => ...,
  getAllBrands: (params?: { activeOnly?: boolean }) => ...,
  getBrand: (id: number) => ...,
  createBrand: (data: BrandFormData) => ...,
  updateBrand: (id: number, data: Partial<BrandFormData>) => ...,
  deleteBrand: (id: number) => ...,
};
```

### Component: `brand-form-sheet.tsx`

**Tính năng:**

- Form validation với react-hook-form và zod
- Logo upload với preview
- Auto-generate slug từ name
- Loading states và error handling
- Sticky header và footer khi scroll

**Form Fields:**

1. **Tên thương hiệu\*** (required)
2. **Slug** (auto-generated, có thể chỉnh sửa)
3. **Mô tả**
4. **Logo** (upload)
5. **Quốc gia**
6. **Website**
7. **Thứ tự hiển thị**
8. **Trạng thái** (ACTIVE/INACTIVE)

---

## 📡 API Documentation

### Base URL

```
/api/admin/brands
```

### 1. GET /api/admin/brands

Lấy danh sách brands với phân trang và tìm kiếm.

**Query Parameters:**

- `page` (int, default: 0) - Số trang
- `size` (int, default: 10) - Số lượng mỗi trang
- `sortBy` (string, default: "displayOrder") - Trường sắp xếp
- `direction` (string, default: "ASC") - Hướng sắp xếp (ASC/DESC)
- `keyword` (string, optional) - Từ khóa tìm kiếm (name hoặc slug)
- `status` (string, optional) - Lọc theo status (ACTIVE/INACTIVE)

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách brands thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Chanel",
        "slug": "chanel",
        "logoUrl": "https://...",
        "country": "France",
        "displayOrder": 0,
        "status": "ACTIVE"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

### 2. GET /api/admin/brands/all

Lấy tất cả brands (không phân trang - dành cho dropdown).

**Query Parameters:**

- `activeOnly` (boolean, default: false) - Chỉ lấy ACTIVE

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách brands thành công",
  "data": [
    {
      "id": 1,
      "name": "Chanel",
      "slug": "chanel",
      "status": "ACTIVE"
    }
  ]
}
```

### 3. GET /api/admin/brands/{id}

Lấy chi tiết brand theo ID.

**Response:**

```json
{
  "success": true,
  "message": "Lấy thông tin brand thành công",
  "data": {
    "id": 1,
    "name": "Chanel",
    "slug": "chanel",
    "description": "Thương hiệu nước hoa cao cấp",
    "logoUrl": "https://...",
    "country": "France",
    "websiteUrl": "https://www.chanel.com",
    "displayOrder": 0,
    "status": "ACTIVE",
    "createdAt": "2025-12-03T10:00:00",
    "updatedAt": "2025-12-03T10:00:00"
  }
}
```

### 4. POST /api/admin/brands

Tạo brand mới.

**Request Body:**

```json
{
  "name": "Chanel",
  "slug": "chanel",
  "description": "Thương hiệu nước hoa cao cấp",
  "logoUrl": "https://...",
  "country": "France",
  "websiteUrl": "https://www.chanel.com",
  "displayOrder": 0,
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo brand thành công",
  "data": {
    "id": 1,
    "name": "Chanel",
    ...
  }
}
```

**Status Codes:**

- `201 Created` - Tạo thành công
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 5. PUT /api/admin/brands/{id}

Cập nhật brand.

**Request Body:** Tương tự như POST (tất cả fields optional)

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật brand thành công",
  "data": { ... }
}
```

**Status Codes:**

- `200 OK` - Cập nhật thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 6. DELETE /api/admin/brands/{id}

Xóa brand.

**Response:**

```json
{
  "success": true,
  "message": "Xóa brand thành công",
  "data": null
}
```

**Status Codes:**

- `200 OK` - Xóa thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Đang được sử dụng trong products

---

## ⚡ Tính Năng Đặc Biệt

### 1. Logo Upload

**Backend:**

- Hỗ trợ upload logo qua MinIO hoặc local storage
- Xóa logo cũ khi cập nhật hoặc xóa brand
- Validate file type và size

**Frontend:**

- Image preview trước khi upload
- Drag & drop upload
- Progress indicator
- Error handling

### 2. Auto-Generate Slug

**Backend:**

- Tự động tạo slug từ name nếu chưa có
- Sử dụng thư viện `Slugify` hoặc custom logic

**Frontend:**

- Real-time auto-fill khi nhập tên
- Chỉ auto-fill nếu field đang rỗng hoặc chưa được chỉnh sửa thủ công

### 3. Sticky Header và Footer

Form có header và footer cố định khi scroll:

- Header: Title và Description
- Body: Form fields (scroll được)
- Footer: Buttons (Hủy, Tạo mới/Cập nhật)

---

## 💾 Caching Strategy

### Backend Caching

#### Cache Configuration

- **Cache Provider:** Redis (CacheService)
- **Cache Key:** `"brand:detail:" + id`
- **TTL:** 10 phút (CACHE_TTL_SECONDS)

#### Cached Methods

1. **`getBrandById(Long id)`**

   ```java
   String cacheKey = BRAND_DETAIL_CACHE_KEY_PREFIX + id;
   Optional<BrandDTO> cached = cacheService.getCached(cacheKey, BrandDTO.class);
   if (cached.isPresent()) {
       return cached.get();
   }
   // ... fetch from database
   cacheService.cache(cacheKey, result, CACHE_TTL_SECONDS);
   ```

2. **Cache Eviction**

   - **`updateBrand()`**: `evictBrandDetailCache(id)` và `evictBrandListCache()`
   - **`deleteBrand()`**: `evictBrandDetailCache(id)` và `evictBrandListCache()`

#### Cache Hit Rate

- **Expected:** ~80-90% cho brand detail queries
- **Performance:** Giảm database load đáng kể

### Frontend Caching

#### React Query Configuration

**List Query (`useBrands`):**

- `staleTime`: 10 phút
- `gcTime`: 30 phút
- `refetchOnMount`: false
- `refetchOnWindowFocus`: false

**Detail Query (`useBrand`):**

- `staleTime`: 10 phút
- `gcTime`: 30 phút
- `refetchOnMount`: false
- `refetchOnWindowFocus`: false

#### Cache Invalidation

Tự động invalidate khi:

- Create brand → Invalidate list queries
- Update brand → Invalidate detail query và list queries
- Delete brand → Invalidate list queries

---

## 💻 Code Examples

### Backend: Get Brand with Caching

```java
@Override
@Transactional(readOnly = true)
public BrandDTO getBrandById(Long id) {
    String cacheKey = BRAND_DETAIL_CACHE_KEY_PREFIX + id;

    Optional<BrandDTO> cached = cacheService.getCached(cacheKey, BrandDTO.class);
    if (cached.isPresent()) {
        log.debug("Brand detail cache hit for ID: {}", id);
        return cached.get();
    }

    Brand brand = brandRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Brand", id));

    BrandDTO result = brandAdminMapper.toDTO(brand);
    cacheService.cache(cacheKey, result, CACHE_TTL_SECONDS);

    return result;
}
```

### Frontend: Use Brand Hook

```typescript
function BrandList() {
  const { data, isLoading, error } = useBrands({
    page: 0,
    size: 10,
    keyword: "chanel",
    status: "ACTIVE",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.content.map((brand) => (
        <div key={brand.id}>
          <img src={brand.logoUrl} alt={brand.name} />
          <h2>{brand.name}</h2>
        </div>
      ))}
    </div>
  );
}
```

### Frontend: Create Brand Mutation

```typescript
function CreateBrandForm() {
  const { createMutation } = useBrands();

  const handleSubmit = (data: BrandFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        console.log("Tạo thành công!");
      },
      onError: (error) => {
        console.error("Lỗi:", error);
      },
    });
  };

  return (
    <BrandFormSheet
      open={true}
      onOpenChange={(open) => console.log(open)}
      onSubmit={handleSubmit}
    />
  );
}
```

---

## 🧪 Testing Guide

### Backend Testing

1. **Unit Tests:**

   - Test validation rules
   - Test business logic (trùng name/slug)
   - Test slug generation

2. **Integration Tests:**

   - Test API endpoints
   - Test database constraints
   - Test pagination và filtering
   - Test caching

### Frontend Testing

1. **Component Tests:**

   - Test form validation
   - Test logo upload
   - Test auto-generate slug

2. **E2E Tests:**

   - Test CRUD operations
   - Test search và filter
   - Test logo upload và deletion

### Test Cases

**Backend:**

- ✅ Tạo brand với name và slug hợp lệ
- ✅ Tạo brand không có slug → tự động tạo
- ✅ Tạo brand trùng name → throw exception
- ✅ Cập nhật brand → validate không trùng (trừ chính nó)
- ✅ Xóa brand đang được sử dụng → throw exception
- ✅ Logo upload và deletion

**Frontend:**

- ✅ Validate form với Zod schema
- ✅ Hiển thị error messages
- ✅ Logo upload với preview
- ✅ Auto-generate slug

---

## 📝 Notes & Best Practices

### Backend

1. **Validation:**

   - Sử dụng Jakarta Validation annotations
   - Custom validation cho business rules

2. **Error Handling:**

   - Sử dụng custom exceptions: `ResourceNotFoundException`, `ResourceAlreadyExistsException`
   - Consistent error responses

3. **Performance:**

   - Sử dụng indexes cho các trường thường query
   - Caching với CacheService
   - Pagination cho danh sách lớn

4. **Logo Management:**

   - Xóa logo cũ khi cập nhật hoặc xóa brand
   - Validate file type và size

### Frontend

1. **State Management:**

   - Sử dụng React Query cho server state
   - Local state cho form với React Hook Form

2. **UX:**

   - Real-time validation
   - Loading states
   - Error handling với user-friendly messages
   - Image preview cho logo

3. **Code Reusability:**

   - Shared components cho form fields
   - Helper functions tách riêng

---

## 🚀 Future Enhancements

1. **Soft Delete:** Thêm `deleted_at` thay vì hard delete
2. **Audit Log:** Ghi lại lịch sử thay đổi
3. **Bulk Operations:** Import/Export CSV
4. **Advanced Search:** Tìm kiếm theo nhiều tiêu chí
5. **Brand Statistics:** Thống kê số lượng sản phẩm theo brand
6. **Multi-language:** Hỗ trợ đa ngôn ngữ cho name và description

---

## 📚 References

- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-03  
**Author:** Development Team
