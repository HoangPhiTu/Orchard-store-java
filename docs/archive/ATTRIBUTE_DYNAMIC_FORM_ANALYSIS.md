# Phân Tích & Giải Pháp: Dynamic Product Form với Attribute System

**Ngày tạo:** 2025-12-03  
**Mục tiêu:** Phân tích Attribute Module hiện tại và đề xuất giải pháp Dynamic Product Form  
**Trạng thái:** 🟡 Analysis & Planning

---

## ⚠️ Critical Gaps (Các Điểm Quan Trọng Cần Giải Quyết)

### Gap 1: Phân Loại Attribute (Variant vs Product)

**Vấn đề:**

- Hệ thống cần phân biệt attribute nào dùng để sinh biến thể (SKU) và attribute nào chỉ là thông tin bổ sung
- **Variant Attribute** (`is_variant_specific = true`): Dùng để tạo ra nhiều SKU khác nhau
  - Ví dụ: "Dung tích" → Tạo ra SKU "50ml" và "100ml"
- **Product Attribute** (`is_variant_specific = false`): Thông tin chung cho tất cả variants
  - Ví dụ: "Độ lưu hương" → Giống nhau ở cả 2 SKU

**Giải pháp:**

- ✅ **Dynamic Product Form chỉ render Product Attributes** (`is_variant_specific = false`)
- ✅ **Variant Attributes sẽ được xử lý ở module "Variant Generator" riêng biệt**
- ✅ Backend API filter `is_variant_specific = false` khi trả về attributes cho Product Form

**Impact:**

- Tránh confusion: User không nhập variant attributes ở Product Form
- Clear separation: Product attributes vs Variant attributes
- Scalable: Dễ mở rộng Variant Generator module sau này

### Gap 2: Attribute Grouping (Database Schema)

**Vấn đề:**

- Hiện tại không có cách để group attributes theo logic nghiệp vụ
- Ví dụ: "Hương đầu", "Hương giữa", "Hương cuối" nên thuộc nhóm "Mùi hương"
- Grouping theo Domain (PERFUME/COSMETICS) quá rộng, không đủ chi tiết

**Giải pháp:**

- ✅ **Thêm cột `group_name` vào bảng `category_attributes`**
- ✅ Admin có thể cấu hình group khi gán attribute vào category
- ✅ Backend API group attributes theo `group_name` khi trả về
- ✅ Frontend render theo groups thay vì flat list

**Database Migration:**

```sql
ALTER TABLE category_attributes
ADD COLUMN group_name VARCHAR(100);

COMMENT ON COLUMN category_attributes.group_name IS
'Tên nhóm để group các attributes khi hiển thị trong Product Form.
Ví dụ: "Mùi hương", "Thông số", "Màu sắc".
Nếu NULL, attributes sẽ được group theo domain.';
```

**Impact:**

- Better UX: Attributes được group logic hơn
- Flexible: Admin có thể tự cấu hình grouping
- Maintainable: Dễ thêm/sửa/xóa groups

---

## 📊 Phân Tích Hiện Trạng (Current State Analysis)

### ✅ Những gì ĐÃ CÓ (What We Have)

#### 1. Backend Infrastructure

**Database Schema:**

- ✅ `attribute_types` (ProductAttribute): Quản lý định nghĩa attributes
- ✅ `attribute_options` (AttributeValue): Quản lý giá trị của attributes
- ✅ `category_attributes` (CategoryAttribute): Binding table giữa Category và Attribute
- ✅ `product_attributes` (ProductAttributeValue): Lưu giá trị attribute của sản phẩm

**Key Features:**

- ✅ Domain-based attributes (PERFUME, COSMETICS, COMMON)
- ✅ Multiple attribute types (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)
- ✅ Data types (STRING, NUMBER, DECIMAL, DATE, BOOLEAN)
- ✅ Variant-specific attributes (`is_variant_specific`)
- ✅ Unit field (ml, g, %, kg, cm)
- ✅ Validation rules (JSON)
- ✅ Required flag per category (`is_required` trong CategoryAttribute)
- ✅ Display order per category (`display_order` trong CategoryAttribute)

