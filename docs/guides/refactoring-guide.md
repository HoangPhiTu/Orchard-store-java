# ⚡ Quick Refactor Guide - Áp Dụng useAppMutation

## 🎯 Mục Tiêu

Refactor tất cả forms trong dự án để sử dụng `useAppMutation` hook mới.

**Kết quả:** Giảm 75-90% code, tự động hóa hoàn toàn error handling.

---

## 📋 Checklist 5 Bước

### Bước 1: Update Imports

**❌ Xóa:**

```typescript
import { AxiosError } from "axios";
import { handleApiError } from "@/lib/handle-error";
import { useCreateXXX, useUpdateXXX } from "@/hooks/use-xxx";
```

**✅ Thêm:**

```typescript
import { useAppMutation } from "@/hooks/use-app-mutation";
import { yourService } from "@/services/your.service";
```

---

### Bước 2: Replace Mutation Hooks

**❌ Cũ:**

```typescript
const createMutation = useCreateXXX({
  onSuccess: () => {
    toast.success("Success!");
    onClose();
    form.reset();
  },
  onError: (error) => {
    handleApiError(error as AxiosError, {
      setError: form.setError,
    });
  },
});
```

**✅ Mới:**

```typescript
const createMutation = useAppMutation({
  mutationFn: (data: YourFormData) => yourService.create(data),
  queryKey: "your-query-key",
  setError: form.setError,
  successMessage: "Success!",
  onSuccess: () => {
    onClose();
    form.reset();
  },
});
```

---

### Bước 3: Simplify onSubmit

**❌ Cũ:**

```typescript
const onSubmit = (data: YourFormData) => {
  // 50+ dòng validation thủ công
  if (!data.field1) {
    form.setError("field1", { message: "Required" });
    return;
  }
  if (!data.field2) {
    form.setError("field2", { message: "Required" });
    return;
  }
  // ... more validation

  // Build payload manually
  const payload = {
    field1: data.field1,
    field2: data.field2 || null,
    // ... more fields
  };

  mutation.mutate(payload);
};
```

**✅ Mới:**

```typescript
const onSubmit = (data: YourFormData) => {
  mutation.mutate(data);
};
```

---

### Bước 4: Remove Manual Validation

**Schema validation đã xử lý → Không cần validation thủ công!**

**❌ Xóa:**

```typescript
if (!data.email) {
  form.setError("email", { message: "Email required" });
}
if (!data.password) {
  form.setError("password", { message: "Password required" });
}
// ... all manual validation
```

**✅ Schema tự động:**

```typescript
// Không cần validation thủ công!
// Zod schema đã xử lý:
// - Required fields
// - Min/max length
// - Format validation
// - Custom validation
```

---

### Bước 5: Test

```bash
# Test form
1. Submit với data hợp lệ → Thành công
2. Submit với field trống → Lỗi inline (tiếng Việt)
3. Submit với email/phone trùng → Lỗi inline field
4. Submit không có quyền → Toast error
5. Check data đã refresh sau khi thành công
```

---

## 🎨 Examples

### Example 1: Brand Form

```typescript
// === FILE: brand-form.tsx ===

import { useForm } from "react-hook-form";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { brandService } from "@/services/brand.service";

interface BrandFormData {
  name: string;
  slug: string;
  description?: string;
}

function BrandForm({ brand, onClose }: BrandFormProps) {
  const form = useForm<BrandFormData>();
  const isEditing = Boolean(brand);

  // ✅ Create mutation
  const createMutation = useAppMutation({
    mutationFn: (data: BrandFormData) => brandService.create(data),
    queryKey: "brands",
    setError: form.setError,
    successMessage: "Tạo thương hiệu thành công!",
    onSuccess: () => {
      onClose();
      form.reset();
    },
  });

  // ✅ Update mutation
  const updateMutation = useAppMutation({
    mutationFn: ({ id, data }: { id: number; data: BrandFormData }) =>
      brandService.update(id, data),
    queryKey: "brands",
    setError: form.setError,
    successMessage: "Cập nhật thương hiệu thành công!",
    onSuccess: () => {
      onClose();
      form.reset();
    },
  });

  // ✅ Submit handler (3 dòng!)
  const onSubmit = (data: BrandFormData) => {
    isEditing
      ? updateMutation.mutate({ id: brand.id, data })
      : createMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button disabled={createMutation.isPending || updateMutation.isPending}>
        {isEditing ? "Cập nhật" : "Tạo mới"}
      </button>
    </form>
  );
}
```

