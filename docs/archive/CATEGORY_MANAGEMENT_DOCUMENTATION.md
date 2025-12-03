# Category Management - Documentation

**Module:** Category Management (Quản lý Danh mục Sản phẩm)  
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
7. [Tree Structure](#tree-structure)
8. [Caching Strategy](#caching-strategy)
9. [Code Examples](#code-examples)
10. [Testing Guide](#testing-guide)

---

## 📊 Tổng Quan

Module **Category Management** cung cấp đầy đủ các chức năng quản lý danh mục sản phẩm trong hệ thống admin, bao gồm:

- ✅ Xem danh sách categories với tìm kiếm, lọc và phân trang
- ✅ Xem cây danh mục (tree structure)
- ✅ Xem chi tiết category
- ✅ Tạo category mới (hỗ trợ parent category)
- ✅ Cập nhật thông tin category
- ✅ Xóa category (với validation)
- ✅ Upload image category
- ✅ Quản lý display order

### Đặc Điểm Nổi Bật

- 🌳 **Tree Structure:** Hỗ trợ danh mục đa cấp (parent-child)
- 📊 **Hierarchical Display:** Hiển thị cây danh mục với level và path
- 🔒 **Validation:** Không cho phép xóa category có children hoặc products
- 🎨 **Image Upload:** Hỗ trợ upload image cho category

### Tech Stack

**Backend:**

- Spring Boot 3.x
- Spring Data JPA
- Spring Cache (Redis)
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

### Bảng `categories`

```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_level ON categories(level);
```

### Foreign Keys

```sql
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;
```

### Mô Tả Các Trường

| Trường          | Kiểu         | Mô Tả                               | Ví Dụ                     |
| --------------- | ------------ | ----------------------------------- | ------------------------- |
| `id`            | BIGSERIAL    | Primary key tự động tăng            | `1`                       |
| `name`          | VARCHAR(255) | Tên danh mục                        | `"Nước hoa Nam"`          |
| `slug`          | VARCHAR(255) | Mã định danh URL (unique)           | `"nuoc-hoa-nam"`          |
| `description`   | TEXT         | Mô tả chi tiết về danh mục          | `"Danh mục nước hoa nam"` |
| `parent_id`     | BIGINT       | ID danh mục cha (NULL nếu là root)  | `1`                       |
| `image_url`     | VARCHAR(500) | URL ảnh danh mục                    | `"https://..."`           |
| `display_order` | INTEGER      | Thứ tự hiển thị                     | `0`                       |
| `level`         | INTEGER      | Cấp độ trong cây (0 = root)         | `1`                       |
| `path`          | VARCHAR(500) | Đường dẫn từ root (ví dụ: "1/5/10") | `"1/5"`                   |
| `status`        | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE)        | `"ACTIVE"`                |
| `created_at`    | TIMESTAMP    | Thời gian tạo                       | `2025-12-03 10:00:00`     |
| `updated_at`    | TIMESTAMP    | Thời gian cập nhật                  | `2025-12-03 10:00:00`     |

### Constraints

- **Unique Constraint:** `slug` phải unique
- **Check Constraint:** `status` chỉ được là `ACTIVE` hoặc `INACTIVE`
- **Foreign Key:** `parent_id` → `categories.id` (ON DELETE SET NULL)

### Tree Structure Example

```
Root (level 0)
├── Nước hoa Nam (level 1, path: "1")
│   ├── Nước hoa Nam - EDT (level 2, path: "1/5")
│   └── Nước hoa Nam - EDP (level 2, path: "1/6")
└── Nước hoa Nữ (level 1, path: "2")
    └── Nước hoa Nữ - EDT (level 2, path: "2/7")
```

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.catalog.category
├── controller/
│   └── CategoryAdminController.java
├── service/
│   ├── CategoryAdminService.java
│   └── CategoryAdminServiceImpl.java
├── repository/
│   └── CategoryRepository.java
├── entity/
│   └── Category.java
├── dto/
│   ├── CategoryDTO.java
│   ├── CategoryCreateRequest.java
│   └── CategoryUpdateRequest.java
└── mapper/
    └── CategoryAdminMapper.java
```

### Entity: `Category.java`

```java
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, unique = true, length = 255)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    // Hierarchy fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;
    
    @Column(name = "parent_id", insertable = false, updatable = false)
    private Long parentId;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Category> children = new ArrayList<>();
    
    @Column(nullable = false)
    @Builder.Default
    private Integer level = 0;
    
    @Column(length = 500)
    private String path; // e.g., "1/5/10" for easy querying

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

- **Self-referencing:** `parent` và `children` để tạo tree structure
- **Level:** Tự động tính dựa trên parent
- **Path:** Đường dẫn từ root để query nhanh (ví dụ: "1/5/10")
- **Lazy Loading:** `parent` và `children` được load lazy để tránh N+1 query

### DTO: `CategoryDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private Integer level;
    private String path;
    private CategoryStatus status;
    private Long parentId;
    private CategoryDTO parent;
    private List<CategoryDTO> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Validation Rules:**

- `name`: Required, 2-255 ký tự
- `slug`: Required, 2-255 ký tự, chỉ chứa chữ thường, số và dấu gạch ngang
- `parentId`: Optional, phải tồn tại nếu có
- `displayOrder`: 0-9999

### Repository: `CategoryRepository.java`

```java
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parent WHERE c.id = :id")
    Optional<Category> findByIdWithParent(@Param("id") Long id);

    List<Category> findByParentIdIsNull();

    long countByParentId(Long parentId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    long countProductsByCategoryId(@Param("categoryId") Long categoryId);
}
```

**Đặc điểm:**

- `findByIdWithParent`: Load parent cùng lúc, tránh N+1 query
- `findByParentIdIsNull`: Lấy root categories
- `countByParentId`: Đếm số children để validation
- `countProductsByCategoryId`: Đếm số products để validation

### Service: `CategoryAdminServiceImpl.java`

**Các phương thức chính:**

1. **`getCategories(keyword, status, pageable)`**

   - Tìm kiếm theo keyword (name hoặc slug)
   - Lọc theo status
   - Phân trang và sắp xếp (mặc định: level ASC, displayOrder ASC, name ASC)

2. **`getCategoryById(Long id)`**

   - **Caching:** `@Cacheable(value = "categories", key = "#id")`
   - **Optimization:** Sử dụng `findByIdWithParent()` để load parent
   - **Return:** `CategoryDTO` với đầy đủ thông tin category và parent

3. **`getCategoriesTree()`**

   - **Return:** List root categories với children (tree structure)
   - **Caching:** Cache trong Redis với key `"category:tree"`
   - **TTL:** 10 phút

4. **`createCategory(CategoryCreateRequest request)`**

   - Kiểm tra trùng name và slug
   - Tự động tạo slug nếu chưa có
   - **Parent Category:** Hỗ trợ tạo category con (parentId)
   - **Level Calculation:** Tự động tính level dựa trên parent
   - **Path Generation:** Tự động tạo path từ parent path
   - Cache eviction

5. **`updateCategory(Long id, CategoryUpdateRequest request)`**

   - Kiểm tra tồn tại
   - Kiểm tra trùng name/slug (trừ chính nó)
   - **Parent Update:** Có thể thay đổi parent category
   - **Level Recalculation:** Tự động tính lại level và path khi đổi parent
   - **Image Management:** Xóa image cũ nếu có thay đổi
   - Cache eviction

6. **`deleteCategory(Long id)`**

   - **Validation:**
     - Không cho phép xóa nếu có children: `countByParentId(id) > 0`
     - Không cho phép xóa nếu có products: `countProductsByCategoryId(id) > 0`
   - **Image Cleanup:** Xóa image file khỏi storage
   - Cache eviction

### Controller: `CategoryAdminController.java`

**Endpoints:**

- `GET /api/admin/categories` - Lấy danh sách với phân trang
- `GET /api/admin/categories/tree` - Lấy cây danh mục (tree structure)
- `GET /api/admin/categories/all` - Lấy tất cả (cho dropdown)
- `GET /api/admin/categories/{id}` - Lấy chi tiết theo ID
- `GET /api/admin/categories/slug/{slug}` - Lấy chi tiết theo slug
- `POST /api/admin/categories` - Tạo mới
- `PUT /api/admin/categories/{id}` - Cập nhật
- `DELETE /api/admin/categories/{id}` - Xóa

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
│           ├── category-form-sheet.tsx
│           ├── category-row.tsx
│           ├── category-table.tsx
│           └── category-tree.tsx
├── hooks/
│   └── use-categories.ts
├── services/
│   └── category.service.ts
└── types/
    └── category.types.ts
```

### TypeScript Types: `category.types.ts`

```typescript
export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder?: number | null;
  level?: number | null;
  path?: string | null;
  status: CategoryStatus;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CategoryFilter {
  keyword?: string;
  status?: CategoryStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}
```

### Service: `category.service.ts`

```typescript
export const categoryService = {
  // Public API (Store Frontend)
  getAll: (params?: { activeOnly?: boolean }) => ...,
  getById: (id: number) => ...,
  getTree: () => ...,

  // Admin API
  getCategories: (params?: CategoryFilter) => ...,
  getCategoriesTree: () => ...,
  getAllCategories: (params?: { activeOnly?: boolean }) => ...,
  getCategory: (id: number) => ...,
  createCategory: (data: CategoryFormData) => ...,
  updateCategory: (id: number, data: Partial<CategoryFormData>) => ...,
  deleteCategory: (id: number) => ...,
};
```

### Component: `category-form-sheet.tsx`

**Tính năng:**

- Form validation với react-hook-form và zod
- Image upload với preview
- Auto-generate slug từ name
- Parent category selection (dropdown với tree structure)
- Loading states và error handling
- Sticky header và footer khi scroll

**Form Fields:**

1. **Tên danh mục\*** (required)
2. **Slug** (auto-generated, có thể chỉnh sửa)
3. **Mô tả**
4. **Danh mục cha** (dropdown với tree)
5. **Ảnh** (upload)
6. **Thứ tự hiển thị**
7. **Trạng thái** (ACTIVE/INACTIVE)

### Component: `category-tree.tsx`

**Tính năng:**

- Hiển thị cây danh mục với nested structure
- Expand/Collapse nodes
- Indentation theo level
- Drag & drop để sắp xếp (optional)
- Search và filter

---

## 📡 API Documentation

### Base URL

```
/api/admin/categories
```

### 1. GET /api/admin/categories

Lấy danh sách categories với phân trang và tìm kiếm.

**Query Parameters:**

- `page` (int, default: 0) - Số trang
- `size` (int, default: 10) - Số lượng mỗi trang
- `sortBy` (string, default: "level") - Trường sắp xếp
- `direction` (string, default: "ASC") - Hướng sắp xếp (ASC/DESC)
- `keyword` (string, optional) - Từ khóa tìm kiếm (name hoặc slug)
- `status` (string, optional) - Lọc theo status (ACTIVE/INACTIVE)

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách categories thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Nước hoa Nam",
        "slug": "nuoc-hoa-nam",
        "level": 1,
        "path": "1",
        "parentId": null,
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

### 2. GET /api/admin/categories/tree

Lấy cây danh mục (tree structure).

**Response:**

```json
{
  "success": true,
  "message": "Lấy cây danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Nước hoa Nam",
      "slug": "nuoc-hoa-nam",
      "level": 1,
      "path": "1",
      "children": [
        {
          "id": 5,
          "name": "Nước hoa Nam - EDT",
          "slug": "nuoc-hoa-nam-edt",
          "level": 2,
          "path": "1/5",
          "parentId": 1,
          "children": []
        }
      ]
    }
  ]
}
```

### 3. GET /api/admin/categories/{id}

Lấy chi tiết category theo ID.

**Response:**

```json
{
  "success": true,
  "message": "Lấy thông tin category thành công",
  "data": {
    "id": 5,
    "name": "Nước hoa Nam - EDT",
    "slug": "nuoc-hoa-nam-edt",
    "description": "Danh mục nước hoa nam EDT",
    "imageUrl": "https://...",
    "level": 2,
    "path": "1/5",
    "parentId": 1,
    "parent": {
      "id": 1,
      "name": "Nước hoa Nam",
      "slug": "nuoc-hoa-nam"
    },
    "displayOrder": 0,
    "status": "ACTIVE",
    "createdAt": "2025-12-03T10:00:00",
    "updatedAt": "2025-12-03T10:00:00"
  }
}
```

### 4. POST /api/admin/categories

Tạo category mới.

**Request Body:**

```json
{
  "name": "Nước hoa Nam - EDT",
  "slug": "nuoc-hoa-nam-edt",
  "description": "Danh mục nước hoa nam EDT",
  "parentId": 1,
  "imageUrl": "https://...",
  "displayOrder": 0,
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo category thành công",
  "data": {
    "id": 5,
    "name": "Nước hoa Nam - EDT",
    "level": 2,
    "path": "1/5",
    "parentId": 1,
    ...
  }
}
```

**Status Codes:**

- `201 Created` - Tạo thành công
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 5. PUT /api/admin/categories/{id}

Cập nhật category.

**Request Body:** Tương tự như POST (tất cả fields optional)

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật category thành công",
  "data": { ... }
}
```

