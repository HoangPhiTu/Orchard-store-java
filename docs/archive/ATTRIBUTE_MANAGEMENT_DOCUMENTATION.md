# Attribute Management - Documentation

**Module:** Product Attribute Management (Quản lý Thuộc tính Sản phẩm)  
**Version:** 2.1  
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

- ✅ Xem danh sách thuộc tính với tìm kiếm, lọc (status, domain) và phân trang
- ✅ Xem chi tiết thuộc tính kèm danh sách giá trị
- ✅ Tạo thuộc tính mới với nested values
- ✅ Cập nhật thuộc tính với nested update (insert/update/delete values)
- ✅ Xóa thuộc tính (với kiểm tra ràng buộc)
- ✅ Tự động tạo attributeKey từ attributeName
- ✅ Quản lý dynamic attribute values với useFieldArray
- ✅ Image upload cho attribute values (swatch images)
- ✅ Hỗ trợ nhiều loại attribute type (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)
- ✅ Phân loại theo domain (PERFUME, COSMETICS, COMMON)
- ✅ Validation: Chỉ cho phép 1 giá trị mặc định (isDefault) cho mỗi attribute
- ✅ Logic is_variant_specific: Tự động set attributeType = SELECT khi bật

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
CREATE TABLE attribute_types (
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
    validation_rules TEXT,
    description TEXT,
    help_text TEXT,
    unit VARCHAR(50),
    domain VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng `attribute_values` (attribute_options)

```sql
CREATE TABLE attribute_options (
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
CREATE INDEX idx_attributes_key ON attribute_types(attribute_key);
CREATE INDEX idx_attributes_type ON attribute_types(attribute_type);
CREATE INDEX idx_attributes_filterable ON attribute_types(is_filterable) WHERE is_filterable = true;
CREATE INDEX idx_attributes_status ON attribute_types(status);
CREATE INDEX idx_attributes_display_order ON attribute_types(display_order);
CREATE INDEX idx_attributes_domain ON attribute_types(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_attributes_unit ON attribute_types(unit) WHERE unit IS NOT NULL;

CREATE INDEX idx_attribute_values_attribute ON attribute_options(attribute_type_id);
CREATE INDEX idx_attribute_values_display_order ON attribute_options(attribute_type_id, display_order);
CREATE INDEX idx_attribute_values_search ON attribute_options USING gin(to_tsvector('english', search_keywords));
CREATE INDEX idx_attribute_values_value ON attribute_options(value);
```

### Bảng `category_attributes` (Binding Table)

```sql
CREATE TABLE category_attributes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(category_id, attribute_id)
);
```

**Mô tả:**

- Bảng trung gian để liên kết Category và Attribute (Many-to-Many relationship)
- Cho phép gán nhiều attributes vào một category
- Metadata:
  - `is_required` (attribute có bắt buộc không)
  - `display_order` (thứ tự hiển thị)
  - `group_name` (tên nhóm để group attributes khi hiển thị trong Product Form, nếu NULL thì group theo domain)

### Foreign Keys

```sql
ALTER TABLE attribute_options
ADD CONSTRAINT fk_attribute_values_attribute
FOREIGN KEY (attribute_type_id) REFERENCES attribute_types(id) ON DELETE CASCADE;

ALTER TABLE category_attributes
ADD CONSTRAINT fk_category_attributes_category
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE category_attributes
ADD CONSTRAINT fk_category_attributes_attribute
FOREIGN KEY (attribute_id) REFERENCES attribute_types(id) ON DELETE CASCADE;
```

### Mô Tả Các Trường

#### Bảng `attribute_types`

| Trường                | Kiểu         | Mô Tả                            | Ví Dụ                                  |
| --------------------- | ------------ | -------------------------------- | -------------------------------------- |
| `id`                  | BIGSERIAL    | Primary key tự động tăng         | `1`                                    |
| `attribute_key`       | VARCHAR(100) | Mã định danh unique (kebab-case) | `"color"`, `"size"`                    |
| `attribute_name`      | VARCHAR(255) | Tên hiển thị của thuộc tính      | `"Màu sắc"`, `"Dung tích"`             |
| `attribute_name_en`   | VARCHAR(255) | Tên tiếng Anh (optional)         | `"Color"`, `"Size"`                    |
| `attribute_type`      | VARCHAR(50)  | Loại thuộc tính                  | `"SELECT"`, `"TEXT"`                   |
| `data_type`           | VARCHAR(50)  | Kiểu dữ liệu                     | `"STRING"`, `"NUMBER"`                 |
| `is_filterable`       | BOOLEAN      | Có thể dùng để lọc không         | `true`                                 |
| `is_searchable`       | BOOLEAN      | Có thể tìm kiếm không            | `false`                                |
| `is_required`         | BOOLEAN      | Bắt buộc phải có                 | `false`                                |
| `is_variant_specific` | BOOLEAN      | Dành riêng cho variant           | `true`                                 |
| `display_order`       | INTEGER      | Thứ tự hiển thị                  | `0`                                    |
| `icon_class`          | VARCHAR(100) | CSS class cho icon               | `"fa fa-palette"`                      |
| `color_code`          | VARCHAR(7)   | Mã màu hex                       | `"#FF5733"`                            |
| `validation_rules`    | TEXT         | Quy tắc validation (JSON)        | `{"min": 0, "max": 100}`               |
| `description`         | TEXT         | Mô tả chi tiết                   | `"Màu sắc của sản phẩm"`               |
| `help_text`           | TEXT         | Text hướng dẫn                   | `"Chọn màu sắc phù hợp"`               |
| `unit`                | VARCHAR(50)  | Đơn vị tính (ml, g, %, kg, cm)   | `"ml"`, `"g"`, `"%"`                   |
| `domain`              | VARCHAR(50)  | Phạm vi sử dụng                  | `"PERFUME"`, `"COSMETICS"`, `"COMMON"` |
| `status`              | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE)     | `"ACTIVE"`                             |
| `created_at`          | TIMESTAMP    | Thời gian tạo                    | `2025-12-03 10:00:00`                  |
| `updated_at`          | TIMESTAMP    | Thời gian cập nhật               | `2025-12-03 10:00:00`                  |

