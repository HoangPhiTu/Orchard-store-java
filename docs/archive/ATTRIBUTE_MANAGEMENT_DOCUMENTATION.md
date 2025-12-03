# Attribute Management - Documentation

**Module:** Product Attribute Management (Quản lý Thuộc tính Sản phẩm)  
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

Module **Product Attribute Management** cung cấp đầy đủ các chức năng quản lý thuộc tính sản phẩm trong hệ thống admin, bao gồm:

- ✅ Xem danh sách thuộc tính với tìm kiếm, lọc và phân trang
- ✅ Xem chi tiết thuộc tính kèm danh sách giá trị
- ✅ Tạo thuộc tính mới với nested values
- ✅ Cập nhật thuộc tính với nested update (insert/update/delete values)
- ✅ Xóa thuộc tính (với kiểm tra ràng buộc)
- ✅ Tự động tạo attributeKey từ attributeName
- ✅ Quản lý dynamic attribute values với useFieldArray
- ✅ Color picker preview cho hexColor
- ✅ Hỗ trợ nhiều loại attribute type (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)

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
- useFieldArray (Dynamic nested forms)

---

## 🗄️ Database Schema

### Bảng `product_attributes` (attribute_types)

```sql
CREATE TABLE product_attributes (
    id BIGSERIAL PRIMARY KEY,
    attribute_key VARCHAR(100) NOT NULL UNIQUE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_name_en VARCHAR(255),
    attribute_type VARCHAR(50) NOT NULL CHECK (attribute_type IN ('SELECT', 'MULTISELECT', 'RANGE', 'BOOLEAN', 'TEXT')),
    data_type VARCHAR(50) DEFAULT 'STRING' CHECK (data_type IN ('STRING', 'NUMBER', 'DECIMAL', 'DATE', 'BOOLEAN')),
    is_filterable BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    is_variant_specific BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    icon_class VARCHAR(100),
    color_code VARCHAR(7),
    validation_rules JSONB,
    description TEXT,
    help_text TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng `attribute_values` (attribute_options)

```sql
CREATE TABLE attribute_values (
    id BIGSERIAL PRIMARY KEY,
    attribute_type_id BIGINT NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_value VARCHAR(255) NOT NULL,
    display_value_en VARCHAR(255),
    color_code VARCHAR(7),
    image_url VARCHAR(500),
    hex_color VARCHAR(7),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    search_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attribute_type_id, value)
);
```

### Indexes

```sql
CREATE INDEX idx_attributes_key ON product_attributes(attribute_key);
CREATE INDEX idx_attributes_type ON product_attributes(attribute_type);
CREATE INDEX idx_attributes_filterable ON product_attributes(is_filterable) WHERE is_filterable = true;
CREATE INDEX idx_attributes_status ON product_attributes(status);
CREATE INDEX idx_attributes_display_order ON product_attributes(display_order);

CREATE INDEX idx_attribute_values_attribute ON attribute_values(attribute_type_id);
CREATE INDEX idx_attribute_values_display_order ON attribute_values(attribute_type_id, display_order);
CREATE INDEX idx_attribute_values_search ON attribute_values USING gin(to_tsvector('english', search_keywords));
CREATE INDEX idx_attribute_values_value ON attribute_values(value);
```

### Foreign Keys

```sql
ALTER TABLE attribute_values
ADD CONSTRAINT fk_attribute_values_attribute
FOREIGN KEY (attribute_type_id) REFERENCES product_attributes(id) ON DELETE CASCADE;
```

### Mô Tả Các Trường

#### Bảng `product_attributes`

| Trường                | Kiểu         | Mô Tả                            | Ví Dụ                      |
| --------------------- | ------------ | -------------------------------- | -------------------------- |
| `id`                  | BIGSERIAL    | Primary key tự động tăng         | `1`                        |
| `attribute_key`       | VARCHAR(100) | Mã định danh unique (kebab-case) | `"color"`, `"size"`        |
| `attribute_name`      | VARCHAR(255) | Tên hiển thị của thuộc tính      | `"Màu sắc"`, `"Dung tích"` |
| `attribute_name_en`   | VARCHAR(255) | Tên tiếng Anh (optional)         | `"Color"`, `"Size"`        |
| `attribute_type`      | VARCHAR(50)  | Loại thuộc tính                  | `"SELECT"`, `"TEXT"`       |
| `data_type`           | VARCHAR(50)  | Kiểu dữ liệu                     | `"STRING"`, `"NUMBER"`     |
| `is_filterable`       | BOOLEAN      | Có thể dùng để lọc không         | `true`                     |
| `is_searchable`       | BOOLEAN      | Có thể tìm kiếm không            | `false`                    |
| `is_required`         | BOOLEAN      | Bắt buộc phải có                 | `false`                    |
| `is_variant_specific` | BOOLEAN      | Dành riêng cho variant           | `true`                     |
| `display_order`       | INTEGER      | Thứ tự hiển thị                  | `0`                        |
| `icon_class`          | VARCHAR(100) | CSS class cho icon               | `"fa fa-palette"`          |
| `color_code`          | VARCHAR(7)   | Mã màu hex                       | `"#FF5733"`                |
| `validation_rules`    | JSONB        | Quy tắc validation (JSON)        | `{"min": 0, "max": 100}`   |
| `description`         | TEXT         | Mô tả chi tiết                   | `"Màu sắc của sản phẩm"`   |
| `help_text`           | TEXT         | Text hướng dẫn                   | `"Chọn màu sắc phù hợp"`   |
| `unit`                | VARCHAR(50)  | Đơn vị tính (ml, g, %, kg, cm)   | `"ml"`, `"g"`, `"%"`       |
| `status`              | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE)     | `"ACTIVE"`                 |
| `created_at`          | TIMESTAMP    | Thời gian tạo                    | `2025-12-03 10:00:00`      |
| `updated_at`          | TIMESTAMP    | Thời gian cập nhật               | `2025-12-03 10:00:00`      |

#### Bảng `attribute_values`

| Trường              | Kiểu         | Mô Tả                     | Ví Dụ                 |
| ------------------- | ------------ | ------------------------- | --------------------- |
| `id`                | BIGSERIAL    | Primary key tự động tăng  | `1`                   |
| `attribute_type_id` | BIGINT       | Foreign key đến attribute | `1`                   |
| `value`             | VARCHAR(255) | Giá trị thực (internal)   | `"red"`, `"100ml"`    |
| `display_value`     | VARCHAR(255) | Tên hiển thị              | `"Đỏ"`, `"100ml"`     |
| `display_value_en`  | VARCHAR(255) | Tên tiếng Anh (optional)  | `"Red"`, `"100ml"`    |
| `color_code`        | VARCHAR(7)   | Mã màu (deprecated)       | `"#FF0000"`           |
| `image_url`         | VARCHAR(500) | URL ảnh (nếu có)          | `"https://..."`       |
| `hex_color`         | VARCHAR(7)   | Mã màu hex                | `"#FF0000"`           |
| `description`       | TEXT         | Mô tả chi tiết            | `"Màu đỏ tươi"`       |
| `display_order`     | INTEGER      | Thứ tự hiển thị           | `0`                   |
| `is_default`        | BOOLEAN      | Giá trị mặc định          | `false`               |
| `search_keywords`   | TEXT         | Từ khóa tìm kiếm          | `"đỏ, red, màu đỏ"`   |
| `created_at`        | TIMESTAMP    | Thời gian tạo             | `2025-12-03 10:00:00` |
| `updated_at`        | TIMESTAMP    | Thời gian cập nhật        | `2025-12-03 10:00:00` |

### Constraints

- **Unique Constraint:**
  - `attribute_key` phải unique trong bảng `product_attributes`
  - `(attribute_type_id, value)` phải unique trong bảng `attribute_values`
- **Check Constraint:**
  - `attribute_type` chỉ được là: `SELECT`, `MULTISELECT`, `RANGE`, `BOOLEAN`, `TEXT`
  - `data_type` chỉ được là: `STRING`, `NUMBER`, `DECIMAL`, `DATE`, `BOOLEAN`
  - `status` chỉ được là: `ACTIVE` hoặc `INACTIVE`
- **Foreign Key:**
  - `attribute_values.attribute_type_id` → `product_attributes.id` (CASCADE DELETE)

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.catalog.attribute
├── controller/
│   └── ProductAttributeController.java
├── service/
│   ├── ProductAttributeService.java
│   └── ProductAttributeServiceImpl.java
├── repository/
│   ├── ProductAttributeRepository.java
│   └── AttributeValueRepository.java
├── entity/
│   ├── ProductAttribute.java
│   └── AttributeValue.java
├── dto/
│   ├── ProductAttributeDTO.java
│   └── AttributeValueDTO.java
└── mapper/
    ├── ProductAttributeMapper.java
    └── AttributeValueMapper.java
```