**Status Codes:**

- `200 OK` - Cập nhật thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 6. DELETE /api/admin/categories/{id}

Xóa category.

**Response:**

```json
{
  "success": true,
  "message": "Xóa category thành công",
  "data": null
}
```

**Status Codes:**

- `200 OK` - Xóa thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Không thể xóa (có children hoặc products)

---

## ⚡ Tính Năng Đặc Biệt

### 1. Tree Structure

**Backend:**

- Self-referencing với `parent` và `children`
- Level tự động tính dựa trên parent
- Path để query nhanh (ví dụ: "1/5/10")
- Validation: Không cho phép xóa nếu có children

**Frontend:**

- Component `CategoryTree` để hiển thị cây
- Expand/Collapse nodes
- Indentation theo level
- Parent selection trong form

### 2. Level và Path Calculation

**Level Calculation:**

   ```java
if (parentId == null) {
    level = 0; // Root category
} else {
    Category parent = categoryRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", parentId));
    level = parent.getLevel() + 1;
}
```

**Path Generation:**

```java
if (parentId == null) {
    path = String.valueOf(id); // Root category
} else {
    Category parent = categoryRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", parentId));
    path = parent.getPath() + "/" + id;
}
```

### 3. Image Upload

**Backend:**

- Hỗ trợ upload image qua MinIO hoặc local storage
- Xóa image cũ khi cập nhật hoặc xóa category
- Validate file type và size