#### Bảng `attribute_options`

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
  - `attribute_key` phải unique trong bảng `attribute_types`
  - `(attribute_type_id, value)` phải unique trong bảng `attribute_options`
- **Check Constraint:**
  - `attribute_type` chỉ được là: `SELECT`, `MULTISELECT`, `RANGE`, `BOOLEAN`, `TEXT`
  - `data_type` chỉ được là: `STRING`, `NUMBER`, `DECIMAL`, `DATE`, `BOOLEAN`
  - `status` chỉ được là: `ACTIVE` hoặc `INACTIVE`
- **Foreign Key:**
  - `attribute_options.attribute_type_id` → `attribute_types.id` (CASCADE DELETE)

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

    /**
     * Phạm vi sử dụng của thuộc tính:
     * - PERFUME: Thuộc tính dùng cho Nước hoa
     * - COSMETICS: Thuộc tính dùng cho Mỹ phẩm
     * - COMMON: Dùng chung cho nhiều domain
     */
    @Column(name = "domain", length = 50)
    private String domain;

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
- **Field `domain`** để phân loại thuộc tính theo domain (PERFUME, COSMETICS, COMMON)

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
- Có `imageUrl` để hỗ trợ hiển thị ảnh cho value (ví dụ: màu sắc, swatch)
- **Field `isDefault`** để đánh dấu giá trị mặc định (chỉ cho phép 1 giá trị mặc định)

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
    /**
     * Phạm vi sử dụng của thuộc tính (PERFUME, COSMETICS, COMMON, ...)
     */
    private String domain;
    private String status;
    private List<AttributeValueDTO> values;
}
```

**Đặc điểm:**

- Chứa nested `List<AttributeValueDTO>` để hỗ trợ nested update
- Tất cả fields đều optional (trừ khi có validation)
- **Field `domain`** để phân loại thuộc tính

### DTO: `AttributeValueDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueDTO {
    private Long id;
    private Long attributeId;
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

    /**
     * Kiểm tra xem ProductAttribute có đang được sử dụng bởi ProductAttributeValue không
     */
    @Query("SELECT COUNT(pav) > 0 FROM ProductAttributeValue pav WHERE pav.attribute.id = :attributeId")
    boolean isUsedByProductAttributeValues(@Param("attributeId") Long attributeId);
}
```

**Đặc điểm:**

- Extends `JpaSpecificationExecutor` để hỗ trợ dynamic queries
- Custom methods để kiểm tra trùng `attributeKey`
- Method `isUsedByProductAttributeValues` để kiểm tra ràng buộc trước khi xóa

### Repository: `AttributeValueRepository.java`

```java
@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {

    List<AttributeValue> findByAttributeId(Long attributeId);

    boolean existsByAttributeIdAndValue(Long attributeId, String value);

    /**
     * Kiểm tra xem AttributeValue có đang được sử dụng bởi ProductAttributeValue không
     */
    @Query("SELECT COUNT(pav) > 0 FROM ProductAttributeValue pav WHERE pav.attributeValue.id = :valueId")
    boolean isUsedByProductAttributeValues(@Param("valueId") Long valueId);
}
```

**Đặc điểm:**

- Method `isUsedByProductAttributeValues` để kiểm tra value có đang được sử dụng không (trước khi xóa)

### Service: `ProductAttributeServiceImpl.java`

**Các phương thức chính:**

1. **`getAttributes(keyword, status, domain, pageable)`**

   - Tìm kiếm theo keyword (attributeName, attributeNameEn, attributeKey)
   - Lọc theo status
   - **Lọc theo domain** (PERFUME, COSMETICS, COMMON)
   - Phân trang và sắp xếp

2. **`createAttribute(attributeDTO)`**

   - Kiểm tra trùng `attributeKey`
   - **Validation: Nếu `is_variant_specific = TRUE`, thì `attribute_type` phải là SELECT**
   - Tự động tạo values nếu có trong DTO
   - **Validation: Chỉ cho phép 1 giá trị mặc định**

3. **`updateAttribute(id, attributeDTO)`** ⭐ **Nested Update**

   - Cập nhật thông tin attribute cha
   - **Validation: Nếu `is_variant_specific = TRUE`, thì `attribute_type` phải là SELECT**
   - Xử lý nested update cho values:
     - Value không có ID → INSERT (mới)
     - Value có ID và tồn tại trong DB → UPDATE
     - Value tồn tại trong DB nhưng không có trong payload → DELETE (nếu không bị ràng buộc)
   - Kiểm tra ràng buộc trước khi xóa values
   - **Validation: Chỉ cho phép 1 giá trị mặc định (tự động tắt các giá trị khác)**

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

    // Sau khi cập nhật/insert xong, xử lý logic isDefault
    // Tìm giá trị đầu tiên có isDefault = true
    AttributeValue defaultValue = attribute.getValues().stream()
            .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
            .findFirst()
            .orElse(null);

    // Nếu có giá trị mặc định, tắt tất cả các giá trị khác
    if (defaultValue != null) {
        attribute.getValues().forEach(v -> {
            if (v != defaultValue) {
                v.setIsDefault(false);
            }
        });
    }

    // Validation: Chỉ cho phép 1 giá trị mặc định
    validateOnlyOneDefaultValue(attribute);
}

/**
 * Validation: Đảm bảo chỉ có 1 giá trị mặc định cho mỗi attribute
 */
private void validateOnlyOneDefaultValue(ProductAttribute attribute) {
    long defaultCount = attribute.getValues().stream()
            .filter(value -> Boolean.TRUE.equals(value.getIsDefault()))
            .count();

    if (defaultCount > 1) {
        throw new IllegalArgumentException(
                "Chỉ được phép có 1 giá trị mặc định cho mỗi thuộc tính. Hiện tại có " + defaultCount + " giá trị được đánh dấu là mặc định."
        );
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
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String domain
    ) {
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductAttributeDTO> attributes = productAttributeService.getAttributes(keyword, status, domain, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thuộc tính thành công", attributes));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductAttributeDTO>>> getAllAttributes() {
        List<ProductAttributeDTO> attributes = productAttributeService.getAllAttributes();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thuộc tính thành công", attributes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> getAttribute(@PathVariable Long id) {
        ProductAttributeDTO attribute = productAttributeService.getAttribute(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thuộc tính thành công", attribute));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> createAttribute(
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        ProductAttributeDTO created = productAttributeService.createAttribute(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo thuộc tính thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAttributeDTO>> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody ProductAttributeDTO dto
    ) {
        ProductAttributeDTO updated = productAttributeService.updateAttribute(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thuộc tính thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long id) {
        productAttributeService.deleteAttribute(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thuộc tính thành công", null));
    }

    @GetMapping("/{id}/values")
    public ResponseEntity<ApiResponse<List<AttributeValueDTO>>> getAttributeValues(@PathVariable Long id) {
        List<AttributeValueDTO> values = productAttributeService.getAttributeValues(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách giá trị thuộc tính thành công", values));
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> createAttributeValue(
            @PathVariable Long id,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        AttributeValueDTO created = productAttributeService.createAttributeValue(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo giá trị thuộc tính thành công", created));
    }

    @PutMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<AttributeValueDTO>> updateAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId,
            @Valid @RequestBody AttributeValueDTO dto
    ) {
        AttributeValueDTO updated = productAttributeService.updateAttributeValue(id, valueId, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giá trị thuộc tính thành công", updated));
    }

    @DeleteMapping("/{id}/values/{valueId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttributeValue(
            @PathVariable Long id,
            @PathVariable Long valueId
    ) {
        productAttributeService.deleteAttributeValue(id, valueId);
        return ResponseEntity.ok(ApiResponse.success("Xóa giá trị thuộc tính thành công", null));
    }
}
```

