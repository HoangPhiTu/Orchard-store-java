# Implementation Plan: Dynamic Product Form với Attribute System

**Ngày tạo:** 2025-12-03  
**Mục tiêu:** Implement Dynamic Product Form dựa trên Category-Attribute binding  
**Trạng thái:** 🟡 Ready to Implement

---

## 📋 Tổng Quan

### Mục Tiêu

Tạo một Product Form duy nhất, tự động render attributes dựa trên Category được chọn, với:

- ✅ Chỉ hiển thị Product Attributes (`is_variant_specific = false`)
- ✅ Group attributes theo `group_name` (fallback to domain)
- ✅ Dynamic validation dựa trên attribute definitions
- ✅ Support tất cả attribute types (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)

### Chiến Lược Thực Thi

1. **Backend:** Update DB + API endpoint
2. **Frontend Logic:** `generateZodSchema` + `useDynamicAttributes`
3. **Frontend UI:** `DynamicAttributeRenderer` component

---

## 🎯 Phase 1: Backend API (Priority: HIGH)

**Time:** 3-4 giờ

### Task 1.1: Database Migration

**Files:**

- `orchard-store-backend/src/main/resources/db/migration/V15__add_group_name_to_category_attributes.sql`

**Status:** ✅ **DONE** - Migration đã được tạo

**Checklist:**

- [x] Tạo migration script
- [x] Add column `group_name VARCHAR(100)`
- [x] Add index for performance
- [x] Add comment

---

### Task 1.2: Update Entity & DTO

**Files:**

- `orchard-store-backend/.../entity/CategoryAttribute.java`
- `orchard-store-backend/.../dto/CategoryAttributeDTO.java`

**Status:** ✅ **DONE** - Entity và DTO đã được update

**Checklist:**

- [x] Add `groupName` field to Entity
- [x] Add `groupName` field to DTO

---

### Task 1.3: Update Service

**Files:**

- `orchard-store-backend/.../service/CategoryAttributeServiceImpl.java`

**Status:** ✅ **DONE** - Service đã được update

**Checklist:**

- [x] Update `assignAttributeToCategory` để nhận `groupName`
- [x] Update `updateCategoryAttributeMetadata` để update `groupName`

---

### Task 1.4: Create API Endpoint

**Files:**

- `orchard-store-backend/.../controller/CategoryAttributeController.java`
- `orchard-store-backend/.../service/CategoryAttributeService.java`
- `orchard-store-backend/.../service/CategoryAttributeServiceImpl.java`

**Priority:** 🔴 **CRITICAL**

**Checklist:**

- [ ] Add method `getAttributesForProduct(Long categoryId)` vào Service interface
- [ ] Implement method trong ServiceImpl:
  - Filter `is_variant_specific = false`
  - Group by `group_name` (fallback to domain)
  - Sort by `display_order` trong mỗi group
  - Include attribute values
- [ ] Add endpoint `GET /api/admin/category-attributes/{categoryId}/for-product` vào Controller
- [ ] Return `Map<String, List<ProductAttributeDTO>>` (grouped)
- [ ] Test với Postman

**Code:**

```java
// Service Interface
Map<String, List<ProductAttributeDTO>> getAttributesForProduct(Long categoryId);

// Service Implementation
@Override
public Map<String, List<ProductAttributeDTO>> getAttributesForProduct(Long categoryId) {
    // Get all category attributes
    List<CategoryAttribute> categoryAttributes =
        categoryAttributeRepository.findByCategoryId(categoryId);

    // Filter: Chỉ lấy Product Attributes (is_variant_specific = false)
    List<CategoryAttribute> productAttributes = categoryAttributes.stream()
        .filter(ca -> !Boolean.TRUE.equals(ca.getAttribute().getVariantSpecific()))
        .sorted(Comparator.comparing(CategoryAttribute::getDisplayOrder))
        .collect(Collectors.toList());

    // Group by group_name (nếu NULL thì dùng domain)
    Map<String, List<ProductAttributeDTO>> grouped = productAttributes.stream()
        .map(ca -> {
            ProductAttributeDTO dto = productAttributeMapper.toDTO(ca.getAttribute());
            dto.setRequired(ca.getRequired());
            dto.setDisplayOrder(ca.getDisplayOrder());
            dto.setGroupName(ca.getGroupName());
            return dto;
        })
        .collect(Collectors.groupingBy(
            dto -> {
                if (dto.getGroupName() != null && !dto.getGroupName().trim().isEmpty()) {
                    return dto.getGroupName();
                }
                return dto.getDomain() != null ? dto.getDomain() : "COMMON";
            }
        ));

    return grouped;
}

// Controller
@GetMapping("/{categoryId}/for-product")
public ResponseEntity<ApiResponse<Map<String, List<ProductAttributeDTO>>>> getAttributesForProduct(
        @PathVariable Long categoryId
) {
    Map<String, List<ProductAttributeDTO>> grouped =
        categoryAttributeService.getAttributesForProduct(categoryId);
    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách thuộc tính thành công", grouped)
    );
}
```