**Frontend:**

- Image preview trước khi upload
- Drag & drop upload
- Progress indicator
- Error handling

### 4. Validation Rules

- **Không cho phép xóa nếu có children:**

  ```java
  if (categoryRepository.countByParentId(id) > 0) {
      throw new OperationNotPermittedException("Không thể xóa category có danh mục con");
  }
  ```

- **Không cho phép xóa nếu có products:**
  ```java
  if (productRepository.countByCategoryId(id) > 0) {
      throw new OperationNotPermittedException("Không thể xóa category có sản phẩm");
  }
  ```

---

## 🌳 Tree Structure

### Cấu Trúc Dữ Liệu

Tree structure được implement với:

1. **Self-referencing:** `parent` và `children` trong cùng một bảng
2. **Level:** Cấp độ trong cây (0 = root)
3. **Path:** Đường dẫn từ root (ví dụ: "1/5/10")

### Ví Dụ Tree

```
Root (level 0)
├── Nước hoa Nam (id: 1, level: 1, path: "1")
│   ├── Nước hoa Nam - EDT (id: 5, level: 2, path: "1/5")
│   └── Nước hoa Nam - EDP (id: 6, level: 2, path: "1/6")
└── Nước hoa Nữ (id: 2, level: 1, path: "2")
    └── Nước hoa Nữ - EDT (id: 7, level: 2, path: "2/7")
```

