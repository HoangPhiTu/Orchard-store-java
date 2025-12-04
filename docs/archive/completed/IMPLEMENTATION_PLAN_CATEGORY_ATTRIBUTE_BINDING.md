# Kế Hoạch Triển Khai: Category-Attribute Binding

**Ngày tạo:** 2025-12-03  
**Mục tiêu:** Hoàn thiện tính năng Category-Attribute Binding để kết nối Categories và Attributes  
**Trạng thái:** 🟡 Planning

---

## 📊 Tổng Quan

### Hiện Trạng

- ✅ **Backend:** Đã có đầy đủ (Entity, Repository, Service, Controller, API endpoints)
- ❌ **Frontend:** Chưa tích hợp (Thiếu Service, Hooks, UI Components)
- ⚠️ **Vấn đề:** Admin không thể cấu hình attributes cho category trong CategoryForm

### Mục Tiêu

1. **Phase 1 (Ưu tiên cao):** Tích hợp Frontend để admin có thể gán attributes vào category
2. **Phase 2 (Ưu tiên trung bình):** Validation khi tạo Product (khi có Product module)
3. **Phase 3 (Ưu tiên thấp):** Tối ưu và mở rộng tính năng

---

## 🎯 Phase 1: Frontend Integration (ƯU TIÊN CAO)

**Mục tiêu:** Admin có thể cấu hình attributes cho category ngay trong CategoryFormSheet  
**Thời gian ước tính:** 7-9 giờ (tăng do thêm metadata editing và các fixes)  
**Dependencies:** Cần thêm API endpoint update metadata (Task 1.0)

### Task 1.0: Thêm API Endpoint Update Metadata (Backend)

**Priority:** 🔴 **CRITICAL**  
**Time:** 30 phút  
**Files:**

- `orchard-store-backend/.../controller/CategoryAttributeController.java`
- `orchard-store-backend/.../service/CategoryAttributeService.java`
- `orchard-store-backend/.../service/CategoryAttributeServiceImpl.java`

**Checklist:**

- [ ] Thêm method `updateCategoryAttributeMetadata()` vào Service interface
- [ ] Implement method trong ServiceImpl
- [ ] Thêm endpoint `PUT /api/admin/category-attributes/{categoryId}/{attributeId}` vào Controller
- [ ] Update DTO để nhận `required` và `displayOrder`
- [ ] Test với Postman

**Code:**

```java
// Service Interface
void updateCategoryAttributeMetadata(Long categoryId, Long attributeId, Boolean required, Integer displayOrder);

// Service Implementation
@Override
public void updateCategoryAttributeMetadata(Long categoryId, Long attributeId, Boolean required, Integer displayOrder) {
    CategoryAttribute categoryAttribute = categoryAttributeRepository
        .findByCategoryIdAndAttributeId(categoryId, attributeId)
        .orElseThrow(() -> new ResourceNotFoundException("CategoryAttribute", categoryId + "-" + attributeId));

    if (required != null) {
        categoryAttribute.setRequired(required);
    }
    if (displayOrder != null) {
        categoryAttribute.setDisplayOrder(displayOrder);
    }

    categoryAttributeRepository.save(categoryAttribute);
}

// Controller
@PutMapping("/{categoryId}/{attributeId}")
public ResponseEntity<CategoryAttributeDTO> updateMetadata(
        @PathVariable Long categoryId,
        @PathVariable Long attributeId,
        @RequestBody CategoryAttributeDTO dto
) {
    categoryAttributeService.updateCategoryAttributeMetadata(
        categoryId,
        attributeId,
        dto.getRequired(),
        dto.getDisplayOrder()
    );
    CategoryAttributeDTO updated = categoryAttributeService.getAttributesByCategory(categoryId)
        .stream()
        .filter(ca -> ca.getAttributeId().equals(attributeId))
        .findFirst()
        .orElseThrow();
    return ResponseEntity.ok(updated);
}
```

---

### Task 1.1: Tạo Service Layer

**Priority:** 🔴 **CRITICAL**  
**Time:** 30 phút  
**Files:**

- `orchard-store-dashboad/src/services/category-attribute.service.ts`

**Checklist:**

