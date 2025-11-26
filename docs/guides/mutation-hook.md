# 🚀 useAppMutation - The "Future-Proof" Hook

## 📋 Tổng Quan

`useAppMutation` là Custom Hook tự động hóa **TẤT CẢ** việc xử lý mutation trong dự án. Không cần viết onError, onSuccess, invalidateQueries thủ công nữa!

**Wrapper của `useMutation` (TanStack Query) với tự động:**
- ✅ Error handling (gán vào form fields + toast)
- ✅ Success toast
- ✅ Query invalidation (refresh data)
- ✅ Type-safe với TypeScript

---

## 🎯 Cách Sử Dụng Cơ Bản

### Import

```typescript
import { useAppMutation } from "@/hooks/use-app-mutation";
```

### Sử dụng trong Component

```typescript
import { useForm } from "react-hook-form";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { userService } from "@/services/user.service";

function UserForm() {
  const form = useForm<UserFormData>();
  
  // ✅ Chỉ cần khai báo mutation
  const mutation = useAppMutation({
    mutationFn: (data: UserFormData) => userService.createUser(data),
    queryKey: "users",                    // Tự động refresh
    setError: form.setError,              // Tự động gán lỗi vào fields
    successMessage: "Tạo thành công!",    // Tự động toast success
  });
  
  const onSubmit = (data: UserFormData) => {
    // ✅ Không cần try-catch!
    // ✅ Không cần onError callback!
    // ✅ Không cần onSuccess callback!
    mutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Đang tạo..." : "Tạo mới"}
      </button>
    </form>
  );
}
```

---

## ⚙️ Options

### `mutationFn` (required)

Hàm mutation - API call của bạn.

```typescript
mutationFn: (data: UserFormData) => userService.createUser(data)
```

### `queryKey` (optional)

Query key để invalidate sau khi mutation thành công.

**Single query key:**
```typescript
queryKey: "users"
// hoặc
queryKey: ["users"]
```

**Multiple query keys:**
```typescript
queryKey: [
  ["users"],
  ["categories"],
  ["dashboard", "stats"]
]
```

### `setError` (optional)

Hàm `setError` từ React Hook Form. Nếu không truyền → chỉ hiển thị toast lỗi.

```typescript
const form = useForm<UserFormData>();

useAppMutation({
  mutationFn: createUser,
  setError: form.setError, // ✅ Tự động gán lỗi vào form fields
});
```

### `successMessage` (optional)

Message hiển thị toast khi thành công.

```typescript
successMessage: "Tạo người dùng thành công!"
```

### `onSuccess` (optional)

Custom callback sau khi thành công (gọi sau invalidate queries + toast).

```typescript
onSuccess: (data, variables) => {
  console.log("Custom logic", data);
  onOpenChange(false); // Đóng modal
  form.reset();        // Reset form
}
```

### `onError` (optional)

Custom callback sau khi lỗi (gọi sau handleApiError).

```typescript
onError: (error, variables) => {
  console.log("Custom error logic", error);
  // Log to analytics, etc.
}
```

### `showErrorToast` (optional, default: `false`)

Có hiển thị toast error hay không.

```typescript
showErrorToast: false // Default - axios interceptor đã xử lý
showErrorToast: true  // Override - hiển thị toast error trong hook
```

### `showSuccessToast` (optional, default: `true`)

Có hiển thị toast success hay không.

```typescript
showSuccessToast: true  // Default - hiển thị toast
showSuccessToast: false // Tắt toast - tự xử lý trong onSuccess
```

### `formFieldPrefix` (optional)

Prefix cho form field names (dành cho nested forms).

```typescript
formFieldPrefix: "address." // Backend: { phone: "lỗi" } → Gán vào: address.phone
```

---

## 🎨 Ví Dụ Thực Tế

### 1. Create User Form

```typescript
const form = useForm<UserFormData>();

const createUserMutation = useAppMutation({
  mutationFn: (data: UserFormData) => userService.createUser(data),
  queryKey: ["admin", "users"],
  setError: form.setError,
  successMessage: "Tạo người dùng thành công!",
  onSuccess: () => {
    onOpenChange(false);
    form.reset();
  },
});

const onSubmit = (data: UserFormData) => {
  createUserMutation.mutate(data);
};
```