**Đặc điểm:**

- Tất cả endpoints đều có `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
- Hỗ trợ cả nested update (PUT `/api/admin/attributes/{id}`) và individual value operations
- Sử dụng `@Valid` để validate DTO
- **Endpoint GET `/api/admin/attributes` hỗ trợ filter theo `domain`**

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
export type AttributeDomain = "PERFUME" | "COSMETICS" | "COMMON";

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
  domain?: AttributeDomain | null;
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
  unit?: string | null;
  status: AttributeStatus;
  values?: AttributeValue[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AttributeFilter {
  keyword?: string;
  status?: AttributeStatus;
  domain?: AttributeDomain | "ALL";
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
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
  domain: z.enum(["PERFUME", "COSMETICS", "COMMON"]).optional(),
  // ... other fields
  values: z.array(attributeValueSchema).optional().nullable(),
});
```

### Service: `attribute.service.ts`

```typescript
export const attributeService = {
  getAttributes: (params?: AttributeFilter) => {
    // GET /api/admin/attributes?page=0&size=10&keyword=...&status=...&domain=...
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

1. **Domain Tabs (PERFUME / COSMETICS):**

```typescript
<Tabs
  value={activeDomain}
  onValueChange={(val) => {
    const next = val as "PERFUME" | "COSMETICS" | "COMMON";
    setActiveDomain(next);
    form.setValue("domain", next, { shouldValidate: false });
  }}