- [ ] Tạo file service mới
- [ ] Implement `getCategoryAttributes(categoryId)` - GET `/api/admin/category-attributes/{categoryId}`
- [ ] Implement `assignAttribute(data)` - POST `/api/admin/category-attributes`
- [ ] Implement `removeAttribute(categoryId, attributeId)` - DELETE `/api/admin/category-attributes/{categoryId}/{attributeId}`
- [ ] Implement `updateAttributeMetadata(categoryId, attributeId, data)` - PUT `/api/admin/category-attributes/{categoryId}/{attributeId}`
- [ ] Test với Postman/Insomnia để verify API hoạt động
- [ ] Handle errors và unwrap ApiResponse

**Code Template:**

```typescript
import http from "@/lib/axios-client";
import type { CategoryAttribute } from "@/types/catalog.types";
import type { ApiResponse } from "@/types/api.types";

export const categoryAttributeService = {
  getCategoryAttributes: (categoryId: number): Promise<CategoryAttribute[]> => {
    return http
      .get<ApiResponse<CategoryAttribute[]>>(
        `/api/admin/category-attributes/${categoryId}`
      )
      .then((res) => res.data ?? []);
  },

  assignAttribute: (
    data: Omit<CategoryAttribute, "id" | "attributeName" | "attributeKey">
  ): Promise<CategoryAttribute> => {
    return http
      .post<ApiResponse<CategoryAttribute>>(
        "/api/admin/category-attributes",
        data
      )
      .then((res) => res.data!);
  },

  removeAttribute: (categoryId: number, attributeId: number): Promise<void> => {
    return http
      .delete(`/api/admin/category-attributes/${categoryId}/${attributeId}`)
      .then(() => undefined);
  },

  /**
   * Cập nhật metadata (required, displayOrder) của attribute đã gán
   * PUT /api/admin/category-attributes/{categoryId}/{attributeId}
   */
  updateAttributeMetadata: (
    categoryId: number,
    attributeId: number,
    data: { required?: boolean; displayOrder?: number }
  ): Promise<CategoryAttribute> => {
    return http
      .put<ApiResponse<CategoryAttribute>>(
        `/api/admin/category-attributes/${categoryId}/${attributeId}`,
        data
      )
      .then((res) => res.data!);
  },
};
```

---

### Task 1.2: Update Types

**Priority:** 🔴 **CRITICAL**  
**Time:** 15 phút  
**Files:**

- `orchard-store-dashboad/src/types/catalog.types.ts`

**Checklist:**

- [ ] Thêm interface `CategoryAttribute` vào file types
- [ ] Đảm bảo type khớp với backend DTO

**Code Template:**

```typescript
export interface CategoryAttribute {
  id?: number;
  categoryId: number;
  attributeId: number;
  attributeName?: string;
  attributeKey?: string;
  required?: boolean;
  displayOrder?: number;
}
```

---

### Task 1.3.1: Tạo Hooks Layer (Assign & Remove)

**Priority:** 🔴 **CRITICAL**  
**Time:** 30 phút

### Task 1.3.2: Tạo Hook Update Metadata

**Priority:** 🟡 **HIGH**  
**Time:** 15 phút  
**Files:**

- `orchard-store-dashboad/src/hooks/use-category-attributes.ts`

**Checklist:**

- [ ] Tạo hook `useUpdateCategoryAttribute()` - Mutation để cập nhật metadata (required, displayOrder)
- [ ] ⚠️ **QUAN TRỌNG:** Dùng `useAppMutation` thay vì `useMutation`

**Code:**

```typescript
export const useUpdateCategoryAttribute = () => {
  return useAppMutation<
    CategoryAttribute,
    Error,
    {
      categoryId: number;
      attributeId: number;
      required?: boolean;
      displayOrder?: number;
    }
  >({
    mutationFn: ({ categoryId, attributeId, required, displayOrder }) => {
      return categoryAttributeService.updateAttributeMetadata(
        categoryId,
        attributeId,
        {
          required,
          displayOrder,
        }
      );
    },
    queryKey: ["admin", "category-attributes"],
    successMessage: "Cập nhật thuộc tính thành công!",
  });
};
```

**Lưu ý:** API endpoint đã được thêm trong Task 1.0 (Backend).

### Task 1.3: Tạo Hooks Layer (Original)

**Priority:** 🔴 **CRITICAL**  
**Time:** 45 phút  
**Files:**

- `orchard-store-dashboad/src/hooks/use-category-attributes.ts`

**Checklist:**