### Query Tree

**Lấy root categories:**

```java
List<Category> rootCategories = categoryRepository.findByParentIdIsNull();
```

**Lấy children của một category:**

```java
List<Category> children = categoryRepository.findByParentId(parentId);
```

**Query bằng path:**

```sql
SELECT * FROM categories WHERE path LIKE '1/%' OR path = '1';
-- Lấy category id=1 và tất cả children
```

---

## 💾 Caching Strategy

### Backend Caching

#### Cache Configuration

- **Cache Name:** `"categories"`
- **Cache Key:** `#id` (category ID)
- **Cache Provider:** Redis (Spring Cache)

#### Cached Methods

1. **`getCategoryById(Long id)`**

   ```java
   @Cacheable(value = "categories", key = "#id", unless = "#result == null")
   ```

2. **`getCategoriesTree()`**

   - Cache key: `"category:tree"`
   - TTL: 10 phút

3. **Cache Eviction**

   - **`updateCategory()`**: `@CacheEvict(value = "categories", key = "#id")` + evict tree cache
   - **`deleteCategory()`**: `@CacheEvict(value = "categories", key = "#id")` + evict tree cache
   - **`createCategory()`**: Evict tree cache

#### Cache Hit Rate

- **Expected:** ~80-90% cho category detail và tree queries
- **Performance:** Giảm database load đáng kể