>
  <TabsList>
    <TabsTrigger value="PERFUME">Nước hoa</TabsTrigger>
    <TabsTrigger value="COSMETICS">Mỹ phẩm</TabsTrigger>
  </TabsList>
</Tabs>
```

2. **Dynamic Field Array với `useFieldArray`:**

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
    displayOrder: fields.length,
    isDefault: false,
  });
};
```

3. **Auto-generate attributeKey:**

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

4. **Auto-generate value từ displayValue:**

```typescript
// Tự động copy displayValue → value (slugify)
useEffect(() => {
  allDisplayValues.forEach((val, index) => {
    if (val.displayValue && val.displayValue.trim() !== "") {
      const generatedValue = generateAttributeKey(val.displayValue);
      form.setValue(`values.${index}.value`, generatedValue, {
        shouldValidate: false,
      });
    }
    // Tự động set displayOrder theo index
    form.setValue(`values.${index}.displayOrder`, index, {
      shouldValidate: false,
    });
  });
}, [allDisplayValues, form]);
```

5. **Image Upload cho Attribute Values:**

```typescript
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
```

6. **Logic is_variant_specific:**

```typescript
// Tự động set attributeType về SELECT khi bật variantSpecific
useEffect(() => {
  if (variantSpecific === true && attributeType !== "SELECT") {
    form.setValue("attributeType", "SELECT", { shouldValidate: false });
  }
}, [variantSpecific, attributeType, form]);
```

7. **Validation isDefault (chỉ cho phép 1 giá trị mặc định):**

```typescript
const handleDefaultChange = (checked: boolean) => {
  // Nếu bật, tắt tất cả các giá trị khác
  if (checked) {
    const currentValues = form.getValues("values") || [];
    currentValues.forEach((val, idx) => {
      if (idx !== index) {
        form.setValue(`values.${idx}.isDefault`, false, {
          shouldValidate: false,
        });
      }
    });
  }
  field.onChange(checked);
};
```

8. **Unit Display:**

```typescript
// Hiển thị unit bên cạnh displayValue
{
  unitValue && (
    <span className="text-sm font-medium text-muted-foreground shrink-0">
      {unitValue}
    </span>
  );
}
```

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