**Kết quả tự động:**
- ✅ Lỗi validation → Gán vào form fields
- ✅ Email/phone conflict → Gán vào fields tương ứng
- ✅ Không có quyền → Toast error
- ✅ Thành công → Toast success + Refresh danh sách users
- ✅ Custom logic (đóng modal, reset form)

### 2. Update Product

```typescript
const form = useForm<ProductFormData>();

const updateProductMutation = useAppMutation({
  mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
    productService.updateProduct(id, data),
  queryKey: [["products"], ["categories"]], // Refresh 2 queries
  setError: form.setError,
  successMessage: "Cập nhật sản phẩm thành công!",
});

const onSubmit = (data: ProductFormData) => {
  updateProductMutation.mutate({ id: productId, data });
};
```

### 3. Delete User (không có form)

```typescript
const deleteUserMutation = useAppMutation({
  mutationFn: (userId: number) => userService.deleteUser(userId),
  queryKey: "users",
  successMessage: "Xóa người dùng thành công!",
  // Không truyền setError → chỉ hiển thị toast error
});

const handleDelete = (userId: number) => {
  if (confirm("Bạn có chắc muốn xóa?")) {
    deleteUserMutation.mutate(userId);
  }
};
```

### 4. Multiple Query Invalidation

```typescript
const createOrderMutation = useAppMutation({
  mutationFn: createOrder,
  queryKey: [
    ["orders"],           // Refresh orders list
    ["dashboard"],        // Refresh dashboard
    ["stats", "revenue"], // Refresh revenue stats
  ],
  successMessage: "Tạo đơn hàng thành công!",
});
```

### 5. Custom Success + Error Handling

```typescript
const mutation = useAppMutation({
  mutationFn: createProduct,
  queryKey: "products",
  setError: form.setError,
  successMessage: "Tạo sản phẩm thành công!",
  
  onSuccess: (data) => {
    // Custom logic
    console.log("Product created:", data);
    router.push(`/products/${data.id}`);
  },
  
  onError: (error) => {
    // Custom logic
    console.error("Error:", error);
    // Log to Sentry, etc.
  },
});
```

### 6. Nested Form Fields

```typescript
const form = useForm<AddressFormData>();

const mutation = useAppMutation({
  mutationFn: createAddress,
  setError: form.setError,
  formFieldPrefix: "address.", // Backend: { phone: "lỗi" } → address.phone
  successMessage: "Lưu địa chỉ thành công!",
});
```

---

## 📊 So Sánh: Trước vs Sau

### ❌ TRƯỚC (Cách cũ - 60+ dòng code)

```typescript
const form = useForm<UserFormData>();
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: async (data) => {
    // Invalidate queries
    await queryClient.invalidateQueries({ queryKey: ["users"] });
    
    // Show success toast
    toast.success("Tạo người dùng thành công!");
    
    // Custom logic
    onOpenChange(false);
    form.reset();
  },
  onError: (error) => {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    
    // Handle 409 Conflict
    if (status === 409) {
      const message = extractErrorMessage(axiosError);
      if (message.includes("email")) {
        form.setError("email", { message: "Email đã tồn tại" });
      }
      if (message.includes("phone")) {
        form.setError("phone", { message: "Phone đã tồn tại" });
      }
    }
    
    // Handle 422 Validation
    else if (status === 422) {
      const errors = extractValidationErrors(axiosError);
      if (errors) {
        for (const [field, msg] of Object.entries(errors)) {
          const translated = translateMessage(msg);
          form.setError(field, { message: translated });
        }
      }
    }
    
    // Handle other errors
    else {
      toast.error("Có lỗi xảy ra");
    }
  },
});

// ... 60+ dòng code xử lý lỗi, success, invalidate
```

### ✅ SAU (Cách mới - 10 dòng code)

```typescript
const form = useForm<UserFormData>();

const mutation = useAppMutation({
  mutationFn: createUser,
  queryKey: "users",
  setError: form.setError,
  successMessage: "Tạo người dùng thành công!",
  onSuccess: () => {
    onOpenChange(false);
    form.reset();
  },
});

// ✅ Tất cả xử lý lỗi, success, invalidate tự động!
```

**Giảm 83% code! (60+ dòng → 10 dòng)**