### Frontend Caching

#### React Query Configuration

**List Query (`useCategories`):**

- `staleTime`: 10 phút
- `gcTime`: 30 phút
- `refetchOnMount`: false
- `refetchOnWindowFocus`: false

**Tree Query (`useCategoriesTree`):**

- `staleTime`: 10 phút
- `gcTime`: 30 phút

**Detail Query (`useCategory`):**

- `staleTime`: 10 phút
- `gcTime`: 30 phút

---

## 💻 Code Examples

### Backend: Create Category with Parent

```java
CategoryCreateRequest request = CategoryCreateRequest.builder()
    .name("Nước hoa Nam - EDT")
    .slug("nuoc-hoa-nam-edt")
    .parentId(1L)
    .build();

CategoryDTO created = categoryService.createCategory(request);
// Level và path sẽ được tự động tính
```

### Backend: Get Tree

```java
List<CategoryDTO> tree = categoryService.getCategoriesTree();
// Trả về root categories với children nested
```

### Frontend: Display Tree

```typescript
function CategoryTreeView() {
  const { data: tree, isLoading } = useCategoriesTree();

  if (isLoading) return <Loading />;

  return (
    <div>
      {tree?.map((category) => (
        <CategoryTreeNode key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryTreeNode({ category }: { category: Category }) {
  return (
    <div style={{ marginLeft: `${category.level * 20}px` }}>
      <span>{category.name}</span>
      {category.children &&
        category.children.map((child) => (
            <CategoryTreeNode key={child.id} category={child} />
          ))}
    </div>
  );
}
```

---

## 🧪 Testing Guide

### Backend Testing

1. **Unit Tests:**

   - Test validation rules
   - Test business logic (trùng name/slug)
   - Test level và path calculation
   - Test tree structure

2. **Integration Tests:**

   - Test API endpoints
   - Test database constraints
   - Test pagination và filtering
   - Test tree queries
   - Test validation (không xóa nếu có children/products)

### Frontend Testing

1. **Component Tests:**

   - Test form validation
   - Test image upload
   - Test tree display
   - Test parent selection

2. **E2E Tests:**

   - Test CRUD operations
   - Test search và filter
   - Test tree structure
   - Test validation (không xóa nếu có children/products)

### Test Cases

**Backend:**

- ✅ Tạo root category → level = 0, path = id
- ✅ Tạo child category → level = parent.level + 1, path = parent.path + "/" + id
- ✅ Cập nhật parent → recalculate level và path
- ✅ Xóa category có children → throw exception
- ✅ Xóa category có products → throw exception

**Frontend:**

- ✅ Hiển thị tree structure
- ✅ Expand/Collapse nodes
- ✅ Parent selection trong form
- ✅ Validate không xóa nếu có children/products

---

## 📝 Notes & Best Practices

### Backend

1. **Tree Structure:**

   - Sử dụng self-referencing để tạo tree
   - Level và path để query nhanh
   - Validation để đảm bảo data integrity

2. **Performance:**

   - Sử dụng EntityGraph để tránh N+1 query
   - Caching với Spring Cache
   - Indexes cho parent_id và level

3. **Validation:**

   - Không cho phép xóa nếu có children hoặc products
   - Validate parent tồn tại khi tạo/update

### Frontend

1. **Tree Display:**

   - Recursive component để render tree
   - Indentation theo level
   - Expand/Collapse state management

2. **State Management:**

   - Sử dụng React Query cho server state
   - Local state cho form với React Hook Form

3. **UX:**

   - Real-time validation
   - Loading states
   - Error handling với user-friendly messages

---

## 🚀 Future Enhancements

1. **Soft Delete:** Thêm `deleted_at` thay vì hard delete
2. **Audit Log:** Ghi lại lịch sử thay đổi
3. **Bulk Operations:** Import/Export CSV
4. **Advanced Search:** Tìm kiếm theo nhiều tiêu chí
5. **Drag & Drop:** Sắp xếp lại thứ tự categories
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