| Parameter   | Type   | Required | Default        | Description                                 |
| ----------- | ------ | -------- | -------------- | ------------------------------------------- |
| `page`      | int    | No       | `0`            | Số trang (0-based)                          |
| `size`      | int    | No       | `10`           | Số lượng items mỗi trang                    |
| `sortBy`    | string | No       | `displayOrder` | Field để sort                               |
| `direction` | string | No       | `ASC`          | `ASC` hoặc `DESC`                           |
| `keyword`   | string | No       | -              | Tìm kiếm theo tên/mã                        |
| `status`    | string | No       | -              | `ACTIVE` hoặc `INACTIVE`                    |
| `domain`    | string | No       | -              | `PERFUME`, `COSMETICS`, `COMMON` hoặc `ALL` |

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
        "domain": "PERFUME",
        "status": "ACTIVE",
        "values": [
          {
            "id": 1,
            "value": "red",
            "displayValue": "Đỏ",
            "hexColor": "#FF0000",
            "displayOrder": 0,
            "isDefault": true
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
      "attributeType": "SELECT",
      "domain": "PERFUME"
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
    "domain": "PERFUME",
    "unit": "ml",
    "values": [
      {
        "id": 1,
        "value": "red",
        "displayValue": "Đỏ",
        "hexColor": "#FF0000",
        "imageUrl": "https://...",
        "isDefault": true
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
  "domain": "PERFUME",
  "unit": "ml",
  "status": "ACTIVE",
  "values": [
    {
      "value": "red",
      "displayValue": "Đỏ",
      "hexColor": "#FF0000",
      "imageUrl": "https://...",
      "displayOrder": 0,
      "isDefault": true
    },
    {
      "value": "blue",
      "displayValue": "Xanh",
      "hexColor": "#0000FF",
      "displayOrder": 1,
      "isDefault": false
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
  "domain": "PERFUME",
  "values": [
    {
      "id": 1,
      "value": "red",
      "displayValue": "Đỏ (Updated)",
      "hexColor": "#FF0000",
      "isDefault": true
    },
    {
      "value": "green",
      "displayValue": "Xanh lá",
      "hexColor": "#00FF00",
      "isDefault": false
    }
  ]
}
```

**Logic:**

- Value có `id: 1` → UPDATE value có ID = 1
- Value không có `id` → INSERT value mới
- Value có ID = 2 trong DB nhưng không có trong payload → DELETE (nếu không bị ràng buộc)
- **Nếu có giá trị mặc định (isDefault = true), tự động tắt tất cả các giá trị khác**

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
  "message": "Không thể xóa thuộc tính này vì đã có sản phẩm đang sử dụng. Vui lòng cập nhật hoặc xóa các sản phẩm liên quan trước.",
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
      "hexColor": "#FF0000",
      "imageUrl": "https://...",
      "isDefault": true
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
  "displayOrder": 2,
  "isDefault": false
}
```

**Lưu ý:** Nếu set `isDefault = true`, hệ thống sẽ tự động tắt tất cả các giá trị khác.

#### 9. PUT `/api/admin/attributes/{id}/values/{valueId}`

Cập nhật value.

**Request Body:**

```json
{
  "displayValue": "Vàng (Updated)",
  "hexColor": "#FFFF00",
  "isDefault": true
}
```

**Lưu ý:** Nếu set `isDefault = true`, hệ thống sẽ tự động tắt tất cả các giá trị khác.

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

### 1. Domain (Phạm vi sử dụng) ⚠️

**Mô tả:**

Trường `domain` được thêm vào bảng `attribute_types` để phân loại thuộc tính theo domain sử dụng.

**Giá trị:**

- **PERFUME:** Thuộc tính dùng cho Nước hoa
- **COSMETICS:** Thuộc tính dùng cho Mỹ phẩm
- **COMMON:** Dùng chung cho nhiều domain

**Tại sao cần:**

- Tách biệt thuộc tính Nước hoa và Mỹ phẩm trong Admin
- Dễ dàng filter và quản lý theo domain
- Tránh nhầm lẫn khi tạo sản phẩm

**Implementation:**

- **Database:** Cột `domain VARCHAR(50)` trong bảng `attribute_types`
- **Backend:** Field `domain` trong Entity và DTO
- **Frontend:** Tabs để chọn domain (PERFUME / COSMETICS) trong form
- **API:** Filter theo `domain` trong endpoint GET `/api/admin/attributes`

**Migration:**

```sql
-- V14__add_domain_to_attribute_types.sql
ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS domain VARCHAR(50);

COMMENT ON COLUMN attribute_types.domain IS 'Phạm vi sử dụng của thuộc tính (ví dụ: PERFUME, COSMETICS, COMMON). Dùng để tách Thuộc tính Nước hoa và Mỹ phẩm trong Admin.';
```

### 2. Unit (Đơn vị tính) ⚠️

**Mô tả:**

Trường `unit` được thêm vào bảng `attribute_types` để hỗ trợ hiển thị đơn vị cho các giá trị thuộc tính.

**Tại sao cần:**

- Nếu không có `unit`, khi hiển thị giá trị `100` ra ngoài frontend, khách hàng sẽ không biết là `100ml` hay `100g`.
- Không nên bắt người dùng nhập chữ "ml" vào trong trường `display_value` của từng giá trị con (dễ sai sót và khó lọc).

**Implementation:**

- **Database:** Cột `unit VARCHAR(50)` trong bảng `attribute_types`
- **Backend:** Field `unit` trong Entity và DTO
- **Frontend:** Field "Đơn vị tính" (Optional) trong form, hiển thị bên cạnh `displayValue`

**Ví dụ:**

- Attribute "Dung tích" → `unit = "ml"` → Hiển thị: `"100ml"`
- Attribute "Trọng lượng" → `unit = "g"` → Hiển thị: `"500g"`
- Attribute "Tỷ lệ" → `unit = "%"` → Hiển thị: `"15%"`

**Migration:**

```sql
-- V13__add_unit_to_product_attributes.sql
ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

COMMENT ON COLUMN attribute_types.unit IS 'Đơn vị tính của thuộc tính (ví dụ: ml, g, %, kg, cm). Dùng để hiển thị kèm với giá trị thuộc tính.';
```

### 3. Logic is_variant_specific ⚠️

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
      "Thuộc tính dùng cho biến thể (is_variant_specific = true) chỉ có thể có loại SELECT. " +
        "Một sản phẩm không thể có nhiều giá trị biến thể cùng lúc (ví dụ: không thể vừa 50ml vừa 100ml)."
    );
  }
}
```

### 4. Validation isDefault (Chỉ cho phép 1 giá trị mặc định) ⚠️

**Mô tả:**

Hệ thống đảm bảo chỉ có **1 giá trị mặc định** (`isDefault = true`) cho mỗi attribute.

**Logic:**

- Khi set một giá trị thành `isDefault = true`, hệ thống tự động tắt tất cả các giá trị khác (`isDefault = false`).
- Nếu có nhiều hơn 1 giá trị mặc định, hệ thống sẽ throw exception.

**Backend Implementation:**

```java
// Sau khi cập nhật/insert xong, xử lý logic isDefault
AttributeValue defaultValue = attribute.getValues().stream()
        .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
        .findFirst()
        .orElse(null);

// Nếu có giá trị mặc định, tắt tất cả các giá trị khác
if (defaultValue != null) {
    attribute.getValues().forEach(v -> {
        if (v != defaultValue) {
            v.setIsDefault(false);
        }
    });
}

// Validation: Chỉ cho phép 1 giá trị mặc định
validateOnlyOneDefaultValue(attribute);
```

**Frontend Implementation:**

```typescript
const handleDefaultChange = (checked: boolean) => {
  // Nếu bật, tắt tất cả các giá trị khác
  if (checked) {
    const currentValues = form.getValues("values") || [];
    currentValues.forEach((val, idx) => {
      if (idx !== index) {
        form.setValue(`values.${idx}.isDefault`, false, {
          shouldValidate: false,
        });
      }
    });
  }
  field.onChange(checked);
};
```

### 5. Image URL trong Attribute Values ⚠️

**Mô tả:**

Hỗ trợ `imageUrl` để mô tả giá trị thuộc tính (swatch images).

**Use Cases:**

- **Image URL:** Dùng cho pattern/texture (ví dụ: Màu gỗ vân sồi, Màu đá Marble)
- **Hex Color:** Dùng cho màu đơn sắc (ví dụ: Đỏ #FF0000, Xanh #0000FF)

**Frontend Implementation:**

- Component `ImageUpload` được sử dụng để upload ảnh swatch (mẫu thử) nhỏ.
- Kích thước khuyến nghị: 100x100px
- Folder: `attributes/swatches` (sử dụng ImageEntityType "others")

**Code Example:**

```typescript
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
```

### 6. Nested Update (Master-Detail)

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
    { "id": 1, "displayValue": "Đỏ (Updated)", "isDefault": true },  // UPDATE
    { "displayValue": "Xanh" },                     // INSERT
    // Value có ID = 2 không có trong array → DELETE
  ]
}
```

### 7. Auto-generate attributeKey

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

### 8. Auto-generate value từ displayValue

**Mô tả:**

Tự động tạo `value` (internal value) từ `displayValue` khi user nhập tên hiển thị.

**Logic:**

- Sử dụng cùng logic với `generateAttributeKey`
- Tự động set `displayOrder` theo index

**Ví dụ:**

- `displayValue = "Đỏ"` → `value = "do"`
- `displayValue = "100ml"` → `value = "100ml"`

### 9. Dynamic Field Array với useFieldArray

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
    displayOrder: fields.length,
    isDefault: false,
  });
};