**API Endpoints:**

- ✅ `GET /api/admin/category-attributes/{categoryId}` - Lấy attributes của category
- ✅ `POST /api/admin/category-attributes` - Gán attribute vào category
- ✅ `PUT /api/admin/category-attributes/{categoryId}/{attributeId}` - Update metadata
- ✅ `DELETE /api/admin/category-attributes/{categoryId}/{attributeId}` - Xóa binding

#### 2. Frontend Infrastructure

**Components:**

- ✅ `CategoryAttributesSection` - Quản lý attributes của category
- ✅ `AttributeFormSheet` - Tạo/sửa attributes
- ✅ Integration với CategoryFormSheet (Tabs)

**Hooks & Services:**

- ✅ `useCategoryAttributes()` - Query attributes của category
- ✅ `useAllAttributes()` - Query tất cả attributes
- ✅ `categoryAttributeService` - Service layer

**UI/UX:**

- ✅ Command (Combobox) với search/filter
- ✅ Domain filter (PERFUME/COSMETICS/COMMON)
- ✅ Metadata editing (required, displayOrder)

### ❌ Những gì CÒN THIẾU (What We're Missing)

#### 1. Product Form Integration

**Missing:**

- ❌ API endpoint để lấy attributes cho Product Form
- ❌ Component để render dynamic attributes trong Product Form
- ❌ Logic để group attributes theo domain hoặc custom grouping
- ❌ Validation logic cho attributes trong Product Form
- ❌ UI components cho từng loại attribute (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)

#### 2. Attribute Grouping

**Missing:**

- ❌ Không có concept "Attribute Group" trong database
- ❌ Không có UI để group attributes khi hiển thị
- ❌ Không có logic để tự động group dựa trên domain hoặc metadata

#### 3. Product Attribute Value Management

**Missing:**

- ❌ Frontend component để nhập giá trị attributes cho product
- ❌ Logic để handle variant-specific attributes
- ❌ UI để preview attribute values (color swatches, images)

---

## 🎯 Giải Pháp Đề Xuất (Proposed Solution)

### 1. Kiến Trúc Tổng Thể (Architecture Overview)

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Form (Unified)                   │
├─────────────────────────────────────────────────────────────┤
│  Section 1: Thông tin chung (Fixed)                        │
│  - Tên sản phẩm                                             │
│  - SKU                                                       │
│  - Giá                                                       │
│  - Kho                                                       │
│  - Ảnh                                                       │
│  - SEO                                                       │
├─────────────────────────────────────────────────────────────┤
│  Section 2: Đặc tính sản phẩm (Dynamic)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Group: Hương thơm (PERFUME)                        │   │
│  │  - Mùi hương (SELECT)                               │   │
│  │  - Độ lưu hương (SELECT)                            │   │
│  │  - Nồng độ (SELECT)                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Group: Thông số (COMMON)                           │   │
│  │  - Dung tích (SELECT + Unit: ml)                    │   │
│  │  - Trọng lượng (NUMBER + Unit: g)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Group: Màu sắc (COSMETICS)                         │   │
│  │  - Màu sắc (MULTISELECT + Color Picker)             │   │
│  │  - Chất son (SELECT)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Backend Enhancements

#### 2.1. Database Migration: Thêm `group_name`

**Migration Script:** `V15__add_group_name_to_category_attributes.sql`

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

**Update Entity:**

```java
@Column(name = "group_name", length = 100)
private String groupName;
```

**Update DTO:**

```java
private String groupName;
```

#### 2.2. API Endpoint mới

**Endpoint:** `GET /api/admin/category-attributes/{categoryId}/for-product`

**Requirements:**