### Entity: `ProductAttribute.java`

```java
@Entity
@Table(name = "attribute_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attribute_key", nullable = false, unique = true, length = 100)
    private String attributeKey;

    @Column(name = "attribute_name", nullable = false, length = 255)
    private String attributeName;

    @Column(name = "attribute_name_en", length = 255)
    private String attributeNameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "attribute_type", nullable = false, length = 50)
    private AttributeType attributeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false, length = 50)
    @Builder.Default
    private AttributeDataType dataType = AttributeDataType.STRING;

    @Column(name = "is_filterable")
    @Builder.Default
    private Boolean filterable = Boolean.TRUE;

    @Column(name = "is_searchable")
    @Builder.Default
    private Boolean searchable = Boolean.FALSE;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean required = Boolean.FALSE;

    @Column(name = "is_variant_specific")
    @Builder.Default
    private Boolean variantSpecific = Boolean.FALSE;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "help_text", columnDefinition = "TEXT")
    private String helpText;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(
        mappedBy = "attribute",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<AttributeValue> values = new ArrayList<>();

    public enum AttributeType {
        SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT
    }

    public enum AttributeDataType {
        STRING, NUMBER, DECIMAL, DATE, BOOLEAN
    }
}
```

**Đặc điểm:**

- Sử dụng `@OneToMany` với `cascade = CascadeType.ALL` và `orphanRemoval = true` để tự động xóa values khi xóa attribute
- Hỗ trợ nhiều loại attribute type và data type
- Có các flag để điều khiển behavior (filterable, searchable, required, variantSpecific)

### Entity: `AttributeValue.java`