---

## 🎯 Phase 2: Frontend Logic Layer (Priority: HIGH)

**Time:** 3-4 giờ

### Task 2.1: Update Types

**Files:**

- `orchard-store-dashboad/src/types/catalog.types.ts`

**Checklist:**

- [ ] Add `groupName?: string` vào `CategoryAttribute` interface
- [ ] Add type `AttributeGroup` interface
- [ ] Update `ProductAttribute` interface nếu cần

**Code:**

```typescript
export interface CategoryAttribute {
  id?: number;
  categoryId: number;
  attributeId: number;
  attributeName?: string;
  attributeKey?: string;
  required?: boolean;
  displayOrder?: number;
  groupName?: string; // ✅ NEW
}

export interface AttributeGroup {
  groupName: string;
  attributes: ProductAttribute[];
}
```

---

### Task 2.2: Update Service

**Files:**

- `orchard-store-dashboad/src/services/category-attribute.service.ts`

**Checklist:**

- [ ] Add method `getAttributesForProduct(categoryId)`
- [ ] Return type: `Promise<Record<string, ProductAttribute[]>>`

**Code:**

```typescript
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

---

### Task 2.3: Create Hook `useCategoryAttributesForProduct`

**Files:**

- `orchard-store-dashboad/src/hooks/use-category-attributes.ts`

**Checklist:**

- [ ] Add hook `useCategoryAttributesForProduct(categoryId)`
- [ ] Return type: `Record<string, ProductAttribute[]>`
- [ ] Use React Query với proper caching

**Code:**

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

---

### Task 2.4: Create Hook `useDynamicAttributes`

**Files:**

- `orchard-store-dashboad/src/hooks/use-dynamic-attributes.ts` (NEW)

**Checklist:**

- [ ] Create new file
- [ ] Transform grouped data thành array of groups
- [ ] Sort groups (custom groups first, then domain groups)
- [ ] Sort attributes trong mỗi group theo displayOrder

**Code:**

```typescript
import { useMemo } from "react";
import { useCategoryAttributesForProduct } from "@/hooks/use-category-attributes";
import type { AttributeGroup, ProductAttribute } from "@/types/catalog.types";