- ✅ **Chỉ trả về Product Attributes** (`is_variant_specific = false`)
- ✅ **Group attributes theo `group_name`** (nếu NULL thì group theo domain)
- ✅ **Sort attributes trong mỗi group theo `display_order`**
- ✅ **Include attribute values** (để render dropdown/select)

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "attributeKey": "dung-tich",
      "attributeName": "Dung tích",
      "attributeType": "SELECT",
      "dataType": "STRING",
      "unit": "ml",
      "required": true,
      "displayOrder": 0,
      "values": [
        {
          "id": 1,
          "value": "50",
          "displayValue": "50ml",
          "hexColor": null,
          "imageUrl": null
        },
        {
          "id": 2,
          "value": "100",
          "displayValue": "100ml",
          "hexColor": null,
          "imageUrl": null
        }
      ],
      "validationRules": {
        "min": 0,
        "max": 1000
      },
      "helpText": "Chọn dung tích sản phẩm"
    }
  ],
  "message": "Lấy danh sách thuộc tính thành công"
}
```

**Implementation:**

```java
@GetMapping("/{categoryId}/for-product")
public ResponseEntity<ApiResponse<Map<String, List<ProductAttributeDTO>>>> getAttributesForProduct(
        @PathVariable Long categoryId
) {
    // Get all category attributes
    List<CategoryAttribute> categoryAttributes =
        categoryAttributeService.getAttributesByCategory(categoryId);

    // Filter: Chỉ lấy Product Attributes (is_variant_specific = false)
    // Variant Attributes sẽ được xử lý ở Variant Generator module
    List<CategoryAttribute> productAttributes = categoryAttributes.stream()
        .filter(ca -> !Boolean.TRUE.equals(ca.getAttribute().getVariantSpecific()))
        .sorted(Comparator.comparing(CategoryAttribute::getDisplayOrder))
        .collect(Collectors.toList());

    // Group by group_name (nếu NULL thì dùng domain)
    Map<String, List<ProductAttributeDTO>> grouped = productAttributes.stream()
        .map(ca -> {
            ProductAttributeDTO dto = productAttributeMapper.toDTO(ca.getAttribute());
            // Include metadata from CategoryAttribute
            dto.setRequired(ca.getRequired());
            dto.setDisplayOrder(ca.getDisplayOrder());
            dto.setGroupName(ca.getGroupName()); // Include group name
            return dto;
        })
        .collect(Collectors.groupingBy(
            dto -> {
                // Group by group_name, fallback to domain if null
                if (dto.getGroupName() != null && !dto.getGroupName().trim().isEmpty()) {
                    return dto.getGroupName();
                }
                // Fallback to domain
                return dto.getDomain() != null ? dto.getDomain() : "COMMON";
            }
        ));

    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách thuộc tính thành công", grouped)
    );
}
```

**Response Format (Grouped):**

```json
{
  "success": true,
  "data": {
    "Mùi hương": [
      {
        "id": 1,
        "attributeKey": "huong-dau",
        "attributeName": "Hương đầu",
        "attributeType": "SELECT",
        "required": true,
        "displayOrder": 0,
        "groupName": "Mùi hương",
        "values": [...]
      },
      {
        "id": 2,
        "attributeKey": "huong-giua",
        "attributeName": "Hương giữa",
        "attributeType": "SELECT",
        "required": true,
        "displayOrder": 1,
        "groupName": "Mùi hương",
        "values": [...]
      }
    ],
    "Thông số": [
      {
        "id": 3,
        "attributeKey": "dung-tich",
        "attributeName": "Dung tích",
        "attributeType": "SELECT",
        "required": true,
        "displayOrder": 0,
        "groupName": "Thông số",
        "values": [...]
      }
    ],
    "PERFUME": [
      {
        "id": 4,
        "attributeKey": "do-luu-huong",
        "attributeName": "Độ lưu hương",
        "attributeType": "SELECT",
        "required": false,
        "displayOrder": 0,
        "groupName": null,
        "domain": "PERFUME",
        "values": [...]
      }
    ]
  },
  "message": "Lấy danh sách thuộc tính thành công"
}
```

#### 2.3. Update CategoryAttribute Entity & DTO

**Entity Update:**

```java
@Column(name = "group_name", length = 100)
private String groupName;
```

**DTO Update:**

```java
private String groupName;
```

**Service Update:**

```java
// Update assignAttributeToCategory để nhận groupName
public CategoryAttributeDTO assignAttributeToCategory(CategoryAttributeDTO dto) {
    // ... existing code ...
    categoryAttribute.setGroupName(dto.getGroupName());
    // ... existing code ...
}
```

### 3. Frontend Implementation

#### 3.1. Component Structure

```
product-form-sheet.tsx
├── BasicInfoSection (Fixed)
│   ├── Name
│   ├── SKU
│   ├── Price
│   ├── Stock
│   ├── Images
│   └── SEO
│
└── DynamicAttributesSection (Dynamic)
    ├── AttributeGroup (Reusable)
    │   ├── GroupHeader
    │   └── AttributeField (Reusable)
    │       ├── SELECT → SelectField
    │       ├── MULTISELECT → MultiSelectField
    │       ├── RANGE → RangeField
    │       ├── BOOLEAN → SwitchField
    │       └── TEXT → InputField
    │
    └── AttributeFieldRenderer (Factory Pattern)