---

## 🔥 Các Tính Năng Tự Động

### 1. Error Handling

**Validation Errors (400/422):**
```json
Backend: { "errors": { "email": "must be a valid email" } }
```
→ Tự động: Dịch sang "Email không hợp lệ" và gán vào field `email`

**Conflict Errors (409):**
```json
Backend: { "message": "Email đã tồn tại: test@example.com" }
```
→ Tự động: Detect keyword "email" và gán vào field `email` với message "Email này đã được sử dụng"

**Permission Errors (403):**
→ Tự động: Toast "Không có quyền truy cập"

**Server Errors (500):**
→ Tự động: Toast "Lỗi hệ thống"

### 2. Success Handling

- ✅ Tự động invalidate queries (refresh data)
- ✅ Tự động hiển thị toast success
- ✅ Gọi custom onSuccess callback (nếu có)

### 3. Query Invalidation

```typescript
queryKey: "users"
// → Refresh ["users"]

queryKey: ["users", "list"]
// → Refresh ["users", "list"]

queryKey: [["users"], ["categories"]]
// → Refresh cả ["users"] và ["categories"]
```

---

## 💡 Best Practices

1. **Luôn dùng `useAppMutation`** thay vì `useMutation` trực tiếp
2. **Set `showErrorToast: false`** (default) vì axios interceptor đã xử lý
3. **Truyền `setError`** cho forms để gán lỗi vào fields
4. **Sử dụng `successMessage`** để hiển thị toast success tự động
5. **Invalidate đúng queries** để refresh data kịp thời

---

## 🎓 Advanced Usage

### Type-Safe với Generics

```typescript
interface CreateUserResponse {
  id: number;
  email: string;
}

interface CreateUserVariables {
  email: string;
  password: string;
}

const mutation = useAppMutation<
  CreateUserResponse,        // TData
  AxiosError,                // TError
  CreateUserVariables,       // TVariables
  unknown                    // TContext
>({
  mutationFn: createUser,
  queryKey: "users",
  successMessage: "Tạo thành công!",
});

// ✅ Type-safe: data, error, variables đều có type chính xác
mutation.mutate({ email: "...", password: "..." });
```

### With Context

```typescript
const mutation = useAppMutation({
  mutationFn: createUser,
  queryKey: "users",
  successMessage: "Tạo thành công!",
  
  // Optimistic update
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ["users"] });
    const previousUsers = queryClient.getQueryData(["users"]);
    
    // Update cache optimistically
    queryClient.setQueryData(["users"], (old) => [...old, newUser]);
    
    // Return context
    return { previousUsers };
  },
  
  onError: (err, newUser, context) => {
    // Rollback on error
    if (context?.previousUsers) {
      queryClient.setQueryData(["users"], context.previousUsers);
    }
  },
});
```

---

## 📚 Files Liên Quan

- **Main:** `src/hooks/use-app-mutation.ts`
- **Example:** `src/hooks/use-app-mutation.example.ts`
- **Real Usage:** `src/components/features/user/user-form-sheet.tsx`
- **Error Handler:** `src/lib/handle-error.ts`

---

## ✨ Lợi Ích

1. **DRY (Don't Repeat Yourself):**
   - Không cần viết lại logic xử lý lỗi ở mọi mutation
   - Chỉ 1 hook: `useAppMutation`

2. **Consistency (Nhất quán):**
   - Tất cả mutations xử lý lỗi theo cùng 1 cách
   - Message tiếng Việt thống nhất

3. **Maintainability (Dễ bảo trì):**
   - Sửa 1 chỗ → áp dụng cho tất cả
   - Dễ mở rộng thêm tính năng

4. **Type Safety:**
   - TypeScript đảm bảo type an toàn
   - IntelliSense hỗ trợ tốt

5. **Better UX:**
   - Lỗi được hiển thị đúng chỗ (inline field hoặc toast)
   - Success toast tự động
   - Data refresh tự động

6. **Faster Development:**
   - Giảm 80-90% code xử lý mutation
   - Dev chỉ cần focus vào business logic

---

## 🙏 Credits

Tạo bởi: AI Assistant  
Dự án: Orchard Store Admin Dashboard  
Hook này kết hợp: `useMutation` + `handleApiError` + Auto invalidation