// Xóa value
const removeValue = (index: number) => {
  remove(index);
};
```

### 10. Constraint Checking

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

### 11. Category-Attribute Binding ⚠️ **QUAN TRỌNG**

**Mô tả:**

Hệ thống hỗ trợ gán attributes vào categories thông qua bảng trung gian `category_attributes`. Điều này cho phép:

- Mỗi category có thể có nhiều attributes
- Mỗi attribute có thể được gán vào nhiều categories
- Khi tạo sản phẩm, form chỉ hiển thị attributes đã được gán vào category của sản phẩm

**Database Schema:**

```sql
CREATE TABLE category_attributes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(category_id, attribute_id)
);
```

**Backend Implementation:**

- ✅ Entity: `CategoryAttribute.java`
- ✅ Repository: `CategoryAttributeRepository.java`
- ✅ Service: `CategoryAttributeService.java`
- ✅ Controller: `CategoryAttributeController.java` với endpoints:
  - `GET /api/admin/category-attributes/{categoryId}` - Lấy attributes của category
  - `POST /api/admin/category-attributes` - Gán attribute vào category
  - `PUT /api/admin/category-attributes/{categoryId}/{attributeId}` - Cập nhật metadata (required, displayOrder, groupName)
  - `DELETE /api/admin/category-attributes/{categoryId}/{attributeId}` - Xóa binding
  - `GET /api/admin/category-attributes/{categoryId}/for-product` - Lấy attributes cho Product Form (grouped, chỉ Product Attributes)

**Frontend Status:**

- ✅ **ĐÃ TÍCH HỢP** - CategoryFormSheet có tab "Cấu hình thuộc tính" với `CategoryAttributesSection`
- ✅ **ĐÃ IMPLEMENT** - Service, hooks, và UI component để quản lý category-attribute binding
- ✅ **ĐÃ IMPLEMENT** - Input `groupName` để group attributes
- ⚠️ **PENDING** - API endpoint `for-product` và Dynamic Product Form (xem [Dynamic Product Form Analysis](./ATTRIBUTE_DYNAMIC_FORM_ANALYSIS.md))

**Lợi ích:**

- Khi tạo sản phẩm, form chỉ hiển thị attributes liên quan đến category
- Dễ dàng validate attributes của sản phẩm dựa trên category-attribute binding
- Quản lý metadata (required, display_order, group_name) cho từng category-attribute pair
- Group attributes theo logic nghiệp vụ (ví dụ: "Mùi hương", "Thông số")

**Phân loại Attributes:**

- **Product Attributes** (`is_variant_specific = false`): Hiển thị trong Product Form
- **Variant Attributes** (`is_variant_specific = true`): Xử lý ở Variant Generator module riêng

**Ví dụ:**

- Category "Nước hoa Nam" → Attributes: "Dung tích", "Nồng độ", "Mùi hương"
- Category "Mỹ phẩm" → Attributes: "Trọng lượng", "Thành phần", "Xuất xứ"

**Xem thêm:**

- [Category-Attribute Binding Analysis](./completed/ATTRIBUTE_CATEGORY_BINDING_ANALYSIS.md) - Phân tích chi tiết vấn đề và giải pháp (Archived - Đã hoàn thành)

---

## 🔄 Migration & Database

### Initial Schema

Schema đã được tạo trong `V1__init_schema.sql`:

- Bảng `attribute_types` (tên trong DB)
- Bảng `attribute_options` (tên trong DB)
- Indexes và foreign keys

### Additional Migrations

#### V15: Add Group Name to Category Attributes

**File:** `V15__add_group_name_to_category_attributes.sql`

**Purpose:** Thêm cột `group_name` để group attributes khi hiển thị trong Product Form

**Migration:**

```sql
-- Add group_name column to category_attributes
ALTER TABLE category_attributes
ADD COLUMN IF NOT EXISTS group_name VARCHAR(100);