```

#### 3.2. Service Method: `getAttributesForProduct`

```typescript
// category-attribute.service.ts
getAttributesForProduct: (
  categoryId: number
): Promise<Record<string, ProductAttribute[]>> => {
  return http
    .get<ApiResponse<Record<string, ProductAttribute[]>>>(
      `${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}/for-product`
    )
    .then((res) => res.data ?? {});
},
```

#### 3.3. Hook mới: `useCategoryAttributesForProduct`

```typescript
export const useCategoryAttributesForProduct = (categoryId: number | null) => {
  return useQuery<Record<string, ProductAttribute[]>, Error>({
    queryKey: ["admin", "category-attributes", "for-product", categoryId],
    queryFn: () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }
      return categoryAttributeService.getAttributesForProduct(categoryId);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### 3.4. Hook: `useDynamicAttributes` (Logic Layer)

```typescript
import { useMemo } from "react";
import { useCategoryAttributesForProduct } from "@/hooks/use-category-attributes";
import type { ProductAttribute } from "@/types/attribute.types";

interface AttributeGroup {
  groupName: string;
  attributes: ProductAttribute[];
}

export const useDynamicAttributes = (categoryId: number | null) => {
  const {
    data: groupedAttributes,
    isLoading,
    error,
  } = useCategoryAttributesForProduct(categoryId);

  // Transform grouped data into array of groups
  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    if (!groupedAttributes) return [];

    return Object.entries(groupedAttributes)
      .map(([groupName, attributes]) => ({
        groupName,
        attributes: attributes.sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        ),
      }))
      .sort((a, b) => {
        // Sort groups: Custom groups first, then domain groups
        const aIsCustom = !["PERFUME", "COSMETICS", "COMMON"].includes(
          a.groupName
        );
        const bIsCustom = !["PERFUME", "COSMETICS", "COMMON"].includes(
          b.groupName
        );

        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
        return a.groupName.localeCompare(b.groupName);
      });
  }, [groupedAttributes]);

  return {
    attributeGroups,
    isLoading,
    error,
    hasAttributes: attributeGroups.length > 0,
  };
};
```

#### 3.5. Function: `generateZodSchema` (Validation Logic)

```typescript
import { z } from "zod";
import type { ProductAttribute } from "@/types/attribute.types";

export function generateZodSchema(
  attributeGroups: AttributeGroup[]
): z.ZodObject<any> {
  const attributeValidations: Record<string, z.ZodTypeAny> = {};

  attributeGroups.forEach((group) => {
    group.attributes.forEach((attr) => {
      const fieldName = `attributes.${attr.attributeKey}`;
      let fieldSchema: z.ZodTypeAny;

      switch (attr.attributeType) {
        case "SELECT":
          fieldSchema = z.string();
          if (attr.required) {
            fieldSchema = fieldSchema.min(
              1,
              `${attr.attributeName} là bắt buộc`
            );
          }
          // Validate value must be in allowed values
          if (attr.values && attr.values.length > 0) {
            const allowedValues = attr.values.map((v) => v.value);
            fieldSchema = fieldSchema.refine(
              (val) => allowedValues.includes(val),
              {
                message: `Giá trị không hợp lệ. Vui lòng chọn từ danh sách.`,
              }
            );
          }
          break;

        case "MULTISELECT":
          fieldSchema = z.array(z.string());
          if (attr.required) {
            fieldSchema = fieldSchema.min(
              1,
              `${attr.attributeName} là bắt buộc`
            );
          }
          // Validate values must be in allowed values
          if (attr.values && attr.values.length > 0) {
            const allowedValues = attr.values.map((v) => v.value);
            fieldSchema = fieldSchema.refine(
              (vals) => vals.every((val) => allowedValues.includes(val)),
              {
                message: `Một hoặc nhiều giá trị không hợp lệ.`,
              }
            );
          }
          break;

        case "RANGE":
        case "TEXT":
          if (attr.dataType === "NUMBER" || attr.dataType === "DECIMAL") {
            fieldSchema = z.number();
            if (attr.required) {
              fieldSchema = fieldSchema.min(
                0,
                `${attr.attributeName} phải lớn hơn hoặc bằng 0`
              );
            }
            // Apply validation rules
            if (attr.validationRules) {
              try {
                const rules = JSON.parse(attr.validationRules);
                if (rules.min !== undefined) {
                  fieldSchema = (fieldSchema as z.ZodNumber).min(
                    rules.min,
                    `${attr.attributeName} phải lớn hơn hoặc bằng ${rules.min}`
                  );
                }
                if (rules.max !== undefined) {
                  fieldSchema = (fieldSchema as z.ZodNumber).max(
                    rules.max,
                    `${attr.attributeName} phải nhỏ hơn hoặc bằng ${rules.max}`
                  );
                }
              } catch (e) {
                // Invalid JSON, ignore
              }
            }
          } else {
            fieldSchema = z.string();
            if (attr.required) {
              fieldSchema = fieldSchema.min(
                1,
                `${attr.attributeName} là bắt buộc`
              );
            }
          }
          break;

        case "BOOLEAN":
          fieldSchema = z.boolean();
          break;

        default:
          fieldSchema = z.string().optional();
      }

      if (!attr.required) {
        fieldSchema = fieldSchema.optional();
      }

      attributeValidations[fieldName] = fieldSchema;
    });
  });

  return z.object({
    attributes: z.object(attributeValidations).optional(),
  });
}
```

#### 3.6. Component: `DynamicAttributesSection`

```typescript
interface DynamicAttributesSectionProps {
  categoryId: number | null;
  form: UseFormReturn<ProductFormData>;
}

export function DynamicAttributesSection({
  categoryId,
  form,
}: DynamicAttributesSectionProps) {
  const { attributeGroups, isLoading, hasAttributes } =
    useDynamicAttributes(categoryId);

  if (!categoryId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng chọn danh mục trước
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAttributes) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Danh mục này chưa có thuộc tính nào. Vui lòng cấu hình thuộc tính
          trong quản lý danh mục.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {attributeGroups.map((group) => (
        <AttributeGroup
          key={group.groupName}
          groupName={group.groupName}
          attributes={group.attributes}
          form={form}
        />
      ))}
    </div>
  );
}
```

#### 3.4. Component: `AttributeGroup`

```typescript
interface AttributeGroupProps {
  groupName: string;
  attributes: ProductAttribute[];
  form: UseFormReturn<ProductFormData>;
}

export function AttributeGroup({
  groupName,
  attributes,
  form,
}: AttributeGroupProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-4 text-foreground">
        {groupName}
      </h3>
      <div className="space-y-4">
        {attributes
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((attr) => (
            <AttributeField key={attr.id} attribute={attr} form={form} />
          ))}
      </div>
    </div>
  );
}
```

#### 3.7. Component: `DynamicAttributeRenderer` (Factory Pattern)

```typescript
interface DynamicAttributeRendererProps {
  attribute: ProductAttribute;
  form: UseFormReturn<ProductFormData>;
}

export function DynamicAttributeRenderer({
  attribute,
  form,
}: DynamicAttributeRendererProps) {
  const fieldName = `attributes.${attribute.attributeKey}`;

  switch (attribute.attributeType) {
    case "SELECT":
      return (
        <SelectAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "MULTISELECT":
      return (
        <MultiSelectAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "RANGE":
      return (
        <RangeAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "BOOLEAN":
      return (
        <BooleanAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "TEXT":
      return (
        <TextAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    default:
      console.warn(`Unknown attribute type: ${attribute.attributeType}`);
      return null;
  }
}
```

**Update AttributeGroup to use DynamicAttributeRenderer:**

```typescript
export function AttributeGroup({
  groupName,
  attributes,
  form,
}: AttributeGroupProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-4 text-foreground">
        {groupName}
      </h3>
      <div className="space-y-4">
        {attributes.map((attr) => (
          <DynamicAttributeRenderer
            key={attr.id}
            attribute={attr}
            form={form}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 3.6. Component: `SelectAttributeField`

```typescript
interface SelectAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<ProductFormData>;
  fieldName: string;
}

export function SelectAttributeField({
  attribute,
  form,
  fieldName,
}: SelectAttributeFieldProps) {
  return (
    <FormField
      label={attribute.attributeName}
      htmlFor={fieldName}
      required={attribute.required}
      error={form.formState.errors.attributes?.[attribute.attributeKey]}
      description={attribute.helpText}
    >
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field }) => (
          <Select
            value={field.value?.toString()}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${attribute.attributeName}...`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.values?.map((val) => (
                <SelectItem key={val.id} value={val.value}>
                  <div className="flex items-center gap-2">
                    {val.hexColor && (
                      <div
                        className="h-4 w-4 rounded border"
                        style={{ backgroundColor: val.hexColor }}
                      />
                    )}
                    {val.imageUrl && (
                      <img
                        src={val.imageUrl}
                        alt={val.displayValue}
                        className="h-4 w-4 rounded object-cover"
                      />
                    )}
                    <span>
                      {val.displayValue}
                      {attribute.unit && ` (${attribute.unit})`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
```

### 4. Data Flow

```
1. User chọn Category trong Product Form
   ↓
2. Frontend gọi API: GET /api/admin/category-attributes/{categoryId}/for-product
   ↓
3. Backend trả về danh sách attributes (đã sort theo displayOrder)
   ↓
4. Frontend group attributes theo domain
   ↓
5. Render DynamicAttributesSection với AttributeGroup components
   ↓
6. User nhập giá trị attributes
   ↓
7. Form submit với structure:
   {
     ...basicInfo,
     attributes: {
       "dung-tich": "100",
       "mau-sac": ["red", "blue"],
       "mui-huong": "vanilla"
     }
   }
   ↓
8. Backend validate và lưu vào product_attributes table
```

### 5. Validation Strategy

#### 5.1. Frontend Validation (Zod Schema)

```typescript
const productAttributeSchema = z.record(
  z.string(), // attributeKey
  z.union([z.string(), z.array(z.string()), z.number(), z.boolean()])
);

const productFormSchema = z.object({
  // Basic info
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  // ...

  // Dynamic attributes
  attributes: productAttributeSchema.optional(),
});

// Dynamic validation based on category attributes
const createProductFormSchema = (categoryAttributes?: ProductAttribute[]) => {
  const attributeValidations: Record<string, z.ZodTypeAny> = {};

  categoryAttributes?.forEach((attr) => {
    const fieldName = `attributes.${attr.attributeKey}`;

    if (attr.required) {
      switch (attr.attributeType) {
        case "SELECT":
          attributeValidations[fieldName] = z
            .string()
            .min(1, `${attr.attributeName} là bắt buộc`);
          break;
        case "MULTISELECT":
          attributeValidations[fieldName] = z
            .array(z.string())
            .min(1, `${attr.attributeName} là bắt buộc`);
          break;
        // ... other types
      }
    }
  });

  return productFormSchema.extend(attributeValidations);
};
```

#### 5.2. Backend Validation

```java
private void validateProductAttributes(Product product, List<CategoryAttribute> requiredAttributes) {
    Category category = product.getCategory();
    if (category == null) {
        return;
    }

    // Get allowed attributes for this category
    List<CategoryAttribute> allowedAttributes =
        categoryAttributeRepository.findByCategoryId(category.getId());

    Set<Long> allowedAttributeIds = allowedAttributes.stream()
        .map(ca -> ca.getAttribute().getId())
        .collect(Collectors.toSet());

    // Validate each product attribute
    for (ProductAttributeValue pav : product.getAttributeValues()) {
        Long attributeId = pav.getAttribute().getId();

        // Check if attribute is allowed for this category
        if (!allowedAttributeIds.contains(attributeId)) {
            throw new IllegalArgumentException(
                String.format(
                    "Attribute '%s' không được phép cho category '%s'",
                    pav.getAttribute().getAttributeName(),
                    category.getName()
                )
            );
        }

        // Check if required attribute is provided
        CategoryAttribute categoryAttribute = allowedAttributes.stream()
            .filter(ca -> ca.getAttribute().getId().equals(attributeId))
            .findFirst()
            .orElse(null);

        if (categoryAttribute != null && Boolean.TRUE.equals(categoryAttribute.getRequired())) {
            if (pav.getAttributeValue() == null && pav.getCustomValue() == null && pav.getNumericValue() == null) {
                throw new IllegalArgumentException(
                    String.format("Attribute '%s' là bắt buộc", pav.getAttribute().getAttributeName())
                );
            }
        }
    }
}
```

---

## 📋 Implementation Plan

### Phase 1: Backend API (Priority: HIGH)

**Tasks:**

1. ✅ **Database Migration:** Tạo migration `V15__add_group_name_to_category_attributes.sql`
2. ✅ **Update Entity:** Thêm `groupName` vào `CategoryAttribute` entity
3. ✅ **Update DTO:** Thêm `groupName` vào `CategoryAttributeDTO`
4. ✅ **Update Service:** Update `assignAttributeToCategory` để nhận `groupName`
5. ✅ **Create Endpoint:** `GET /api/admin/category-attributes/{categoryId}/for-product`
   - Filter `is_variant_specific = false` (chỉ Product Attributes)
   - Group by `group_name` (fallback to domain nếu NULL)
   - Sort by `display_order` trong mỗi group
   - Include attribute values

**Time:** 3-4 giờ

### Phase 2: Frontend Logic Layer (Priority: HIGH)

**Tasks:**

1. ✅ **Service Method:** `getAttributesForProduct` trong `category-attribute.service.ts`
2. ✅ **Hook:** `useCategoryAttributesForProduct` - Query grouped attributes
3. ✅ **Hook:** `useDynamicAttributes` - Transform grouped data thành array of groups
4. ✅ **Function:** `generateZodSchema` - Generate Zod schema từ attribute groups
5. ✅ **Types:** Update types để support grouped response

**Time:** 3-4 giờ

### Phase 3: Frontend UI Components (Priority: HIGH)

**Tasks:**

1. ✅ **Component:** `DynamicAttributesSection` - Main container
2. ✅ **Component:** `AttributeGroup` - Group wrapper
3. ✅ **Component:** `DynamicAttributeRenderer` - Factory pattern để render field
4. ✅ **Component:** `SelectAttributeField` - SELECT type
5. ✅ **Component:** `MultiSelectAttributeField` - MULTISELECT type
6. ✅ **Component:** `RangeAttributeField` - RANGE type
7. ✅ **Component:** `BooleanAttributeField` - BOOLEAN type
8. ✅ **Component:** `TextAttributeField` - TEXT type

**Time:** 6-8 giờ

**Tasks:**

1. ✅ `SelectAttributeField` - Dropdown với preview (color, image)
2. ✅ `MultiSelectAttributeField` - Multi-select với tags
3. ✅ `RangeAttributeField` - Slider hoặc number input
4. ✅ `BooleanAttributeField` - Switch
5. ✅ `TextAttributeField` - Input/Textarea

**Time:** 6-8 giờ

### Phase 4: Product Form Integration (Priority: HIGH)

**Tasks:**

1. ✅ **Update CategoryAttributesSection:** Thêm input `groupName` khi gán attribute
2. ✅ **Integrate:** Tích hợp `DynamicAttributesSection` vào Product Form
3. ✅ **Schema:** Sử dụng `generateZodSchema` để tạo dynamic validation
4. ✅ **Submit:** Handle form submission với attributes data
5. ✅ **Backend:** Update Product Service để lưu attributes vào `product_attributes` table

**Time:** 4-6 giờ

**Tasks:**

1. ✅ Tích hợp `DynamicAttributesSection` vào Product Form
2. ✅ Update Product Form Schema với dynamic validation
3. ✅ Handle form submission với attributes
4. ✅ Update Product Service để lưu attributes

**Time:** 4-6 giờ

### Phase 5: Advanced Features (Priority: MEDIUM)

**Tasks:**

1. ⚠️ Custom Attribute Grouping (thêm field `attribute_group` vào CategoryAttribute)
2. ⚠️ Attribute Dependencies (attribute A hiện khi attribute B có giá trị X)
3. ⚠️ Conditional Validation (validate dựa trên giá trị attribute khác)
4. ⚠️ Attribute Templates (pre-fill attributes cho category)

**Time:** 8-12 giờ

---

## 🎨 UI/UX Recommendations

### 1. Visual Hierarchy

```
┌─────────────────────────────────────────┐
│  Đặc tính sản phẩm                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │ 🎨 Hương thơm                     │ │
│  │ ────────────────────────────────  │ │
│  │ Mùi hương *        [Select ▼]    │ │
│  │ Độ lưu hương *    [Select ▼]    │ │
│  │ Nồng độ *          [Select ▼]    │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ 📏 Thông số                        │ │
│  │ ────────────────────────────────  │ │
│  │ Dung tích *        [Select ▼]    │ │
│  │ Trọng lượng        [Input]       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Color & Image Preview

- **Color Swatches:** Hiển thị màu hex trong dropdown
- **Image Swatches:** Hiển thị ảnh nhỏ trong dropdown
- **Preview:** Preview giá trị đã chọn với color/image

### 3. Required Indicators

- **Asterisk (\*):** Hiển thị cho required attributes
- **Visual Feedback:** Highlight required fields khi chưa điền

### 4. Help Text & Tooltips

- **Help Text:** Hiển thị dưới label
- **Tooltips:** Icon (?) để hiển thị thêm thông tin

---

## 🔒 Data Integrity & Validation

### 1. Frontend Validation

- ✅ Required attributes phải có giá trị
- ✅ SELECT phải chọn từ danh sách values có sẵn
- ✅ MULTISELECT phải chọn ít nhất 1 (nếu required)
- ✅ RANGE phải trong khoảng min-max (nếu có validationRules)
- ✅ NUMBER phải là số hợp lệ

### 2. Backend Validation

- ✅ Attribute phải được phép cho category
- ✅ Required attributes phải có giá trị
- ✅ Giá trị phải hợp lệ (trong danh sách values hoặc theo validationRules)
- ✅ Variant-specific attributes chỉ được gán cho variant, không phải product

---

## 📊 Success Metrics

### Technical Metrics

- ✅ Form load time < 500ms
- ✅ Attribute rendering time < 200ms
- ✅ Validation response time < 100ms
- ✅ Zero console errors

### UX Metrics

- ✅ User có thể tạo product với attributes trong < 3 phút
- ✅ User hiểu được cách nhập attributes (no confusion)
- ✅ Error messages rõ ràng và actionable

---

## 🚨 Risks & Mitigation

### Risk 1: Performance với nhiều attributes

**Mitigation:**

- Lazy load attributes khi category được chọn
- Virtual scrolling cho danh sách attributes dài
- Debounce validation

### Risk 2: Complex validation logic

**Mitigation:**

- Start với validation đơn giản (required, type check)
- Mở rộng dần theo nhu cầu
- Document validation rules rõ ràng

### Risk 3: User confusion với dynamic form

**Mitigation:**

- Clear visual grouping
- Help text và tooltips
- Preview giá trị đã chọn
- Empty state messages

---

## 📝 Next Steps

1. **Review & Approve:** Review document này với team
2. **Start Phase 1:** Implement Backend API
3. **Start Phase 2:** Implement Frontend Infrastructure
4. **Iterate:** Test và refine dựa trên feedback

---

**End of Analysis Document**