- [ ] Tạo hook `useCategoryAttributes(categoryId)` - Query để lấy attributes của category
- [ ] Tạo hook `useAssignCategoryAttribute()` - Mutation để gán attribute
- [ ] Tạo hook `useRemoveCategoryAttribute()` - Mutation để xóa binding
- [ ] ⚠️ **QUAN TRỌNG:** Dùng `useAppMutation` thay vì `useMutation` (theo coding rules của dự án)
- [ ] Setup query keys và cache invalidation
- [ ] Handle loading states và errors

**Code Template:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { categoryAttributeService } from "@/services/category-attribute.service";
import type { CategoryAttribute } from "@/types/catalog.types";

export const useCategoryAttributes = (categoryId: number | null) => {
  return useQuery<CategoryAttribute[], Error>({
    queryKey: ["admin", "category-attributes", categoryId],
    queryFn: () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }
      return categoryAttributeService.getCategoryAttributes(categoryId);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssignCategoryAttribute = () => {
  return useAppMutation<
    CategoryAttribute,
    Error,
    Omit<CategoryAttribute, "id" | "attributeName" | "attributeKey">
  >({
    mutationFn: (data) => categoryAttributeService.assignAttribute(data),
    queryKey: ["admin", "category-attributes"],
    successMessage: "Gán thuộc tính thành công!",
  });
};

export const useRemoveCategoryAttribute = () => {
  return useAppMutation<
    void,
    Error,
    { categoryId: number; attributeId: number }
  >({
    mutationFn: ({ categoryId, attributeId }) =>
      categoryAttributeService.removeAttribute(categoryId, attributeId),
    queryKey: ["admin", "category-attributes"],
    successMessage: "Xóa thuộc tính thành công!",
  });
};
```

**⚠️ Lưu ý quan trọng:**

- **PHẢI dùng `useAppMutation`** thay vì `useMutation` để tự động xử lý Toast & Error
- `useAppMutation` tự động invalidate queries, không cần manual `queryClient.invalidateQueries`

---

### Task 1.4: Tạo Component CategoryAttributesSection

**Priority:** 🔴 **CRITICAL**  
**Time:** 3-4 giờ (tăng thời gian do thêm metadata editing)  
**Files:**

- `orchard-store-dashboad/src/components/features/catalog/category-attributes-section.tsx`

**Checklist:**

- [ ] Tạo component mới `CategoryAttributesSection`
- [ ] Hiển thị danh sách attributes đã gán (với tên, key, required, displayOrder)
- [ ] ⚠️ **QUAN TRỌNG:** Dùng `Command` (Combobox) thay vì `Select` để có search/filter
- [ ] ⚠️ **QUAN TRỌNG:** Thêm filter theo Domain (PERFUME/COSMETICS/COMMON) khi chọn attribute
- [ ] ⚠️ **QUAN TRỌNG:** Thêm toggle "Required" và input "Display Order" để chỉnh sửa metadata
- [ ] Button "Thêm" để gán attribute mới
- [ ] Button "Xóa" cho mỗi attribute đã gán
- [ ] Button "Cập nhật" để lưu thay đổi metadata (required, displayOrder)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty state khi chưa có attributes
- [ ] Message khi category chưa được lưu

**UI Requirements:**

```
┌─────────────────────────────────────────┐
│ Cấu hình thuộc tính                     │
├─────────────────────────────────────────┤
│                                         │
│ Thuộc tính đã gán:                      │
│ ┌─────────────────────────────────────┐ │
│ │ Màu sắc (color)          [Xóa]      │ │
│ │ Required: ✓  Order: 0              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Dung tích (volume)      [Xóa]       │ │
│ │ Required: ✗  Order: 1              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Thêm thuộc tính:                        │
│ [Select Attribute ▼]  [Thêm]           │
│                                         │
└─────────────────────────────────────────┘
```

**Code Structure:**

```typescript
"use client";

import { useMemo, useState } from "react";
import { useCategoryAttributes } from "@/hooks/use-category-attributes";
import { useAllAttributes } from "@/hooks/use-attributes";
import {
  useAssignCategoryAttribute,
  useRemoveCategoryAttribute,
} from "@/hooks/use-category-attributes";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryAttributesSectionProps {
  categoryId?: number;
}

export function CategoryAttributesSection({
  categoryId,
}: CategoryAttributesSectionProps) {
  // State
  const [domainFilter, setDomainFilter] = useState<
    "ALL" | "PERFUME" | "COSMETICS" | "COMMON"
  >("ALL");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Hooks
  const { data: assignedAttributes, isLoading } = useCategoryAttributes(
    categoryId ?? null
  );
  const { data: allAttributes } = useAllAttributes();
  const assignMutation = useAssignCategoryAttribute();
  const removeMutation = useRemoveCategoryAttribute();
  const updateMutation = useUpdateCategoryAttribute(); // Cần tạo hook này

  // Filter: Chỉ hiển thị attributes chưa được gán
  const availableAttributes = useMemo(() => {
    if (!allAttributes || !assignedAttributes) return allAttributes ?? [];
    const assignedIds = new Set(assignedAttributes.map((a) => a.attributeId));
    return allAttributes.filter((a) => !assignedIds.has(a.id));
  }, [allAttributes, assignedAttributes]);

  // Filter theo Domain
  const filteredAvailableAttributes = useMemo(() => {
    if (domainFilter === "ALL") return availableAttributes;
    return availableAttributes.filter((attr) => attr.domain === domainFilter);
  }, [availableAttributes, domainFilter]);

  // Handlers
  const handleAssign = (attributeId: number) => {
    if (!categoryId) return;
    assignMutation.mutate({
      categoryId,
      attributeId,
      required: false,
      displayOrder: assignedAttributes?.length ?? 0,
    });
  };

  const handleRemove = (attributeId: number) => {
    if (!categoryId) return;
    removeMutation.mutate({ categoryId, attributeId });
  };

  const handleUpdateMetadata = (
    attributeId: number,
    updates: { required?: boolean; displayOrder?: number }
  ) => {
    if (!categoryId) return;
    const current = assignedAttributes?.find(
      (ca) => ca.attributeId === attributeId
    );
    if (!current) return;

    updateMutation.mutate({
      categoryId,
      attributeId,
      required: updates.required ?? current.required ?? false,
      displayOrder: updates.displayOrder ?? current.displayOrder ?? 0,
    });
  };

  // Render
  if (!categoryId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng lưu category trước khi cấu hình thuộc tính
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Danh sách attributes đã gán - Có thể chỉnh sửa metadata */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Thuộc tính đã gán</h3>
        {assignedAttributes?.map((ca) => (
          <div key={ca.id} className="p-3 border rounded-lg mb-2 space-y-3">
            {/* Header: Tên và nút Xóa */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ca.attributeName}</p>
                <p className="text-xs text-muted-foreground">
                  {ca.attributeKey}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(ca.attributeId)}
                disabled={removeMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Metadata: Required và Display Order */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">
                  Bắt buộc:
                </label>
                <Switch
                  checked={ca.required ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdateMetadata(ca.attributeId, { required: checked })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Thứ tự:</label>
                <Input
                  type="number"
                  min="0"
                  value={ca.displayOrder ?? 0}
                  onChange={(e) =>
                    handleUpdateMetadata(ca.attributeId, {
                      displayOrder: Number(e.target.value),
                    })
                  }
                  className="w-20 h-8"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chọn attribute để gán - Dùng Command (Combobox) với search */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Thêm thuộc tính</h3>

        {/* Filter theo Domain */}
        <div className="mb-2">
          <Tabs value={domainFilter} onValueChange={setDomainFilter}>
            <TabsList>
              <TabsTrigger value="ALL">Tất cả</TabsTrigger>
              <TabsTrigger value="PERFUME">Nước hoa</TabsTrigger>
              <TabsTrigger value="COSMETICS">Mỹ phẩm</TabsTrigger>
              <TabsTrigger value="COMMON">Chung</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Command Combobox với search */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              Chọn thuộc tính...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Tìm kiếm thuộc tính..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy thuộc tính.</CommandEmpty>
                <CommandGroup heading="Thuộc tính">
                  {filteredAvailableAttributes?.map((attr) => (
                    <CommandItem
                      key={attr.id}
                      value={`${attr.attributeName} ${attr.attributeKey}`}
                      onSelect={() => handleAssign(attr.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          false ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{attr.attributeName}</div>
                        <div className="text-xs text-muted-foreground">
                          {attr.attributeKey} • {attr.domain}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
```

---

### Task 1.5: Tích hợp vào CategoryFormSheet

**Priority:** 🔴 **CRITICAL**  
**Time:** 1-2 giờ  
**Files:**

- `orchard-store-dashboad/src/components/features/catalog/category-form-sheet.tsx`

**Checklist:**

- [ ] Import component `CategoryAttributesSection`
- [ ] Thêm Tabs component (nếu chưa có)
- [ ] Tạo tab "Thông tin cơ bản" và "Cấu hình thuộc tính"
- [ ] Đặt form hiện tại vào tab "Thông tin cơ bản"
- [ ] Đặt `CategoryAttributesSection` vào tab "Cấu hình thuộc tính"
- [ ] Pass `categoryId` vào `CategoryAttributesSection`
- [ ] Test flow: Tạo category → Lưu → Chuyển tab → Gán attributes
- [ ] Test flow: Edit category → Chuyển tab → Xem/gán/xóa attributes

**Code Changes:**

```typescript
// Import
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryAttributesSection } from "./category-attributes-section";

// Trong component, wrap form với Tabs
<Tabs defaultValue="basic" className="w-full">
  <TabsList>
    <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
    <TabsTrigger value="attributes" disabled={!isEditing}>
      Cấu hình thuộc tính
    </TabsTrigger>
  </TabsList>

  <TabsContent value="basic">{/* Form hiện tại */}</TabsContent>

  <TabsContent value="attributes">
    <CategoryAttributesSection categoryId={category?.id} />
  </TabsContent>
</Tabs>;
```

---

### Task 1.6: Testing & Bug Fixes

**Priority:** 🟡 **HIGH**  
**Time:** 1 giờ  
**Checklist:**

- [ ] Test tạo category mới → Lưu → Gán attributes
- [ ] Test edit category → Xem attributes đã gán
- [ ] Test gán attribute mới
- [ ] Test xóa attribute
- [ ] Test với category không có attributes
- [ ] Test với category có nhiều attributes
- [ ] Test loading states
- [ ] Test error handling (API errors)
- [ ] Test cache invalidation (sau khi gán/xóa)
- [ ] Fix bugs nếu có

---

## 🎯 Phase 2: Backend Enhancement (ƯU TIÊN TRUNG BÌNH)

**Mục tiêu:** Validation khi tạo Product dựa trên category-attribute binding  
**Thời gian ước tính:** 2-3 giờ  
**Dependencies:** Cần có Product module trước

### Task 2.1: API Endpoint để lấy attributes cho Product Form

**Priority:** 🟡 **HIGH**  
**Time:** 30 phút  
**Files:**

- `orchard-store-backend/.../controller/CategoryAttributeController.java`

**Checklist:**

- [ ] Thêm endpoint `GET /api/admin/category-attributes/{categoryId}/for-product`
- [ ] Trả về `List<ProductAttributeDTO>` (chỉ attributes, không có metadata)
- [ ] Include attribute values trong response
- [ ] Test với Postman

**Code:**

```java
@GetMapping("/{categoryId}/for-product")
public ResponseEntity<ApiResponse<List<ProductAttributeDTO>>> getAttributesForProduct(
        @PathVariable Long categoryId
) {
    List<CategoryAttribute> categoryAttributes =
        categoryAttributeService.getAttributesByCategory(categoryId);

    List<ProductAttributeDTO> attributes = categoryAttributes.stream()
        .map(ca -> productAttributeMapper.toDTO(ca.getAttribute()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách thuộc tính thành công", attributes)
    );
}
```

---

### Task 2.2: Validation trong ProductService

**Priority:** 🟡 **HIGH**  
**Time:** 1-2 giờ  
**Files:**

- `orchard-store-backend/.../service/ProductServiceImpl.java` (khi có)

**Checklist:**

- [ ] Tạo method `validateProductAttributes(Product product)`
- [ ] Lấy danh sách attributes được phép cho category
- [ ] Validate từng attribute của sản phẩm
- [ ] Throw exception nếu có attribute không hợp lệ
- [ ] Test với Product có attributes hợp lệ
- [ ] Test với Product có attributes không hợp lệ

**Code:**

```java
private void validateProductAttributes(Product product) {
    Category category = product.getCategory();
    if (category == null) {
        return; // Không có category thì không validate
    }

    // Lấy danh sách attributes được phép cho category này
    List<CategoryAttribute> allowedAttributes =
        categoryAttributeRepository.findByCategoryId(category.getId());

    Set<Long> allowedAttributeIds = allowedAttributes.stream()
        .map(ca -> ca.getAttribute().getId())
        .collect(Collectors.toSet());

    // Validate từng attribute của sản phẩm
    for (ProductAttributeValue pav : product.getAttributeValues()) {
        Long attributeId = pav.getAttribute().getId();
        if (!allowedAttributeIds.contains(attributeId)) {
            throw new IllegalArgumentException(
                String.format(
                    "Attribute '%s' không được phép cho category '%s'. " +
                    "Vui lòng gán attribute này vào category trước.",
                    pav.getAttribute().getAttributeName(),
                    category.getName()
                )
            );
        }
    }
}
```

---

## 🎯 Phase 3: Optimization & Enhancement (ƯU TIÊN THẤP)

**Mục tiêu:** Tối ưu và mở rộng tính năng  
**Thời gian ước tính:** 2-3 giờ  
**Dependencies:** Sau Phase 1 và Phase 2

### Task 3.1: Cải thiện UI/UX

**Priority:** 🟢 **MEDIUM**  
**Time:** 1-2 giờ  
**Checklist:**

- [ ] Thêm drag & drop để sắp xếp thứ tự attributes
- [ ] Thêm toggle "Required" cho mỗi attribute
- [ ] Thêm input "Display Order" cho mỗi attribute
- [ ] Thêm filter/search trong dropdown chọn attribute
- [ ] Thêm badge hiển thị domain của attribute (PERFUME/COSMETICS)
- [ ] Thêm confirmation dialog khi xóa attribute

---

### Task 3.2: Bulk Operations

**Priority:** 🟢 **MEDIUM**  
**Time:** 1 giờ  
**Checklist:**

- [ ] Thêm API endpoint để gán nhiều attributes cùng lúc
- [ ] Thêm UI để chọn multiple attributes và gán cùng lúc
- [ ] Thêm API endpoint để xóa nhiều attributes cùng lúc

---

### Task 3.3: Analytics & Reporting

**Priority:** 🟢 **LOW**  
**Time:** 1 giờ  
**Checklist:**

- [ ] Thêm API endpoint để lấy thống kê: Category nào có nhiều attributes nhất
- [ ] Thêm API endpoint để lấy thống kê: Attribute nào được dùng nhiều nhất
- [ ] Thêm UI để hiển thị thống kê (optional)

---

## 📅 Timeline Tổng Thể

### Week 1: Phase 1 (Frontend Integration)

| Day   | Tasks                                                           | Time |
| ----- | --------------------------------------------------------------- | ---- |
| Day 1 | Task 1.0 (Backend: API Endpoint Update Metadata)                | 0.5h |
| Day 1 | Task 1.1, 1.2, 1.3.1 (Service, Types, Hooks cơ bản)             | 1.5h |
| Day 1 | Task 1.3.2 (Hook Update Metadata)                               | 0.5h |
| Day 2 | Task 1.4 (Component CategoryAttributesSection với tất cả fixes) | 3-4h |
| Day 3 | Task 1.5 (Tích hợp vào CategoryFormSheet)                       | 1-2h |
| Day 4 | Task 1.6 (Testing & Bug Fixes)                                  | 1h   |

**Tổng:** 7.5-9.5 giờ (tăng do thêm metadata editing và các fixes)

### Week 2: Phase 2 (Backend Enhancement)

| Day   | Tasks                   | Time  |
| ----- | ----------------------- | ----- |
| Day 1 | Task 2.1 (API Endpoint) | 30min |
| Day 2 | Task 2.2 (Validation)   | 1-2h  |

**Tổng:** 1.5-2.5 giờ (chỉ khi có Product module)

### Week 3: Phase 3 (Optimization)

| Day     | Tasks                         | Time          |
| ------- | ----------------------------- | ------------- |
| Day 1-2 | Task 3.1 (UI/UX Improvements) | 1-2h          |
| Day 3   | Task 3.2 (Bulk Operations)    | 1h            |
| Day 4   | Task 3.3 (Analytics)          | 1h (optional) |

**Tổng:** 3-4 giờ (optional)

---

## ✅ Definition of Done

### Phase 1 (Frontend Integration)

- [ ] Admin có thể mở CategoryFormSheet
- [ ] Admin có thể chuyển sang tab "Cấu hình thuộc tính"
- [ ] Admin có thể xem danh sách attributes đã gán
- [ ] Admin có thể filter attributes theo Domain (PERFUME/COSMETICS/COMMON)
- [ ] Admin có thể search attributes bằng Command (Combobox)
- [ ] Admin có thể chọn và gán attribute mới
- [ ] Admin có thể chỉnh sửa metadata (required, displayOrder) cho attribute đã gán
- [ ] Admin có thể xóa attribute đã gán
- [ ] UI hiển thị loading states
- [ ] UI hiển thị error messages
- [ ] Toast messages hiển thị đúng (dùng useAppMutation)
- [ ] Cache được invalidate đúng cách
- [ ] Không có console errors
- [ ] Code được review và merge

### Phase 2 (Backend Enhancement)

- [ ] API endpoint `/api/admin/category-attributes/{categoryId}/for-product` hoạt động
- [ ] Validation trong ProductService hoạt động đúng
- [ ] Test cases pass
- [ ] Documentation được cập nhật

### Phase 3 (Optimization)

- [ ] UI/UX improvements được implement
- [ ] Bulk operations hoạt động (nếu implement)
- [ ] Code được review

---

## ⚠️ Audit Fixes (Đã xác nhận)

### Fix 1: Filter Domain trong UI chọn Attribute

**Vấn đề:** Dropdown chọn attribute sẽ rất hỗn độn nếu không filter theo domain.

**Giải pháp:**

- ✅ Thêm Tabs filter: ALL, PERFUME, COSMETICS, COMMON
- ✅ Filter `availableAttributes` theo `domainFilter` trước khi hiển thị
- ✅ Hiển thị domain badge trong CommandItem

**Code đã cập nhật trong Task 1.4**

---

### Fix 2: Dùng useAppMutation thay vì useMutation

**Vấn đề:** Vi phạm Coding Rules - phải dùng `useAppMutation` để tự động xử lý Toast & Error.

**Giải pháp:**

- ✅ Đã cập nhật Task 1.3 để dùng `useAppMutation`
- ✅ Tự động invalidate queries
- ✅ Tự động hiển thị toast success/error
- ✅ Tự động handle errors

**Code đã cập nhật trong Task 1.3**

---

### Fix 3: Dùng Command (Combobox) thay vì Select

**Vấn đề:** Với danh sách Attribute dài, dùng `<Select>` rất khó tìm.

**Giải pháp:**

- ✅ Dùng `Command` component của Shadcn (đã có sẵn trong dự án)
- ✅ Có tính năng Search/Filter built-in
- ✅ UI tốt hơn với keyboard navigation

**Code đã cập nhật trong Task 1.4**

---

### Fix 4: Thêm chỉnh sửa Metadata (is_required, display_order)

**Vấn đề:** Sau khi gán, Admin cần chỉnh được `is_required` và `display_order`.

**Giải pháp:**

- ✅ Thêm Switch "Bắt buộc" cho mỗi attribute đã gán
- ✅ Thêm Input "Thứ tự" để chỉnh `displayOrder`
- ✅ Tạo hook `useUpdateCategoryAttribute()` để update metadata
- ✅ Có thể cần thêm API endpoint mới: `PUT /api/admin/category-attributes/{categoryId}/{attributeId}`

**Code đã cập nhật trong Task 1.3.2 và Task 1.4**

---

## 🚨 Risks & Mitigation

### Risk 1: API không hoạt động đúng

**Mitigation:**

- Test API với Postman trước khi implement frontend
- Verify response format khớp với TypeScript types

### Risk 2: Cache không được invalidate đúng

**Mitigation:**

- Sử dụng React Query DevTools để debug
- Test cache invalidation sau mỗi mutation

### Risk 3: UI/UX không tốt

**Mitigation:**

- Tham khảo design của các components tương tự (BrandForm, AttributeForm)
- Test với user thật
- Iterate dựa trên feedback

### Risk 4: Performance issues với nhiều attributes

**Mitigation:**

- Sử dụng pagination nếu cần
- Lazy load attributes list
- Debounce search input

---

## 📝 Notes

- **Backend đã sẵn sàng:** Không cần thay đổi backend (trừ Phase 2)
- **Frontend là bottleneck:** Tập trung vào Phase 1
- **Testing quan trọng:** Đảm bảo test kỹ trước khi merge
- **Documentation:** Cập nhật docs sau khi hoàn thành

---

**End of Implementation Plan**