export const useDynamicAttributes = (categoryId: number | null) => {
  const {
    data: groupedAttributes,
    isLoading,
    error,
  } = useCategoryAttributesForProduct(categoryId);

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
        // Custom groups first, then domain groups
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

---

### Task 2.5: Create Function `generateZodSchema`

**Files:**

- `orchard-store-dashboad/src/lib/utils/generate-zod-schema.ts` (NEW)

**Checklist:**

- [ ] Create new file
- [ ] Function nhận `AttributeGroup[]` và return Zod schema
- [ ] Handle tất cả attribute types (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)
- [ ] Apply required validation
- [ ] Apply value validation (allowed values)
- [ ] Apply range validation (min/max)

**Code:** (Xem trong tài liệu phân tích)

---

## 🎯 Phase 3: Frontend UI Components (Priority: HIGH)

**Time:** 6-8 giờ

### Task 3.1: Component `DynamicAttributesSection`

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/dynamic-attributes-section.tsx` (NEW)

**Checklist:**

- [ ] Create component
- [ ] Use `useDynamicAttributes` hook
- [ ] Render `AttributeGroup` components
- [ ] Handle loading state
- [ ] Handle empty state

---

### Task 3.2: Component `AttributeGroup`

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/attribute-group.tsx` (NEW)

**Checklist:**

- [ ] Create component
- [ ] Render group header với tên group
- [ ] Render `DynamicAttributeRenderer` cho mỗi attribute
- [ ] Sort attributes theo displayOrder

---

### Task 3.3: Component `DynamicAttributeRenderer` (Factory)

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/dynamic-attribute-renderer.tsx` (NEW)

**Checklist:**

- [ ] Create component với factory pattern
- [ ] Switch case để render field component tương ứng
- [ ] Handle unknown attribute types

---

### Task 3.4: Field Components

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/attribute-fields/select-attribute-field.tsx`
- `orchard-store-dashboad/src/components/features/catalog/attribute-fields/multi-select-attribute-field.tsx`
- `orchard-store-dashboad/src/components/features/catalog/attribute-fields/range-attribute-field.tsx`
- `orchard-store-dashboad/src/components/features/catalog/attribute-fields/boolean-attribute-field.tsx`
- `orchard-store-dashboad/src/components/features/catalog/attribute-fields/text-attribute-field.tsx`

**Checklist:**

- [ ] `SelectAttributeField` - Dropdown với preview (color, image)
- [ ] `MultiSelectAttributeField` - Multi-select với tags
- [ ] `RangeAttributeField` - Slider hoặc number input
- [ ] `BooleanAttributeField` - Switch
- [ ] `TextAttributeField` - Input/Textarea

---

## 🎯 Phase 4: Product Form Integration (Priority: HIGH)

**Time:** 4-6 giờ

### Task 4.1: Update CategoryAttributesSection

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/category-attributes-section.tsx`

**Checklist:**

- [ ] Add input field `groupName` khi gán attribute
- [ ] Update UI để hiển thị groupName
- [ ] Update `handleAssign` để gửi `groupName`
- [ ] Update `handleUpdateMetadata` để update `groupName`

---

### Task 4.2: Integrate vào Product Form

**Files:**

- `orchard-store-dashboad/src/components/features/catalog/product-form-sheet.tsx` (khi có)

**Checklist:**

- [ ] Import `DynamicAttributesSection`
- [ ] Add section "Đặc tính sản phẩm" vào Product Form
- [ ] Pass `categoryId` và `form` vào component
- [ ] Handle form submission với attributes

---

### Task 4.3: Update Product Form Schema

**Checklist:**

- [ ] Use `generateZodSchema` để tạo dynamic validation
- [ ] Merge với basic product schema
- [ ] Test validation với các attribute types khác nhau

---

### Task 4.4: Backend - Save Attributes

**Files:**

- `orchard-store-backend/.../service/ProductServiceImpl.java` (khi có)

**Checklist:**

- [ ] Validate attributes khi save product
- [ ] Save attributes vào `product_attributes` table
- [ ] Handle variant-specific attributes (nếu có)

---

## 📅 Timeline Tổng Thể

| Phase   | Tasks          | Time | Status         |
| ------- | -------------- | ---- | -------------- |
| Phase 1 | Backend API    | 3-4h | 🟡 In Progress |
| Phase 2 | Frontend Logic | 3-4h | ⚪ Pending     |
| Phase 3 | Frontend UI    | 6-8h | ⚪ Pending     |
| Phase 4 | Integration    | 4-6h | ⚪ Pending     |

**Tổng:** 16-22 giờ

---

## ✅ Definition of Done

### Phase 1 (Backend API)

- [ ] Migration chạy thành công
- [ ] Entity và DTO có `groupName`
- [ ] Service có method `getAttributesForProduct`
- [ ] API endpoint trả về grouped attributes
- [ ] Filter `is_variant_specific = false`
- [ ] Test với Postman

### Phase 2 (Frontend Logic)

- [ ] Types được update
- [ ] Service có method `getAttributesForProduct`
- [ ] Hook `useCategoryAttributesForProduct` hoạt động
- [ ] Hook `useDynamicAttributes` transform data đúng
- [ ] Function `generateZodSchema` tạo schema đúng

### Phase 3 (Frontend UI)

- [ ] `DynamicAttributesSection` render đúng
- [ ] `AttributeGroup` hiển thị groups
- [ ] `DynamicAttributeRenderer` render đúng field type
- [ ] Tất cả field components hoạt động
- [ ] UI/UX tốt (loading, empty states, errors)

### Phase 4 (Integration)

- [ ] CategoryAttributesSection có input `groupName`
- [ ] Product Form có section "Đặc tính sản phẩm"
- [ ] Dynamic validation hoạt động
- [ ] Form submission lưu attributes đúng
- [ ] Backend validation hoạt động

---

## 🚨 Risks & Mitigation

### Risk 1: Performance với nhiều attributes

**Mitigation:**

- Lazy load attributes khi category được chọn
- Memoize grouped data
- Virtual scrolling nếu cần

### Risk 2: Complex validation logic

**Mitigation:**

- Start với validation đơn giản
- Test từng attribute type
- Document validation rules

### Risk 3: User confusion

**Mitigation:**

- Clear visual grouping
- Help text và tooltips
- Preview giá trị đã chọn

---

**End of Implementation Plan**