```java
@Entity
@Table(name = "attribute_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_type_id", nullable = false)
    private ProductAttribute attribute;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(name = "display_value", nullable = false, length = 255)
    private String displayValue;

    @Column(name = "display_value_en", length = 255)
    private String displayValueEn;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "hex_color", length = 7)
    private String hexColor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = Boolean.FALSE;

    @Column(name = "search_keywords", columnDefinition = "TEXT")
    private String searchKeywords;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

**Đặc điểm:**

- `@ManyToOne` với `FetchType.LAZY` để tối ưu performance
- Hỗ trợ cả `colorCode` (deprecated) và `hexColor` (mới)
- Có `imageUrl` để hỗ trợ hiển thị ảnh cho value (ví dụ: màu sắc)

### DTO: `ProductAttributeDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeDTO {
    private Long id;
    private String attributeKey;
    private String attributeName;
    private String attributeNameEn;
    private String attributeType;
    private String dataType;
    private Boolean filterable;
    private Boolean searchable;
    private Boolean required;
    private Boolean variantSpecific;
    private Integer displayOrder;
    private String iconClass;
    private String colorCode;
    private String validationRules;
    private String description;
    private String helpText;
    private String unit;
    private String status;
    private List<AttributeValueDTO> values;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Đặc điểm:**

- Chứa nested `List<AttributeValueDTO>` để hỗ trợ nested update
- Tất cả fields đều optional (trừ khi có validation)

### DTO: `AttributeValueDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueDTO {
    private Long id;
    private String value;
    private String displayValue;
    private String displayValueEn;
    private String colorCode;
    private String imageUrl;
    private String hexColor;
    private String description;
    private Integer displayOrder;
    private Boolean isDefault;
    private String searchKeywords;
}
```

### Repository: `ProductAttributeRepository.java`

```java
@Repository
public interface ProductAttributeRepository
    extends JpaRepository<ProductAttribute, Long>,
            JpaSpecificationExecutor<ProductAttribute> {

    boolean existsByAttributeKey(String attributeKey);

    Optional<ProductAttribute> findByAttributeKey(String attributeKey);
}
```

**Đặc điểm:**

- Extends `JpaSpecificationExecutor` để hỗ trợ dynamic queries
- Custom methods để kiểm tra trùng `attributeKey`

### Repository: `AttributeValueRepository.java`

```java
@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {

    List<AttributeValue> findByAttributeId(Long attributeId);

    boolean isUsedByProductAttributeValues(Long valueId);
}
```

**Đặc điểm:**

- Method `isUsedByProductAttributeValues` để kiểm tra value có đang được sử dụng không (trước khi xóa)

### Service: `ProductAttributeServiceImpl.java`

**Các phương thức chính:**

1. **`getAttributes(keyword, status, pageable)`**

   - Tìm kiếm theo keyword (attributeName, attributeNameEn, attributeKey)
   - Lọc theo status
   - Phân trang và sắp xếp

2. **`createAttribute(attributeDTO)`**

   - Kiểm tra trùng `attributeKey`
   - Tự động tạo values nếu có trong DTO
   - Validate business rules

3. **`updateAttribute(id, attributeDTO)`** ⭐ **Nested Update**

   - Cập nhật thông tin attribute cha
   - Xử lý nested update cho values:
     - Value không có ID → INSERT (mới)
     - Value có ID và tồn tại trong DB → UPDATE
     - Value tồn tại trong DB nhưng không có trong payload → DELETE (nếu không bị ràng buộc)
   - Kiểm tra ràng buộc trước khi xóa values

4. **`deleteAttribute(id)`**

   - Kiểm tra tồn tại
   - Kiểm tra ràng buộc (có sản phẩm đang dùng không)
   - Xóa attribute và tất cả values (cascade)

5. **`getAttributeValues(attributeId)`**
   - Lấy danh sách values của attribute

**Logic Nested Update:**

```java
private void updateAttributeValues(ProductAttribute attribute, List<AttributeValueDTO> newValues) {
    // Lấy danh sách values hiện tại từ DB
    List<AttributeValue> existingValues = new ArrayList<>(attribute.getValues());
    Map<Long, AttributeValue> existingValuesMap = existingValues.stream()
            .collect(Collectors.toMap(AttributeValue::getId, Function.identity()));

    // Tạo map cho values mới từ payload (chỉ những cái có ID)
    Map<Long, AttributeValueDTO> newValuesMap = newValues.stream()
            .filter(dto -> dto.getId() != null)
            .collect(Collectors.toMap(AttributeValueDTO::getId, Function.identity()));

    // Xóa các values không còn trong payload
    List<AttributeValue> toDelete = existingValues.stream()
            .filter(existing -> !newValuesMap.containsKey(existing.getId()))
            .collect(Collectors.toList());

    // Kiểm tra ràng buộc trước khi xóa
    for (AttributeValue valueToDelete : toDelete) {
        if (attributeValueRepository.isUsedByProductAttributeValues(valueToDelete.getId())) {
            throw new OperationNotPermittedException(
                String.format("Không thể xóa giá trị '%s' vì đã có sản phẩm đang sử dụng.",
                    valueToDelete.getDisplayValue())
            );
        }
    }

    // Xóa các values không còn trong payload
    attribute.getValues().removeAll(toDelete);

    // Cập nhật hoặc thêm mới values
    for (AttributeValueDTO dto : newValues) {
        if (dto.getId() != null && existingValuesMap.containsKey(dto.getId())) {
            // UPDATE: Value có ID và tồn tại trong DB
            AttributeValue existingValue = existingValuesMap.get(dto.getId());
            updateAttributeValueFields(existingValue, dto);
        } else {
            // INSERT: Value không có ID hoặc ID không tồn tại trong DB
            AttributeValue newValue = attributeValueMapper.toEntity(dto);
            newValue.setAttribute(attribute);
            attribute.getValues().add(newValue);
        }
    }
}
```

### Controller: `ProductAttributeController.java`

```java
@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ProductAttributeController {

    private final ProductAttributeService productAttributeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductAttributeDTO>>> getAttributes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        // Implementation
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductAttributeDTO>>> getAllAttributes() {
        // Implementation
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> getAttribute(@PathVariable Long id) {
        // Implementation
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> createAttribute(
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        // Implementation
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        // Implementation - Nested Update
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long id) {
        // Implementation
    }

    @GetMapping("/{id}/values")
    public ResponseEntity<ApiResponse<List<AttributeValueDTO>>> getAttributeValues(@PathVariable Long id) {
        // Implementation
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> createAttributeValue(
            @PathVariable Long id,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        // Implementation
    }

    @PutMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> updateAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        // Implementation
    }

    @DeleteMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId
    ) {
        // Implementation
    }
}
```

**Đặc điểm:**

- Tất cả endpoints đều có `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
- Hỗ trợ cả nested update (PUT `/api/admin/attributes/{id}`) và individual value operations
- Sử dụng `@Valid` để validate DTO

---

## 🎨 Frontend Implementation

### Package Structure

```
orchard-store-dashboad/src
├── app/admin/attributes/
│   └── page.tsx
├── components/features/catalog/
│   ├── attribute-table.tsx
│   ├── attribute-row.tsx
│   ├── attribute-table-toolbar.tsx
│   ├── attribute-form-sheet.tsx
│   └── delete-attribute-dialog.tsx
├── hooks/
│   └── use-attributes.ts
├── services/
│   └── attribute.service.ts
├── types/
│   └── attribute.types.ts
└── lib/utils/
    └── attribute-helpers.ts
```

### Types: `attribute.types.ts`

```typescript
export type AttributeStatus = "ACTIVE" | "INACTIVE";
export type AttributeType =
  | "SELECT"
  | "MULTISELECT"
  | "RANGE"
  | "BOOLEAN"
  | "TEXT";
export type AttributeDataType =
  | "STRING"
  | "NUMBER"
  | "DECIMAL"
  | "DATE"
  | "BOOLEAN";

export interface AttributeValue {
  id?: number | null;
  attributeId?: number | null;
  value: string;
  displayValue: string;
  displayValueEn?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  hexColor?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  isDefault?: boolean | null;
  searchKeywords?: string | null;
}

export interface ProductAttribute {
  id: number;
  attributeKey: string;
  attributeName: string;
  attributeNameEn?: string | null;
  attributeType: AttributeType;
  dataType: AttributeDataType;
  filterable?: boolean | null;
  searchable?: boolean | null;
  required?: boolean | null;
  variantSpecific?: boolean | null;
  displayOrder?: number | null;
  iconClass?: string | null;
  colorCode?: string | null;
  validationRules?: string | null;
  description?: string | null;
  helpText?: string | null;
  status: AttributeStatus;
  values?: AttributeValue[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const attributeFormSchema = z.object({
  attributeKey: z
    .string()
    .min(1, "Vui lòng nhập mã thuộc tính")
    .min(2, "Mã thuộc tính phải có ít nhất 2 ký tự")
    .max(100, "Mã thuộc tính không được vượt quá 100 ký tự")
    .regex(/^[a-z0-9_-]+$/, {
      message:
        "Mã thuộc tính chỉ được chứa chữ thường, số, dấu gạch dưới và dấu gạch ngang",
    }),
  attributeName: z
    .string()
    .min(1, "Vui lòng nhập tên thuộc tính")
    .min(2, "Tên thuộc tính phải có ít nhất 2 ký tự")
    .max(255, "Tên thuộc tính không được vượt quá 255 ký tự"),
  attributeType: z.enum(["SELECT", "MULTISELECT", "RANGE", "BOOLEAN", "TEXT"]),
  dataType: z
    .enum(["STRING", "NUMBER", "DECIMAL", "DATE", "BOOLEAN"])
    .optional(),
  // ... other fields
  values: z.array(attributeValueSchema).optional().nullable(),
});
```

### Service: `attribute.service.ts`

```typescript
export const attributeService = {
  getAttributes: (params?: AttributeFilter) => {
    // GET /api/admin/attributes?page=0&size=10&keyword=...&status=...
  },

  getAllAttributes: () => {
    // GET /api/admin/attributes/all
  },

  getAttribute: (id: number): Promise<ProductAttribute> => {
    // GET /api/admin/attributes/{id}
  },

  createAttribute: (data: AttributeFormData): Promise<ProductAttribute> => {
    // POST /api/admin/attributes
  },

  updateAttribute: (
    id: number,
    data: AttributeFormData
  ): Promise<ProductAttribute> => {
    // PUT /api/admin/attributes/{id} - Nested Update
  },

  deleteAttribute: (id: number): Promise<void> => {
    // DELETE /api/admin/attributes/{id}
  },

  getAttributeValues: (attributeId: number): Promise<AttributeValue[]> => {
    // GET /api/admin/attributes/{id}/values
  },

  createAttributeValue: (
    attributeId: number,
    data: AttributeValue
  ): Promise<AttributeValue> => {
    // POST /api/admin/attributes/{id}/values
  },

  updateAttributeValue: (
    attributeId: number,
    valueId: number,
    data: AttributeValue
  ): Promise<AttributeValue> => {
    // PUT /api/admin/attributes/{id}/values/{valueId}
  },

  deleteAttributeValue: (
    attributeId: number,
    valueId: number
  ): Promise<void> => {
    // DELETE /api/admin/attributes/{id}/values/{valueId}
  },
};
```

### Hooks: `use-attributes.ts`

```typescript
export const useAttributes = (filters?: AttributeFilter) => {
  // React Query hook để lấy danh sách attributes với pagination
};

export const useAllAttributes = () => {
  // React Query hook để lấy tất cả attributes (không phân trang)
};

export const useAttribute = (id: number | null) => {
  // React Query hook để lấy chi tiết attribute
};

export const useAttributeValues = (attributeId: number | null) => {
  // React Query hook để lấy danh sách values
};

export const useCreateAttribute = () => {
  // Mutation hook để tạo attribute mới
};

export const useUpdateAttribute = () => {
  // Mutation hook để cập nhật attribute (với nested update)
};

export const useDeleteAttribute = () => {
  // Mutation hook để xóa attribute
};
```

### Component: `attribute-form-sheet.tsx` ⭐ **Nested Form**

**Đặc điểm nổi bật:**

1. **Dynamic Field Array với `useFieldArray`:**

```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "values",
});

const addValue = () => {
  append({
    value: "",
    displayValue: "",
    displayValueEn: undefined,
    hexColor: undefined,
    displayOrder: 0,
    isDefault: false,
  });
};
```

2. **Auto-generate attributeKey:**

```typescript
const nameValue = form.watch("attributeName");

useEffect(() => {
  if (nameValue && nameValue.trim() !== "") {
    const generatedKey = generateAttributeKey(nameValue);
    if (!keyManuallyEdited && generatedKey) {
      form.setValue("attributeKey", generatedKey, { shouldValidate: false });
    }
  }
}, [nameValue, keyManuallyEdited, form]);
```

3. **Color Picker Preview:**

```typescript
{
  attributeType === "SELECT" && (
    <FormField label="Màu HEX (nếu là màu)">
      <Controller
        name={`values.${index}.hexColor`}
        render={({ field }) => (
          <div className="flex gap-2">
            <Input
              {...field}
              placeholder="#FF0000"
              maxLength={7}
              className="font-mono"
            />
            {field.value && (
              <div
                className="h-10 w-10 rounded border border-border"
                style={{ backgroundColor: field.value }}
              />
            )}
          </div>
        )}
      />
    </FormField>
  );
}
```

4. **Nested Update Logic:**

Khi submit, form gửi toàn bộ JSON bao gồm:

- Attribute cha với tất cả fields
- Array `values` với:
  - Values có `id` → UPDATE
  - Values không có `id` → INSERT
  - Values không có trong array → DELETE (xử lý ở backend)

### Component: `attribute-table.tsx`

Hiển thị danh sách attributes với:

- Tên và mã thuộc tính
- Loại thuộc tính
- Số lượng values
- Trạng thái
- Actions (Edit, Delete)

### Component: `attribute-table-toolbar.tsx`

Toolbar với:

- Search input
- Status filter
- Page size selector
- Add button

### Helper: `attribute-helpers.ts`

```typescript
export function generateAttributeKey(name: string): string {
  if (!name || name.trim() === "") return "";

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
```

---

## 📡 API Documentation

### Base URL

```
/api/admin/attributes
```

### Endpoints

#### 1. GET `/api/admin/attributes`

Lấy danh sách attributes với pagination và filters.

**Query Parameters:**

| Parameter   | Type   | Required | Default        | Description              |
| ----------- | ------ | -------- | -------------- | ------------------------ |
| `page`      | int    | No       | `0`            | Số trang (0-based)       |
| `size`      | int    | No       | `10`           | Số lượng items mỗi trang |
| `sortBy`    | string | No       | `displayOrder` | Field để sort            |
| `direction` | string | No       | `ASC`          | `ASC` hoặc `DESC`        |
| `keyword`   | string | No       | -              | Tìm kiếm theo tên/mã     |
| `status`    | string | No       | -              | `ACTIVE` hoặc `INACTIVE` |

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách thuộc tính thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "attributeKey": "color",
        "attributeName": "Màu sắc",
        "attributeType": "SELECT",
        "dataType": "STRING",
        "status": "ACTIVE",
        "values": [
          {
            "id": 1,
            "value": "red",
            "displayValue": "Đỏ",
            "hexColor": "#FF0000",
            "displayOrder": 0
          }
        ]
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

#### 2. GET `/api/admin/attributes/all`

Lấy tất cả attributes (không phân trang - dành cho dropdown).

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách thuộc tính thành công",
  "data": [
    {
      "id": 1,
      "attributeKey": "color",
      "attributeName": "Màu sắc",
      "attributeType": "SELECT"
    }
  ]
}
```

#### 3. GET `/api/admin/attributes/{id}`

Lấy chi tiết attribute theo ID.

**Response:**

```json
{
  "success": true,
  "message": "Lấy thông tin thuộc tính thành công",
  "data": {
    "id": 1,
    "attributeKey": "color",
    "attributeName": "Màu sắc",
    "attributeType": "SELECT",
    "values": [
      {
        "id": 1,
        "value": "red",
        "displayValue": "Đỏ",
        "hexColor": "#FF0000"
      }
    ]
  }
}
```

#### 4. POST `/api/admin/attributes`

Tạo attribute mới.

**Request Body:**

```json
{
  "attributeKey": "color",
  "attributeName": "Màu sắc",
  "attributeType": "SELECT",
  "dataType": "STRING",
  "status": "ACTIVE",
  "values": [
    {
      "value": "red",
      "displayValue": "Đỏ",
      "hexColor": "#FF0000",
      "displayOrder": 0
    },
    {
      "value": "blue",
      "displayValue": "Xanh",
      "hexColor": "#0000FF",
      "displayOrder": 1
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo thuộc tính thành công",
  "data": {
    "id": 1,
    "attributeKey": "color",
    "attributeName": "Màu sắc",
    "values": [...]
  }
}
```

#### 5. PUT `/api/admin/attributes/{id}` ⭐ **Nested Update**

Cập nhật attribute với nested update cho values.

**Request Body:**

```json
{
  "attributeName": "Màu sắc (Updated)",
  "values": [
    {
      "id": 1,
      "value": "red",
      "displayValue": "Đỏ (Updated)",
      "hexColor": "#FF0000"
    },
    {
      "value": "green",
      "displayValue": "Xanh lá",
      "hexColor": "#00FF00"
    }
  ]
}
```

**Logic:**

- Value có `id: 1` → UPDATE value có ID = 1
- Value không có `id` → INSERT value mới
- Value có ID = 2 trong DB nhưng không có trong payload → DELETE (nếu không bị ràng buộc)

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật thuộc tính thành công",
  "data": {
    "id": 1,
    "attributeName": "Màu sắc (Updated)",
    "values": [...]
  }
}
```

#### 6. DELETE `/api/admin/attributes/{id}`

Xóa attribute.

**Response:**

```json
{
  "success": true,
  "message": "Xóa thuộc tính thành công",
  "data": null
}
```

**Error Response (nếu có ràng buộc):**

```json
{
  "success": false,
  "message": "Không thể xóa thuộc tính vì đã có sản phẩm đang sử dụng",
  "data": null
}
```

#### 7. GET `/api/admin/attributes/{id}/values`

Lấy danh sách values của attribute.

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách giá trị thuộc tính thành công",
  "data": [
    {
      "id": 1,
      "value": "red",
      "displayValue": "Đỏ",
      "hexColor": "#FF0000"
    }
  ]
}
```

#### 8. POST `/api/admin/attributes/{id}/values`

Tạo value mới cho attribute.

**Request Body:**

```json
{
  "value": "yellow",
  "displayValue": "Vàng",
  "hexColor": "#FFFF00",
  "displayOrder": 2
}
```

#### 9. PUT `/api/admin/attributes/{id}/values/{valueId}`

Cập nhật value.

**Request Body:**

```json
{
  "displayValue": "Vàng (Updated)",
  "hexColor": "#FFFF00"
}
```

#### 10. DELETE `/api/admin/attributes/{id}/values/{valueId}`

Xóa value.

**Response:**

```json
{
  "success": true,
  "message": "Xóa giá trị thuộc tính thành công",
  "data": null
}
```

---

## ⭐ Tính Năng Đặc Biệt

### 1. Unit (Đơn vị tính) ⚠️

**Mô tả:**

Trường `unit` được thêm vào bảng `product_attributes` để hỗ trợ hiển thị đơn vị cho các giá trị thuộc tính.

**Tại sao cần:**

- Nếu không có `unit`, khi hiển thị giá trị `100` ra ngoài frontend, khách hàng sẽ không biết là `100ml` hay `100g`.
- Không nên bắt người dùng nhập chữ "ml" vào trong trường `display_value` của từng giá trị con (dễ sai sót và khó lọc).

**Implementation:**

- **Database:** Cột `unit VARCHAR(50)` trong bảng `product_attributes`
- **Backend:** Field `unit` trong Entity và DTO
- **Frontend:** Field "Đơn vị tính" (Optional) trong form

**Ví dụ:**

- Attribute "Dung tích" → `unit = "ml"` → Hiển thị: `"100ml"`
- Attribute "Trọng lượng" → `unit = "g"` → Hiển thị: `"500g"`
- Attribute "Tỷ lệ" → `unit = "%"` → Hiển thị: `"15%"`

**Migration:**

```sql
-- V13__add_unit_to_product_attributes.sql
ALTER TABLE product_attributes
ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
```

### 2. Logic is_variant_specific ⚠️

**Mô tả:**

Trường `is_variant_specific` (Boolean) được sử dụng để đánh dấu thuộc tính dùng cho biến thể sản phẩm.

**Validation:**

- **Backend:** Nếu `is_variant_specific = TRUE`, thì `attribute_type` bắt buộc phải là `SELECT`.
- **Lý do:** Một sản phẩm không thể có nhiều giá trị biến thể cùng lúc (ví dụ: không thể vừa 50ml vừa 100ml).

**Frontend Logic:**

- Khi người dùng tích chọn "Dùng cho biến thể", hệ thống tự động khóa `attribute_type` về `SELECT`.
- Dropdown `attribute_type` sẽ bị disable khi `variantSpecific = true`.

**Code Example:**

```typescript
// Frontend: Tự động set attributeType về SELECT khi bật variantSpecific
useEffect(() => {
  if (variantSpecific === true && attributeType !== "SELECT") {
    form.setValue("attributeType", "SELECT", { shouldValidate: false });
  }
}, [variantSpecific, attributeType, form]);

// Backend: Validation
if (Boolean.TRUE.equals(dto.getVariantSpecific())) {
  if (!"SELECT".equalsIgnoreCase(dto.getAttributeType())) {
    throw new IllegalArgumentException(
      "Thuộc tính dùng cho biến thể chỉ có thể có loại SELECT."
    );
  }
}
```

**UI:**

```
[Dùng cho biến thể] [Switch]
Nếu bật, thuộc tính này sẽ dùng để tạo biến thể sản phẩm (ví dụ: Dung tích 50ml, 100ml).
Chỉ có thể dùng với loại SELECT.
```

### 3. Hex Color và Image URL trong Attribute Values ⚠️

**Mô tả:**

Hỗ trợ cả `hexColor` và `imageUrl` để mô tả giá trị thuộc tính.

**Use Cases:**

- **Hex Color:** Dùng cho màu đơn sắc (ví dụ: Đỏ #FF0000, Xanh #0000FF)
- **Image URL:** Dùng cho pattern/texture (ví dụ: Màu gỗ vân sồi, Màu đá Marble)

**Frontend Implementation:**

- Component `ImageUpload` được sử dụng để upload ảnh swatch (mẫu thử) nhỏ.
- Kích thước khuyến nghị: 100x100px
- Folder: `others/YYYY/MM/DD` (sử dụng ImageEntityType "others")

**Code Example:**

```typescript
<FormField label="Ảnh mẫu (Swatch Image)">
  <Controller
    name={`values.${index}.imageUrl`}
    control={form.control}
    render={({ field }) => {
      const handleImageChange = async (file: File | null) => {
        if (file) {
          const imageUrl = await imageManagement.uploadImage(file);
          field.onChange(imageUrl);
        } else {
          if (field.value) {
            await imageManagement.markImageForDeletion(field.value);
          }
          field.onChange(null);
        }
      };

      return (
        <ImageUpload
          value={field.value}
          onChange={handleImageChange}
          variant="rectangle"
          size="sm"
          folder="attributes/swatches"
        />
      );
    }}
  />
</FormField>
```

### 4. Nested Update (Master-Detail)

**Mô tả:**

Khi cập nhật attribute, hệ thống tự động xử lý nested update cho values:

- **INSERT:** Values không có ID → tạo mới
- **UPDATE:** Values có ID và tồn tại trong DB → cập nhật
- **DELETE:** Values tồn tại trong DB nhưng không có trong payload → xóa (nếu không bị ràng buộc)

**Ưu điểm:**

- Chỉ cần 1 API call để cập nhật cả attribute và values
- Tự động đồng bộ giữa frontend và backend
- Kiểm tra ràng buộc trước khi xóa

**Ví dụ:**

```typescript
// Frontend gửi:
{
  "attributeName": "Màu sắc",
  "values": [
    { "id": 1, "displayValue": "Đỏ (Updated)" },  // UPDATE
    { "displayValue": "Xanh" },                     // INSERT
    // Value có ID = 2 không có trong array → DELETE
  ]
}
```

### 2. Auto-generate attributeKey

**Mô tả:**

Tự động tạo `attributeKey` từ `attributeName` khi user nhập tên.

**Logic:**

- Chuyển thành chữ thường
- Bỏ dấu Tiếng Việt
- Thay khoảng trắng bằng dấu gạch ngang
- Loại bỏ ký tự đặc biệt

**Ví dụ:**

- `"Màu sắc"` → `"mau-sac"`
- `"Dung tích"` → `"dung-tich"`
- `"Color & Size"` → `"color-size"`

**User Override Protection:**

- Nếu user chỉnh sửa `attributeKey` thủ công, hệ thống sẽ không tự động ghi đè
- Chỉ tự động điền khi field trống hoặc chưa được chỉnh sửa

### 3. Dynamic Field Array với useFieldArray

**Mô tả:**

Sử dụng `useFieldArray` của React Hook Form để quản lý dynamic list của attribute values.

**Tính năng:**

- Thêm value mới: `append()`
- Xóa value: `remove(index)`
- Tự động validate từng value
- Hỗ trợ reorder (có thể mở rộng với drag & drop)

**Code Example:**

```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "values",
});

