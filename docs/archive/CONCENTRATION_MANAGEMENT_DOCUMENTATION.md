# Concentration Management - Documentation

**Module:** Concentration Management (Quản lý Nồng độ Nước hoa)  
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
7. [Migration & Database](#migration--database)
8. [Code Examples](#code-examples)
9. [Testing Guide](#testing-guide)

---

## 📊 Tổng Quan

Module **Concentration Management** cung cấp đầy đủ các chức năng quản lý nồng độ nước hoa trong hệ thống admin, bao gồm:

- ✅ Xem danh sách nồng độ với tìm kiếm, lọc và phân trang
- ✅ Xem chi tiết nồng độ
- ✅ Tạo nồng độ mới
- ✅ Cập nhật thông tin nồng độ
- ✅ Xóa nồng độ
- ✅ Tự động tạo Slug và Acronym từ tên
- ✅ Hiển thị tên với format đẹp: `Eau de Toilette (EDT)`
- ✅ Quản lý thông tin kỹ thuật (tỷ lệ tinh dầu, độ lưu hương)

### Tech Stack

**Backend:**

- Spring Boot 3.x
- Spring Data JPA
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

### Bảng `concentrations`

```sql
CREATE TABLE concentrations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    acronym VARCHAR(20),
    min_oil_percentage INTEGER CHECK (min_oil_percentage IS NULL OR (min_oil_percentage >= 0 AND min_oil_percentage <= 100)),
    max_oil_percentage INTEGER CHECK (max_oil_percentage IS NULL OR (max_oil_percentage >= 0 AND max_oil_percentage <= 100)),
    longevity VARCHAR(100),
    intensity_level INTEGER DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 10),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        min_oil_percentage IS NULL
        OR max_oil_percentage IS NULL
        OR min_oil_percentage <= max_oil_percentage
    )
);
```

### Indexes

```sql
CREATE INDEX idx_concentrations_slug ON concentrations(slug);
CREATE INDEX idx_concentrations_status ON concentrations(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_concentrations_intensity ON concentrations(intensity_level);
CREATE INDEX idx_concentrations_display_order ON concentrations(display_order);
CREATE INDEX idx_concentrations_acronym ON concentrations(acronym) WHERE acronym IS NOT NULL;
```

### Mô Tả Các Trường

| Trường               | Kiểu         | Mô Tả                             | Ví Dụ                          |
| -------------------- | ------------ | --------------------------------- | ------------------------------ |
| `id`                 | BIGSERIAL    | Primary key tự động tăng          | `1`                            |
| `name`               | VARCHAR(100) | Tên đầy đủ của nồng độ            | `"Eau de Parfum"`              |
| `slug`               | VARCHAR(100) | Mã định danh URL (unique)         | `"eau-de-parfum"`              |
| `description`        | TEXT         | Mô tả chi tiết về nồng độ         | `"Nồng độ cao, lưu hương lâu"` |
| `acronym`            | VARCHAR(20)  | Tên viết tắt (EDP, EDT, EDC)      | `"EDP"`                        |
| `min_oil_percentage` | INTEGER      | Tỷ lệ tinh dầu tối thiểu (0-100%) | `15`                           |
| `max_oil_percentage` | INTEGER      | Tỷ lệ tinh dầu tối đa (0-100%)    | `20`                           |
| `longevity`          | VARCHAR(100) | Độ lưu hương ước tính             | `"6 - 8 tiếng"`                |
| `intensity_level`    | INTEGER      | Mức độ nồng độ (1-10)             | `7`                            |
| `display_order`      | INTEGER      | Thứ tự hiển thị                   | `0`                            |
| `status`             | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE)      | `"ACTIVE"`                     |
| `created_at`         | TIMESTAMP    | Thời gian tạo                     | `2025-12-03 10:00:00`          |
| `updated_at`         | TIMESTAMP    | Thời gian cập nhật                | `2025-12-03 10:00:00`          |

### Constraints

- **Unique Constraint:** `slug` phải unique
- **Check Constraint:**
  - `min_oil_percentage` và `max_oil_percentage` phải trong khoảng 0-100
  - `intensity_level` phải trong khoảng 1-10
  - `min_oil_percentage <= max_oil_percentage` (nếu cả hai đều có giá trị)
  - `status` chỉ được là `ACTIVE` hoặc `INACTIVE`

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.catalog.concentration
├── controller/
│   └── ConcentrationController.java
├── service/
│   ├── ConcentrationService.java
│   └── ConcentrationServiceImpl.java
├── repository/
│   └── ConcentrationRepository.java
├── entity/
│   └── Concentration.java
├── dto/
│   └── ConcentrationDTO.java
└── mapper/
    └── ConcentrationMapper.java
```

### Entity: `Concentration.java`

```java
@Entity
@Table(name = "concentrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Concentration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String acronym;

    @Column(name = "min_oil_percentage")
    private Integer minOilPercentage;

    @Column(name = "max_oil_percentage")
    private Integer maxOilPercentage;

    @Column(length = 100)
    private String longevity;

    @Column(name = "intensity_level")
    @Builder.Default
    private Integer intensityLevel = 1;

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

    /**
     * Virtual attribute: Display name kết hợp name và acronym
     * Format: {name} ({acronym})
     * Ví dụ: "Eau de Toilette (EDT)"
     *
     * Xử lý ngoại lệ:
     * - Nếu acronym rỗng hoặc null -> chỉ trả về name
     * - Nếu acronym giống hệt name -> chỉ trả về name (tránh "Parfum (Parfum)")
     */
    @Transient
    public String getDisplayName() {
        if (acronym == null || acronym.trim().isEmpty()) {
            return name;
        }

        // Kiểm tra nếu acronym giống hệt name (case-insensitive)
        if (acronym.trim().equalsIgnoreCase(name.trim())) {
            return name;
        }

        return name + " (" + acronym.trim() + ")";
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}
```

**Đặc điểm:**

- Sử dụng `@Transient` cho method `getDisplayName()` - không lưu vào database
- Tự động tính toán `displayName` từ `name` và `acronym`
- Xử lý edge cases: acronym rỗng hoặc giống name

### DTO: `ConcentrationDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcentrationDTO {
    private Long id;

    @NotBlank(message = "Tên nồng độ không được để trống")
    @Size(min = 2, max = 255, message = "Tên nồng độ phải từ 2 đến 255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(min = 2, max = 100, message = "Slug phải từ 2 đến 100 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String slug;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Size(max = 20, message = "Tên viết tắt không được vượt quá 20 ký tự")
    private String acronym;

    /**
     * Display name kết hợp name và acronym
     * Format: {name} ({acronym})
     * Ví dụ: "Eau de Toilette (EDT)"
     * Nếu acronym rỗng hoặc giống name -> chỉ trả về name
     */
    private String displayName;

    @Min(value = 0, message = "Tỷ lệ tinh dầu tối thiểu phải >= 0")
    @Max(value = 100, message = "Tỷ lệ tinh dầu tối thiểu phải <= 100")
    private Integer minOilPercentage;

    @Min(value = 0, message = "Tỷ lệ tinh dầu tối đa phải >= 0")
    @Max(value = 100, message = "Tỷ lệ tinh dầu tối đa phải <= 100")
    private Integer maxOilPercentage;

    @Size(max = 100, message = "Độ lưu hương không được vượt quá 100 ký tự")
    private String longevity;

    @Min(value = 1, message = "Mức độ phải >= 1")
    @Max(value = 10, message = "Mức độ phải <= 10")
    private Integer intensityLevel;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;

    @Pattern(regexp = "^(ACTIVE|INACTIVE)$",
            message = "Status phải là ACTIVE hoặc INACTIVE")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Validation Rules:**

- `name`: Required, 2-255 ký tự
- `slug`: Required, 2-100 ký tự, chỉ chứa chữ thường, số và dấu gạch ngang
- `acronym`: Optional, tối đa 20 ký tự
- `minOilPercentage`, `maxOilPercentage`: 0-100
- `intensityLevel`: 1-10
- `displayOrder`: 0-9999

### Repository: `ConcentrationRepository.java`

```java
@Repository
public interface ConcentrationRepository extends JpaRepository<Concentration, Long>, JpaSpecificationExecutor<Concentration> {

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    Optional<Concentration> findBySlug(String slug);

    @Query("SELECT c FROM Concentration c WHERE c.status = 'ACTIVE' ORDER BY c.displayOrder ASC, c.name ASC")
    List<Concentration> findAllActiveConcentrations();
}
```

**Đặc điểm:**

- Extends `JpaSpecificationExecutor` để hỗ trợ dynamic queries
- Custom query để lấy danh sách active concentrations

### Service: `ConcentrationServiceImpl.java`

**Các phương thức chính:**

1. **`getConcentrations(keyword, status, pageable)`**

   - Tìm kiếm theo keyword (name hoặc slug)
   - Lọc theo status
   - Phân trang và sắp xếp

2. **`createConcentration(concentrationDTO)`**

   - Kiểm tra trùng name và slug
   - Tự động tạo slug nếu chưa có
   - Validate business rules

3. **`updateConcentration(id, concentrationDTO)`**

   - Kiểm tra tồn tại
   - Kiểm tra trùng name/slug (trừ chính nó)
   - Cập nhật thông tin

4. **`deleteConcentration(id)`**
   - Kiểm tra có đang được sử dụng trong products không
   - Xóa nếu không có ràng buộc

### Controller: `ConcentrationController.java`

**Endpoints:**

- `GET /api/admin/concentrations` - Lấy danh sách với phân trang
- `GET /api/admin/concentrations/all` - Lấy tất cả (cho dropdown)
- `GET /api/admin/concentrations/{id}` - Lấy chi tiết theo ID
- `GET /api/admin/concentrations/slug/{slug}` - Lấy chi tiết theo slug
- `POST /api/admin/concentrations` - Tạo mới
- `PUT /api/admin/concentrations/{id}` - Cập nhật
- `DELETE /api/admin/concentrations/{id}` - Xóa

**Security:**

- Tất cả endpoints yêu cầu role `ADMIN` hoặc `MANAGER`
- Sử dụng `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`

---

## 🎨 Frontend Implementation

### Package Structure

```
orchard-store-dashboad/src
├── components/
│   ├── features/
│   │   └── catalog/
│   │       ├── concentration-form-sheet.tsx
│   │       ├── concentration-row.tsx
│   │       └── concentration-table.tsx
│   └── shared/
│       └── concentration-display.tsx
├── hooks/
│   └── use-concentrations.ts
├── services/
│   └── concentration.service.ts
├── types/
│   └── concentration.types.ts
└── lib/
    └── utils/
        └── concentration-helpers.ts
```

### TypeScript Types: `concentration.types.ts`

```typescript
export type ConcentrationStatus = "ACTIVE" | "INACTIVE";

export interface Concentration {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  acronym?: string | null; // Tên viết tắt: EDP, EDT, EDC
  displayName?: string | null; // Tên hiển thị: "Eau de Toilette (EDT)"
  minOilPercentage?: number | null; // Tỷ lệ tinh dầu tối thiểu (%)
  maxOilPercentage?: number | null; // Tỷ lệ tinh dầu tối đa (%)
  longevity?: string | null; // Độ lưu hương: "6 - 8 tiếng"
  intensityLevel?: number | null;
  displayOrder?: number | null;
  status: ConcentrationStatus;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export interface ConcentrationFilter {
  keyword?: string;
  status?: ConcentrationStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export const concentrationFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên nồng độ").min(2, "Tên nồng độ phải có ít nhất 2 ký tự").max(255, "Tên nồng độ không được vượt quá 255 ký tự"),
  slug: emptyToUndefined(slugSchema),
  description: emptyToUndefined(z.string().max(5000, "Mô tả không được vượt quá 5000 ký tự")),
  acronym: emptyToUndefined(z.string().max(20, "Tên viết tắt không được vượt quá 20 ký tự")),
  minOilPercentage: emptyToUndefined(z.preprocess(...)),
  maxOilPercentage: emptyToUndefined(z.preprocess(...)),
  longevity: emptyToUndefined(z.string().max(100, "Độ lưu hương không được vượt quá 100 ký tự")),
  intensityLevel: emptyToUndefined(...),
  displayOrder: emptyToUndefined(...),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
```

### Helper Functions: `concentration-helpers.ts`

#### `generateSlug(name: string): string`

Chuyển đổi tên thành slug chuẩn SEO:

- Chuyển thành chữ thường
- Bỏ dấu Tiếng Việt
- Thay khoảng trắng bằng dấu gạch ngang
- Loại bỏ ký tự đặc biệt

**Ví dụ:**

```typescript
generateSlug("Eau de Parfum"); // "eau-de-parfum"
generateSlug("Nước Hoa Đậm Đà"); // "nuoc-hoa-dam-da"
```

#### `generateShortName(name: string): string`

Tạo tên viết tắt từ các ký tự đầu của mỗi từ:

- Lấy chữ cái đầu của TẤT CẢ các từ (bao gồm "de", "le", "la")
- Chuyển thành in hoa

**Ví dụ:**

```typescript
generateShortName("Eau de Parfum"); // "EDP"
generateShortName("Eau Fraiche"); // "EF"
generateShortName("Eau de Toilette"); // "EDT"
```

### Service: `concentration.service.ts`

```typescript
export const concentrationService = {
  // Public API (Store Frontend)
  getAll: (params?: { activeOnly?: boolean }) => ...,
  getById: (id: number) => ...,

  // Admin API
  getConcentrations: (params?: ConcentrationFilter) => ...,
  getAllConcentrations: (params?: { activeOnly?: boolean }) => ...,
  getConcentration: (id: number) => ...,
  createConcentration: (data: ConcentrationFormData) => ...,
  updateConcentration: (id: number, data: Partial<ConcentrationFormData>) => ...,
  deleteConcentration: (id: number) => ...,
};
```

### Component: `ConcentrationDisplay.tsx`

Component hiển thị tên nồng độ với style đẹp:

```typescript
<ConcentrationDisplay
  concentration={concentration}
  variant="full" // "full" | "short" | "name-only"
/>
```

**Variants:**

- `"full"`: Hiển thị đầy đủ với style phân cấp
  - Tên đầy đủ: `font-medium`, màu đậm
  - Acronym trong ngoặc: `text-xs`, `text-muted-foreground`, `font-normal`
  - Ví dụ: **Eau de Toilette** <span style="color: gray; font-size: 0.9em">(EDT)</span>
- `"short"`: Chỉ hiển thị acronym (dùng cho Product Card nhỏ)
- `"name-only"`: Chỉ hiển thị tên

### Form Component: `concentration-form-sheet.tsx`

**Tính năng:**

- Auto-generate slug và acronym khi nhập tên
- Chỉ auto-fill nếu field đang rỗng hoặc chưa được chỉnh sửa thủ công
- Validate real-time với Zod schema
- Loading states và error handling
- Sticky header và footer khi scroll

**Form Fields:**

1. **Tên nồng độ\*** (required)
2. **Slug** (auto-generated, có thể chỉnh sửa)
3. **Mô tả**
4. **Tên viết tắt** (auto-generated, có thể chỉnh sửa)
5. **Tỷ lệ tinh dầu tối thiểu** (0-100%)
6. **Tỷ lệ tinh dầu tối đa** (0-100%)
7. **Độ lưu hương ước tính**
8. **Mức độ** (1-10)
9. **Thứ tự hiển thị**
10. **Trạng thái** (ACTIVE/INACTIVE)

---

## 📡 API Documentation

### Base URL

```
/api/admin/concentrations
```

### 1. GET /api/admin/concentrations

Lấy danh sách nồng độ với phân trang và tìm kiếm.

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
  "message": "Lấy danh sách nồng độ thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Eau de Parfum",
        "slug": "eau-de-parfum",
        "acronym": "EDP",
        "displayName": "Eau de Parfum (EDP)",
        "minOilPercentage": 15,
        "maxOilPercentage": 20,
        "longevity": "6 - 8 tiếng",
        "intensityLevel": 7,
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

### 2. GET /api/admin/concentrations/all

Lấy tất cả nồng độ (không phân trang - dành cho dropdown).

**Query Parameters:**

- `activeOnly` (boolean, default: false) - Chỉ lấy ACTIVE

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách nồng độ thành công",
  "data": [
    {
      "id": 1,
      "name": "Eau de Parfum",
      "slug": "eau-de-parfum",
      "acronym": "EDP",
      "displayName": "Eau de Parfum (EDP)",
      "status": "ACTIVE"
    }
  ]
}
```

### 3. GET /api/admin/concentrations/{id}

Lấy chi tiết nồng độ theo ID.

**Response:**

```json
{
  "success": true,
  "message": "Lấy thông tin nồng độ thành công",
  "data": {
    "id": 1,
    "name": "Eau de Parfum",
    "slug": "eau-de-parfum",
    "description": "Nồng độ cao, lưu hương lâu",
    "acronym": "EDP",
    "displayName": "Eau de Parfum (EDP)",
    "minOilPercentage": 15,
    "maxOilPercentage": 20,
    "longevity": "6 - 8 tiếng",
    "intensityLevel": 7,
    "displayOrder": 0,
    "status": "ACTIVE",
    "createdAt": "2025-12-03T10:00:00",
    "updatedAt": "2025-12-03T10:00:00"
  }
}
```

### 4. GET /api/admin/concentrations/slug/{slug}

Lấy chi tiết nồng độ theo slug.

**Response:** Tương tự như GET /{id}

### 5. POST /api/admin/concentrations

Tạo nồng độ mới.

**Request Body:**

```json
{
  "name": "Eau de Parfum",
  "slug": "eau-de-parfum",
  "description": "Nồng độ cao, lưu hương lâu",
  "acronym": "EDP",
  "minOilPercentage": 15,
  "maxOilPercentage": 20,
  "longevity": "6 - 8 tiếng",
  "intensityLevel": 7,
  "displayOrder": 0,
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo nồng độ thành công",
  "data": {
    "id": 1,
    "name": "Eau de Parfum",
    ...
  }
}
```

**Status Codes:**

- `201 Created` - Tạo thành công
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 6. PUT /api/admin/concentrations/{id}

Cập nhật nồng độ.

**Request Body:** Tương tự như POST (tất cả fields optional)

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật nồng độ thành công",
  "data": { ... }
}
```

**Status Codes:**

- `200 OK` - Cập nhật thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Validation error
- `409 Conflict` - Trùng name hoặc slug

### 7. DELETE /api/admin/concentrations/{id}

Xóa nồng độ.

**Response:**

```json
{
  "success": true,
  "message": "Xóa nồng độ thành công",
  "data": null
}
```

**Status Codes:**

- `200 OK` - Xóa thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Đang được sử dụng trong products

---

## ⚡ Tính Năng Đặc Biệt

### 1. Auto-Generate Slug và Acronym

**Backend:**

- Tự động tạo slug từ name nếu chưa có
- Sử dụng thư viện `Slugify` hoặc custom logic

**Frontend:**

- Real-time auto-fill khi nhập tên
- Chỉ auto-fill nếu field đang rỗng hoặc chưa được chỉnh sửa thủ công
- Sử dụng `useEffect` và `form.watch()` để theo dõi thay đổi

**Logic:**

```typescript
// Khi name thay đổi
useEffect(() => {
  if (!nameValue) return;

  // Chỉ auto-fill nếu chưa được chỉnh sửa thủ công
  if (!slugManuallyEdited) {
    const autoSlug = generateSlug(nameValue);
    form.setValue("slug", autoSlug);
  }

  if (!acronymManuallyEdited) {
    const autoAcronym = generateShortName(nameValue);
    form.setValue("acronym", autoAcronym);
  }
}, [nameValue, slugManuallyEdited, acronymManuallyEdited]);
```

### 2. Display Name (Virtual Attribute)

**Backend:**

- Method `getDisplayName()` trong Entity
- Được map tự động vào DTO qua MapStruct
- Format: `{name} ({acronym})`
- Xử lý edge cases: acronym rỗng hoặc giống name

**Frontend:**

- Component `ConcentrationDisplay` với 3 variants
- Style phân cấp: tên đậm, acronym nhạt và nhỏ hơn

### 3. Sticky Header và Footer

Form có header và footer cố định khi scroll:

- Header: Title và Description
- Body: Form fields (scroll được)
- Footer: Buttons (Hủy, Tạo mới/Cập nhật)

**Implementation:**

```tsx
<SheetContent className="flex flex-col">
  <div className="flex h-full flex-col">
    <form className="flex h-full flex-col overflow-y-auto">
      <SheetHeader>...</SheetHeader> {/* Sticky */}
      <SheetBody className="flex-1">...</SheetBody> {/* Scroll */}
      <SheetFooter>...</SheetFooter> {/* Sticky */}
    </form>
  </div>
</SheetContent>
```

---

## 🗃️ Migration & Database

### Migration Files

1. **V1\_\_init_schema.sql**

   - Tạo bảng `concentrations` với đầy đủ các trường
   - Tạo indexes
   - Tạo constraints

2. **V12\_\_add_concentration_enhancement_fields.sql**
   - Thêm các trường: `acronym`, `min_oil_percentage`, `max_oil_percentage`, `longevity`
   - Sử dụng `DO $$ ... END $$` để kiểm tra column tồn tại trước khi thêm (idempotent)

### Migration Script Example

```sql
-- Add acronym column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'concentrations'
        AND column_name = 'acronym'
    ) THEN
        ALTER TABLE concentrations
        ADD COLUMN acronym VARCHAR(20) NULL;

        COMMENT ON COLUMN concentrations.acronym IS 'Tên viết tắt của nồng độ (ví dụ: EDP, EDT, EDC)';
    END IF;
END $$;
```

### Database Constraints

- **Unique:** `slug` phải unique
- **Check:**
  - `min_oil_percentage` và `max_oil_percentage`: 0-100
  - `intensity_level`: 1-10
  - `min_oil_percentage <= max_oil_percentage`
  - `status`: ACTIVE hoặc INACTIVE

---

## 💻 Code Examples

### Backend: Tạo Concentration

```java
ConcentrationDTO dto = ConcentrationDTO.builder()
    .name("Eau de Parfum")
    .slug("eau-de-parfum")
    .acronym("EDP")
    .minOilPercentage(15)
    .maxOilPercentage(20)
    .longevity("6 - 8 tiếng")
    .intensityLevel(7)
    .displayOrder(0)
    .status("ACTIVE")
    .build();

ConcentrationDTO created = concentrationService.createConcentration(dto);
```

### Frontend: Sử dụng Hook

```typescript
import { useConcentrations } from "@/hooks/use-concentrations";

function ConcentrationList() {
  const { data, isLoading, error } = useConcentrations({
    page: 0,
    size: 10,
    keyword: "eau",
    status: "ACTIVE",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.content.map((concentration) => (
        <div key={concentration.id}>
          <ConcentrationDisplay concentration={concentration} variant="full" />
        </div>
      ))}
    </div>
  );
}
```

### Frontend: Tạo Concentration

```typescript
import { useConcentrations } from "@/hooks/use-concentrations";

function CreateConcentrationForm() {
  const { createMutation } = useConcentrations();

  const handleSubmit = (data: ConcentrationFormData) => {
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
    <ConcentrationFormSheet
      open={true}
      onOpenChange={(open) => console.log(open)}
      onSubmit={handleSubmit}
    />
  );
}
```

### Frontend: Hiển thị với Style

```typescript
// Trong Product Card (nhỏ)
<ConcentrationDisplay
  concentration={concentration}
  variant="short"  // Chỉ hiển thị "EDP"
/>

// Trong Product Detail (đầy đủ)
<ConcentrationDisplay
  concentration={concentration}
  variant="full"  // "Eau de Toilette (EDT)"
/>

// Chỉ tên
<ConcentrationDisplay
  concentration={concentration}
  variant="name-only"  // "Eau de Toilette"
/>
```

---

## 🧪 Testing Guide

### Backend Testing

1. **Unit Tests:**

   - Test `getDisplayName()` với các edge cases
   - Test validation rules
   - Test business logic (trùng name/slug)

2. **Integration Tests:**
   - Test API endpoints
   - Test database constraints
   - Test pagination và filtering

### Frontend Testing

1. **Component Tests:**

   - Test `ConcentrationDisplay` với các variants
   - Test form validation
   - Test auto-generate slug/acronym

2. **E2E Tests:**
   - Test CRUD operations
   - Test search và filter
   - Test sticky header/footer

### Test Cases

**Backend:**

- ✅ Tạo concentration với name và slug hợp lệ
- ✅ Tạo concentration không có slug → tự động tạo
- ✅ Tạo concentration trùng name → throw exception
- ✅ Cập nhật concentration → validate không trùng (trừ chính nó)
- ✅ Xóa concentration đang được sử dụng → throw exception
- ✅ `getDisplayName()` với acronym rỗng → chỉ trả về name
- ✅ `getDisplayName()` với acronym giống name → chỉ trả về name

**Frontend:**

- ✅ Auto-fill slug khi nhập tên
- ✅ Auto-fill acronym khi nhập tên
- ✅ Không overwrite khi user đã chỉnh sửa thủ công
- ✅ Validate form với Zod schema
- ✅ Hiển thị error messages
- ✅ Sticky header/footer khi scroll

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
   - Pagination cho danh sách lớn

### Frontend

1. **State Management:**

   - Sử dụng React Query cho server state
   - Local state cho form với React Hook Form

2. **UX:**

   - Real-time validation
   - Loading states
   - Error handling với user-friendly messages

3. **Code Reusability:**
   - Component `ConcentrationDisplay` có thể tái sử dụng
   - Helper functions tách riêng

---

## 🚀 Future Enhancements

1. **Soft Delete:** Thêm `deleted_at` thay vì hard delete
2. **Audit Log:** Ghi lại lịch sử thay đổi
3. **Bulk Operations:** Import/Export CSV
4. **Advanced Search:** Tìm kiếm theo nhiều tiêu chí
5. **Image Upload:** Thêm icon/logo cho mỗi nồng độ
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