COMMENT ON COLUMN category_attributes.group_name IS
'Tên nhóm để group các attributes khi hiển thị trong Product Form.
Ví dụ: "Mùi hương", "Thông số", "Màu sắc".
Nếu NULL, attributes sẽ được group theo domain (PERFUME/COSMETICS/COMMON).';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_category_attributes_group_name
ON category_attributes(category_id, group_name)
WHERE group_name IS NOT NULL;
```

**Impact:**

- Admin có thể cấu hình group khi gán attribute vào category
- Attributes được group logic hơn trong Product Form
- Fallback to domain nếu `group_name` là NULL

#### V13: Add Unit Column

```sql
-- V13__add_unit_to_product_attributes.sql
ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

COMMENT ON COLUMN attribute_types.unit IS 'Đơn vị tính của thuộc tính (ví dụ: ml, g, %, kg, cm). Dùng để hiển thị kèm với giá trị thuộc tính.';

CREATE INDEX IF NOT EXISTS idx_attributes_unit ON attribute_types(unit) WHERE unit IS NOT NULL;
```

#### V14: Add Domain Column

```sql
-- V14__add_domain_to_attribute_types.sql
ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS domain VARCHAR(50);

COMMENT ON COLUMN attribute_types.domain IS 'Phạm vi sử dụng của thuộc tính (ví dụ: PERFUME, COSMETICS, COMMON). Dùng để tách Thuộc tính Nước hoa và Mỹ phẩm trong Admin.';
```

---

## 💻 Code Examples

### Backend: Tạo Attribute với Values

```java
ProductAttributeDTO dto = ProductAttributeDTO.builder()
    .attributeKey("color")
    .attributeName("Màu sắc")
    .attributeType("SELECT")
    .dataType("STRING")
    .domain("PERFUME")
    .unit("ml")
    .status("ACTIVE")
    .values(Arrays.asList(
        AttributeValueDTO.builder()
            .value("red")
            .displayValue("Đỏ")
            .hexColor("#FF0000")
            .displayOrder(0)
            .isDefault(true)
            .build(),
        AttributeValueDTO.builder()
            .value("blue")
            .displayValue("Xanh")
            .hexColor("#0000FF")
            .displayOrder(1)
            .isDefault(false)
            .build()
    ))
    .build();