// Thêm value mới
const addValue = () => {
  append({
    value: "",
    displayValue: "",
    hexColor: undefined,
    displayOrder: 0,
  });
};

// Xóa value
const removeValue = (index: number) => {
  remove(index);
};
```

### 4. Color Picker Preview

**Mô tả:**

Khi attribute type là `SELECT` và value có `hexColor`, hiển thị preview màu bên cạnh input.

**UI:**

```
[Màu HEX: #FF0000] [🟥 Preview Box]
```

**Code Example:**

```typescript
{
  field.value && (
    <div
      className="h-10 w-10 rounded border border-border"
      style={{ backgroundColor: field.value }}
    />
  );
}
```

### 5. Validation với Zod Schema

**Mô tả:**

Sử dụng Zod schema để validate form data trước khi gửi lên backend.

**Validation Rules:**

- `attributeKey`: Required, 2-100 ký tự, chỉ chứa chữ thường, số, dấu gạch dưới và dấu gạch ngang
- `attributeName`: Required, 2-255 ký tự
- `attributeType`: Required, enum
- `values`: Array of objects, mỗi value phải có `value` và `displayValue`
- `hexColor`: Optional, format `#RRGGBB` (6 hex digits)

**Code Example:**

```typescript
const attributeValueSchema = z.object({
  id: z.number().optional().nullable(),
  value: z.string().min(1, "Giá trị không được để trống"),
  displayValue: z.string().min(1, "Tên hiển thị không được để trống"),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Màu HEX không hợp lệ")
    .optional(),
});

export const attributeFormSchema = z.object({
  attributeKey: z
    .string()
    .min(1, "Vui lòng nhập mã thuộc tính")
    .regex(/^[a-z0-9_-]+$/, {
      message:
        "Mã thuộc tính chỉ được chứa chữ thường, số, dấu gạch dưới và dấu gạch ngang",
    }),
  attributeName: z.string().min(1, "Vui lòng nhập tên thuộc tính"),
  values: z.array(attributeValueSchema).optional().nullable(),
});
```

### 6. Constraint Checking

**Mô tả:**

Trước khi xóa attribute hoặc value, hệ thống kiểm tra xem có sản phẩm đang sử dụng không.

**Logic:**

```java
if (attributeValueRepository.isUsedByProductAttributeValues(valueToDelete.getId())) {
    throw new OperationNotPermittedException(
        "Không thể xóa giá trị vì đã có sản phẩm đang sử dụng."
    );
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Không thể xóa giá trị 'Đỏ' vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước.",
  "data": null
}
```

---

## 🔄 Migration & Database

### Initial Schema

Schema đã được tạo trong `V1__init_schema.sql`:

- Bảng `product_attributes` (tên trong DB: `attribute_types`)
- Bảng `attribute_values` (tên trong DB: `attribute_options`)
- Indexes và foreign keys

### No Additional Migrations Required

Module này sử dụng schema có sẵn, không cần migration thêm.

---

## 💻 Code Examples

### Backend: Tạo Attribute với Values

```java
ProductAttributeDTO dto = ProductAttributeDTO.builder()
    .attributeKey("color")
    .attributeName("Màu sắc")
    .attributeType("SELECT")
    .dataType("STRING")
    .status("ACTIVE")
    .values(Arrays.asList(
        AttributeValueDTO.builder()
            .value("red")
            .displayValue("Đỏ")
            .hexColor("#FF0000")
            .displayOrder(0)
            .build(),
        AttributeValueDTO.builder()
            .value("blue")
            .displayValue("Xanh")
            .hexColor("#0000FF")
            .displayOrder(1)
            .build()
    ))
    .build();

ProductAttributeDTO created = productAttributeService.createAttribute(dto);
```

### Backend: Nested Update

```java
ProductAttributeDTO dto = ProductAttributeDTO.builder()
    .attributeName("Màu sắc (Updated)")
    .values(Arrays.asList(
        // UPDATE: Value có ID
        AttributeValueDTO.builder()
            .id(1L)
            .displayValue("Đỏ (Updated)")
            .build(),
        // INSERT: Value không có ID
        AttributeValueDTO.builder()
            .value("green")
            .displayValue("Xanh lá")
            .hexColor("#00FF00")
            .build()
        // DELETE: Value có ID = 2 không có trong array → tự động xóa
    ))
    .build();

ProductAttributeDTO updated = productAttributeService.updateAttribute(1L, dto);
```

### Frontend: Sử dụng Form với Nested Values

```typescript
const form = useForm<AttributeFormData>({
  resolver: zodResolver(attributeFormSchema),
  defaultValues: {
    attributeKey: "",
    attributeName: "",
    attributeType: "SELECT",
    values: [],
  },
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "values",
});

const onSubmit = async (data: AttributeFormData) => {
  // data.values sẽ chứa:
  // - Values có id → UPDATE
  // - Values không có id → INSERT
  // - Values không có trong array → DELETE (backend xử lý)
  await updateMutation.mutateAsync({ id: attribute.id, data });
};
```

### Frontend: Auto-generate attributeKey

```typescript
const nameValue = form.watch("attributeName");
const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

useEffect(() => {
  if (nameValue && nameValue.trim() !== "") {
    const generatedKey = generateAttributeKey(nameValue);
    if (!keyManuallyEdited && generatedKey) {
      form.setValue("attributeKey", generatedKey, { shouldValidate: false });
    }
  }
}, [nameValue, keyManuallyEdited, form]);
```

### Frontend: Color Picker Preview

```typescript
<FormField label="Màu HEX">
  <Controller
    name={`values.${index}.hexColor`}
    control={form.control}
    render={({ field }) => (
      <div className="flex gap-2">
        <Input
          {...field}
          placeholder="#FF0000"
          maxLength={7}
          className="font-mono"
        />
        {field.value && (
          <div
            className="h-10 w-10 rounded border border-border"
            style={{ backgroundColor: field.value }}
          />
        )}
      </div>
    )}
  />
</FormField>
```

---

## 🧪 Testing Guide

### Test Cases

#### 1. Tạo Attribute Mới

**Steps:**

1. Vào `/admin/attributes`
2. Click "Thêm thuộc tính"
3. Nhập:
   - Tên thuộc tính: `"Màu sắc"`
   - Mã thuộc tính: Tự động tạo `"mau-sac"`
   - Loại thuộc tính: `SELECT`
4. Thêm values:
   - Value 1: `value="red"`, `displayValue="Đỏ"`, `hexColor="#FF0000"`
   - Value 2: `value="blue"`, `displayValue="Xanh"`, `hexColor="#0000FF"`
5. Click "Tạo mới"

**Expected:**

- Attribute được tạo thành công
- 2 values được tạo kèm theo
- Hiển thị trong danh sách

#### 2. Nested Update

**Steps:**

1. Edit attribute vừa tạo
2. Sửa `displayValue` của value "Đỏ" thành "Đỏ (Updated)"
3. Thêm value mới: `value="green"`, `displayValue="Xanh lá"`
4. Xóa value "Xanh" (remove khỏi form)
5. Click "Cập nhật"

**Expected:**

- Value "Đỏ" được UPDATE
- Value "Xanh lá" được INSERT
- Value "Xanh" được DELETE (nếu không bị ràng buộc)

#### 3. Auto-generate attributeKey

**Steps:**

1. Tạo attribute mới
2. Nhập tên: `"Dung tích"`
3. Kiểm tra field "Mã thuộc tính"

**Expected:**

- Tự động điền `"dung-tich"`
- Nếu user chỉnh sửa thủ công, không tự động ghi đè

#### 4. Validation

**Steps:**

1. Tạo attribute với:
   - `attributeKey`: `"Invalid Key!"` (có ký tự đặc biệt)
   - `attributeName`: `""` (rỗng)
   - Value không có `displayValue`

**Expected:**

- Hiển thị lỗi validation
- Không cho submit

#### 5. Constraint Checking

**Steps:**

1. Tạo attribute với values
2. Gán attribute này cho sản phẩm
3. Thử xóa value đang được sử dụng

**Expected:**

- Hiển thị lỗi: "Không thể xóa giá trị vì đã có sản phẩm đang sử dụng"

#### 6. Color Picker Preview

**Steps:**

1. Tạo attribute type `SELECT`
2. Thêm value với `hexColor="#FF0000"`

**Expected:**

- Hiển thị preview box màu đỏ bên cạnh input

### Performance Testing

1. **Load Test:**

   - Test với 1000+ attributes
   - Test với attribute có 100+ values

2. **Nested Update Performance:**
   - Test update attribute với 50+ values
   - Đo thời gian response

### Integration Testing

1. **API Integration:**

   - Test tất cả endpoints với Postman/Insomnia
   - Verify nested update logic

2. **Frontend Integration:**
   - Test form validation
   - Test dynamic field array
   - Test auto-generate attributeKey

---

## 📝 Notes & Best Practices

### Backend

1. **Nested Update:**

   - Luôn kiểm tra ràng buộc trước khi xóa values
   - Sử dụng `orphanRemoval = true` để tự động xóa values khi xóa attribute

2. **Validation:**

   - Validate cả attribute cha và values
   - Kiểm tra unique constraint cho `attributeKey` và `(attribute_id, value)`

3. **Performance:**
   - Sử dụng `FetchType.LAZY` cho relationship
   - Sử dụng `@EntityGraph` hoặc `JOIN FETCH` khi cần eager load values

### Frontend

1. **Form Management:**

   - Sử dụng `useFieldArray` cho dynamic nested forms
   - Validate từng value trong array

2. **User Experience:**

   - Auto-generate `attributeKey` nhưng cho phép user override
   - Hiển thị preview cho color picker
   - Loading states và error handling

3. **Performance:**
   - Lazy load form component
   - Debounce search input
   - Optimistic updates với React Query

---

## 🔗 Related Documentation

- [Concentration Management Documentation](./CONCENTRATION_MANAGEMENT_DOCUMENTATION.md)
- [User Management Documentation](./USER_MANAGEMENT_DOCUMENTATION.md)
- [Brand Management Documentation](./BRAND_MANAGEMENT_DOCUMENTATION.md)
- [Category Management Documentation](./CATEGORY_MANAGEMENT_DOCUMENTATION.md)
- [Image Management Documentation](./IMAGE_MANAGEMENT_DOCUMENTATION.md)

---

**End of Documentation**