---

### Example 2: Category Form

```typescript
// === FILE: category-form.tsx ===

import { useAppMutation } from "@/hooks/use-app-mutation";
import { categoryService } from "@/services/category.service";

interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: number | null;
}

function CategoryForm({ category, onClose }: CategoryFormProps) {
  const form = useForm<CategoryFormData>();

  const mutation = useAppMutation({
    mutationFn: category
      ? ({ id, data }: { id: number; data: CategoryFormData }) =>
          categoryService.update(id, data)
      : (data: CategoryFormData) => categoryService.create(data),
    queryKey: "categories",
    setError: form.setError,
    successMessage: category
      ? "Cập nhật danh mục thành công!"
      : "Tạo danh mục thành công!",
    onSuccess: () => {
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    category
      ? mutation.mutate({ id: category.id, data })
      : mutation.mutate(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

### Example 3: Delete Action (No Form)

```typescript
// === FILE: delete-dialog.tsx ===

import { useAppMutation } from "@/hooks/use-app-mutation";
import { productService } from "@/services/product.service";

function DeleteProductDialog({ productId, onClose }: Props) {
  const deleteMutation = useAppMutation({
    mutationFn: (id: number) => productService.delete(id),
    queryKey: "products",
    successMessage: "Xóa sản phẩm thành công!",
    onSuccess: onClose,
  });

  const handleDelete = () => {
    deleteMutation.mutate(productId);
  };

  return (
    <Dialog>
      <button onClick={handleDelete} disabled={deleteMutation.isPending}>
        {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
      </button>
    </Dialog>
  );
}
```

---

## 🔍 Common Patterns

### Pattern 1: Single Mutation (Create hoặc Update)

```typescript
const mutation = useAppMutation({
  mutationFn: isEditing
    ? ({ id, data }) => service.update(id, data)
    : (data) => service.create(data),
  queryKey: "your-key",
  setError: form.setError,
  successMessage: isEditing ? "Cập nhật thành công!" : "Tạo thành công!",
});

const onSubmit = (data) => {
  isEditing ? mutation.mutate({ id: item.id, data }) : mutation.mutate(data);
};
```

---

### Pattern 2: Separate Mutations (Create & Update)

```typescript
const createMutation = useAppMutation({
  mutationFn: (data) => service.create(data),
  queryKey: "your-key",
  setError: form.setError,
  successMessage: "Tạo thành công!",
});

const updateMutation = useAppMutation({
  mutationFn: ({ id, data }) => service.update(id, data),
  queryKey: "your-key",
  setError: form.setError,
  successMessage: "Cập nhật thành công!",
});

const onSubmit = (data) => {
  isEditing
    ? updateMutation.mutate({ id: item.id, data })
    : createMutation.mutate(data);
};
```

---

### Pattern 3: Multiple Query Invalidation

```typescript
const mutation = useAppMutation({
  mutationFn: (data) => service.create(data),
  queryKey: [
    ["products"], // Refresh products list
    ["categories"], // Refresh categories
    ["dashboard"], // Refresh dashboard
  ],
  successMessage: "Thành công!",
});
```

---

### Pattern 4: Nested Form Fields

```typescript
const mutation = useAppMutation({
  mutationFn: (data) => service.create(data),
  queryKey: "addresses",
  setError: form.setError,
  formFieldPrefix: "address.", // Backend error: { phone } → address.phone
  successMessage: "Lưu địa chỉ thành công!",
});
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Giữ lại validation thủ công

```typescript
// ❌ BAD
const onSubmit = (data) => {
  if (!data.email) {
    form.setError("email", { message: "Email required" });
    return;
  }
  mutation.mutate(data);
};
```

```typescript
// ✅ GOOD
const onSubmit = (data) => {
  mutation.mutate(data);
};
```

**Why?** Schema validation đã xử lý → không cần validation thủ công!

---

### ❌ Mistake 2: Giữ lại onError callback

```typescript
// ❌ BAD
const mutation = useAppMutation({
  mutationFn: createUser,
  setError: form.setError,
  onError: (error) => {
    // ❌ Không cần! useAppMutation tự động xử lý
    handleApiError(error, { setError: form.setError });
  },
});
```

```typescript
// ✅ GOOD
const mutation = useAppMutation({
  mutationFn: createUser,
  setError: form.setError, // ✅ Đủ rồi!
});
```

---

### ❌ Mistake 3: Quên truyền queryKey

```typescript
// ❌ BAD - Data không refresh sau khi thành công
const mutation = useAppMutation({
  mutationFn: createUser,
  successMessage: "Success!",
});
```

```typescript
// ✅ GOOD - Data tự động refresh
const mutation = useAppMutation({
  mutationFn: createUser,
  queryKey: "users", // ✅ Tự động invalidate
  successMessage: "Success!",
});
```

---

### ❌ Mistake 4: Build payload thủ công

```typescript
// ❌ BAD
const onSubmit = (data) => {
  const payload = {
    field1: data.field1,
    field2: data.field2 || null,
    // ... build manually
  };
  mutation.mutate(payload);
};
```

```typescript
// ✅ GOOD
const onSubmit = (data) => {
  mutation.mutate(data); // ✅ Pass directly
};
```

---

## 📊 Refactor Progress Tracker

Dùng checklist này để track progress:

### Forms Cần Refactor

- [x] ✅ `user-form-sheet.tsx` (DONE)
- [ ] ⏳ `brand-form.tsx`
- [ ] ⏳ `category-form.tsx`
- [ ] ⏳ `product-form.tsx`
- [ ] ⏳ `supplier-form.tsx`
- [ ] ⏳ `customer-form.tsx`
- [ ] ⏳ Other forms...

### Refactor Metrics

| Form            | Before    | After    | Saved |
| --------------- | --------- | -------- | ----- |
| user-form-sheet | 120 lines | 30 lines | -75%  |
| brand-form      | ?         | ?        | ?     |
| category-form   | ?         | ?        | ?     |
| product-form    | ?         | ?        | ?     |

---

## 🎓 Tips & Best Practices

### 1. Luôn truyền `setError`

```typescript
setError: form.setError; // ✅ Always include
```

→ Lỗi sẽ được gán vào đúng form field

---

### 2. Luôn truyền `queryKey`

```typescript
queryKey: "your-key"; // ✅ Always include
```

→ Data sẽ tự động refresh sau khi thành công

---

### 3. Dùng `successMessage` thay vì toast thủ công

```typescript
successMessage: "Thành công!"; // ✅ Auto toast
```

→ Không cần `toast.success()` trong `onSuccess`

---

### 4. Chỉ dùng `onSuccess` cho custom logic

```typescript
onSuccess: () => {
  // ✅ Only custom logic
  onClose();
  form.reset();
  router.push("/somewhere");
};
```

→ Không cần toast, invalidate trong đây (đã auto)

---

### 5. Loading state từ mutation

```typescript
const mutation = useAppMutation({
  /* ... */
});

<button disabled={mutation.isPending}>
  {mutation.isPending ? "Đang xử lý..." : "Submit"}
</button>;
```

---

## ✨ Kết Luận

**Quy trình 5 bước:**

1. Update imports
2. Replace mutation hooks
3. Simplify onSubmit
4. Remove manual validation
5. Test

**Kết quả:**

- ✅ Giảm 75-90% code
- ✅ Tự động hóa 100%
- ✅ Clean, maintainable code

**Happy Refactoring! 🚀**