ProductAttributeDTO created = productAttributeService.createAttribute(dto);
```

### Backend: Nested Update

```java
ProductAttributeDTO dto = ProductAttributeDTO.builder()
    .attributeName("Màu sắc (Updated)")
    .domain("PERFUME")
    .values(Arrays.asList(
        // UPDATE: Value có ID
        AttributeValueDTO.builder()
            .id(1L)
            .displayValue("Đỏ (Updated)")
            .isDefault(true)
            .build(),
        // INSERT: Value không có ID
        AttributeValueDTO.builder()
            .value("green")
            .displayValue("Xanh lá")
            .hexColor("#00FF00")
            .isDefault(false)
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
    domain: "PERFUME",
    unit: "ml",
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

---

## 🧪 Testing Guide

### Test Cases

#### 1. Tạo Attribute Mới

**Steps:**

1. Vào `/admin/attributes`
2. Click "Thêm thuộc tính"
3. Chọn domain: `PERFUME` hoặc `COSMETICS`
4. Nhập:
   - Tên thuộc tính: `"Màu sắc"`
   - Mã thuộc tính: Tự động tạo `"mau-sac"`
   - Loại thuộc tính: `SELECT`
   - Đơn vị tính: `"ml"` (optional)
5. Thêm values:
   - Value 1: `displayValue="Đỏ"`, `hexColor="#FF0000"`, `isDefault=true`
   - Value 2: `displayValue="Xanh"`, `hexColor="#0000FF"`, `isDefault=false`
6. Click "Tạo mới"

**Expected:**

- Attribute được tạo thành công với domain đã chọn
- 2 values được tạo kèm theo
- Chỉ có 1 giá trị mặc định (isDefault = true)
- Hiển thị trong danh sách

#### 2. Nested Update

**Steps:**

1. Edit attribute vừa tạo
2. Sửa `displayValue` của value "Đỏ" thành "Đỏ (Updated)"
3. Thêm value mới: `displayValue="Xanh lá"`
4. Xóa value "Xanh" (remove khỏi form)
5. Click "Cập nhật"

**Expected:**

- Value "Đỏ" được UPDATE
- Value "Xanh lá" được INSERT
- Value "Xanh" được DELETE (nếu không bị ràng buộc)

#### 3. Validation isDefault

**Steps:**

1. Tạo attribute với 2 values
2. Set cả 2 values đều có `isDefault = true`
3. Click "Tạo mới"

**Expected:**

- Backend throw exception: "Chỉ được phép có 1 giá trị mặc định"
- Frontend tự động tắt giá trị mặc định khác khi bật một giá trị

#### 4. Logic is_variant_specific

**Steps:**

1. Tạo attribute mới
2. Tích chọn "Dùng cho biến thể"
3. Thử chọn `attributeType` khác `SELECT`

**Expected:**

- `attributeType` tự động set về `SELECT`
- Dropdown `attributeType` bị disable

#### 5. Domain Filter

**Steps:**

1. Tạo 2 attributes:
   - Attribute 1: `domain = "PERFUME"`
   - Attribute 2: `domain = "COSMETICS"`
2. Filter theo `domain = "PERFUME"`

**Expected:**

- Chỉ hiển thị Attribute 1
- Attribute 2 không hiển thị

#### 6. Image Upload cho Attribute Values

**Steps:**

1. Tạo attribute type `SELECT`
2. Thêm value với `imageUrl` (upload ảnh swatch)

**Expected:**

- Ảnh được upload thành công
- Hiển thị preview trong form
- URL được lưu vào `imageUrl`

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
   - Verify domain filter

2. **Frontend Integration:**
   - Test form validation
   - Test dynamic field array
   - Test auto-generate attributeKey
   - Test domain tabs
   - Test isDefault validation

---

## 📝 Notes & Best Practices

### Backend

1. **Nested Update:**

   - Luôn kiểm tra ràng buộc trước khi xóa values
   - Sử dụng `orphanRemoval = true` để tự động xóa values khi xóa attribute
   - **Validation: Chỉ cho phép 1 giá trị mặc định**

2. **Validation:**

   - Validate cả attribute cha và values
   - Kiểm tra unique constraint cho `attributeKey` và `(attribute_id, value)`
   - **Validation: Nếu `is_variant_specific = TRUE`, thì `attribute_type` phải là SELECT**

3. **Performance:**
   - Sử dụng `FetchType.LAZY` cho relationship
   - Sử dụng `@EntityGraph` hoặc `JOIN FETCH` khi cần eager load values

### Frontend

1. **Form Management:**

   - Sử dụng `useFieldArray` cho dynamic nested forms
   - Validate từng value trong array
   - **Tự động tắt các giá trị mặc định khác khi bật một giá trị**

2. **User Experience:**

   - Auto-generate `attributeKey` nhưng cho phép user override
   - Auto-generate `value` từ `displayValue`
   - **Domain tabs để dễ dàng chọn domain**
   - Loading states và error handling

3. **Performance:**
   - Lazy load form component
   - Debounce search input
   - Optimistic updates với React Query

---

## 🔗 Related Documentation

- [Category-Attribute Binding Analysis](./completed/ATTRIBUTE_CATEGORY_BINDING_ANALYSIS.md) - Phân tích vấn đề thiếu "Cây Cầu" kết nối và giải pháp (Archived - Đã hoàn thành)
- [Concentration Management Documentation](./CONCENTRATION_MANAGEMENT_DOCUMENTATION.md)
- [User Management Documentation](./USER_MANAGEMENT_DOCUMENTATION.md)
- [Brand Management Documentation](./BRAND_MANAGEMENT_DOCUMENTATION.md)
- [Category Management Documentation](./CATEGORY_MANAGEMENT_DOCUMENTATION.md)
- [Image Management Documentation](./IMAGE_MANAGEMENT_DOCUMENTATION.md)

---

**End of Documentation**
