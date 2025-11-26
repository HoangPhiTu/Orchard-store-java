# 🧠 Bộ Não Xử Lý Lỗi API - `handleApiError`

## 📋 Tổng Quan

File `handle-error.ts` cung cấp **hàm tập trung duy nhất** để xử lý tất cả các lỗi API trong dự án. Hàm này tự động:

- ✅ **Dịch message** backend sang Tiếng Việt
- ✅ **Gán lỗi vào đúng field** trong form (React Hook Form)
- ✅ **Hiển thị toast** khi không có field cụ thể
- ✅ **Type-safe** với TypeScript

---

## 🚀 Cách Sử Dụng Cơ Bản

### 1. Import

```typescript
import { handleApiError } from "@/lib/handle-error";
```

### 2. Sử dụng trong Form Component

```typescript
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { handleApiError } from "@/lib/handle-error";

function UserForm() {
  const form = useForm<UserFormData>();
  
  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser(data);
      toast.success("Tạo thành công!");
    } catch (error) {
      // ✅ Chỉ cần 1 dòng code!
      handleApiError(error as AxiosError, {
        setError: form.setError,
      });
    }
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### 3. Sử dụng với React Query

```typescript
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    toast.success("Tạo thành công!");
  },
  onError: (error) => {
    // ✅ Xử lý lỗi ngay trong onError callback
    handleApiError(error as AxiosError, {
      setError: form.setError,
    });
  },
});
```

### 4. Không cần Form - Chỉ Toast

```typescript
const deleteUser = async (id: number) => {
  try {
    await api.delete(`/users/${id}`);
    toast.success("Xóa thành công!");
  } catch (error) {
    // ✅ Không truyền setError -> tự động hiển thị toast
    handleApiError(error as AxiosError);
  }
};
```

---

## 🎯 Các Tính Năng Tự Động

### 1. **Lỗi Validation (400/422)**

Backend trả về:
```json
{
  "status": 422,
  "errors": {
    "email": "must be a well-formed email address",
    "phone": "must not be blank"
  }
}
```

`handleApiError` tự động:
- ✅ Dịch: `"must be a well-formed email address"` → `"Email không hợp lệ"`
- ✅ Dịch: `"must not be blank"` → `"Không được để trống"`
- ✅ Gán vào `form.setError("email", ...)` và `form.setError("phone", ...)`
- ✅ Hiển thị error dưới input field

### 2. **Lỗi Conflict (409)**

Backend trả về:
```json
{
  "status": 409,
  "message": "Email đã tồn tại: test@example.com"
}
```

`handleApiError` tự động:
- ✅ Detect keyword `"email"` trong message
- ✅ Gán vào `form.setError("email", { message: "Email này đã được sử dụng" })`
- ✅ Hiển thị error dưới input field

**Các field được detect tự động:**
- `email` → "Email này đã được sử dụng"
- `phone` / `số điện thoại` → "Số điện thoại này đã được sử dụng"
- `sku` → "Mã SKU này đã tồn tại"
- `slug` → "Đường dẫn này đã được sử dụng"
- `code` → "Mã này đã tồn tại"
- `username` → "Tên đăng nhập này đã được sử dụng"

### 3. **Lỗi Không Có Quyền (403)**

```json
{
  "status": 403,
  "message": "Không có quyền truy cập"
}
```

`handleApiError` tự động:
- ✅ Toast: `"Không có quyền truy cập"`

### 4. **Lỗi Hierarchy (400)**

```json
{
  "status": 400,
  "message": "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn..."
}
```

`handleApiError` tự động:
- ✅ Toast với message từ backend (giữ nguyên)

### 5. **Lỗi Not Found (404)**

```json
{
  "status": 404,
  "message": "Không tìm thấy user với ID: 123"
}
```

`handleApiError` tự động:
- ✅ Toast với message từ backend

### 6. **Lỗi Server (500)**

```json
{
  "status": 500,
  "message": "Internal Server Error"
}
```

`handleApiError` tự động:
- ✅ Toast: `"Lỗi hệ thống. Vui lòng thử lại sau."`

### 7. **Network Error**

Khi mất kết nối:

`handleApiError` tự động:
- ✅ Toast: `"Mất kết nối máy chủ"`

---

## ⚙️ Options

### `setError` (optional)

Hàm `setError` từ React Hook Form. Nếu không truyền → chỉ hiển thị toast.

```typescript
handleApiError(error, {
  setError: form.setError, // Gán lỗi vào form fields
});
```

### `showToast` (optional, default: `true`)

Tắt toast nếu chỉ muốn gán lỗi vào form.

```typescript
handleApiError(error, {
  setError: form.setError,
  showToast: false, // Không hiển thị toast
});
```

**⚠️ Lưu ý:** Trong dự án này, axios interceptor đã xử lý toast rồi, nên nên set `showToast: false` khi dùng trong mutation callbacks để tránh duplicate toast.

### `formFieldPrefix` (optional)

Thêm prefix vào field name (dành cho nested forms).

```typescript
// Backend trả về: { phone: "đã tồn tại" }
// Muốn gán vào: address.phone

handleApiError(error, {
  setError: form.setError,
  formFieldPrefix: "address.", // Tự động thành "address.phone"
});
```

---

## 📝 Validation Messages Mapping

Các validation message phổ biến đã được map sẵn:

| Backend Message | Tiếng Việt |
|----------------|------------|
| `must not be blank` | Không được để trống |
| `must not be null` | Không được để trống |
| `must be a valid email` | Email không hợp lệ |
| `size must be between` | Độ dài không hợp lệ |
| `must be greater than` | Giá trị quá nhỏ |
| `must be a number` | Phải là số |
| `invalid phone number` | Số điện thoại không hợp lệ |

**Mở rộng:** Thêm mapping mới trong `VALIDATION_MESSAGE_MAP` trong file `handle-error.ts`.

---

## 🎨 Ví Dụ Thực Tế

### Ví dụ 1: User Form

```typescript
const form = useForm<UserFormData>();

const createUser = useCreateUser({
  onSuccess: () => {
    toast.success("Tạo người dùng thành công");
    form.reset();
  },
  onError: (error) => {
    handleApiError(error as AxiosError, {
      setError: form.setError,
      showToast: false, // Axios interceptor đã xử lý
    });
  },
});
```

**Kết quả:**
- ✅ Email trùng → Error dưới input email: "Email này đã được sử dụng"
- ✅ Phone trùng → Error dưới input phone: "Số điện thoại này đã được sử dụng"
- ✅ Email invalid → Error dưới input email: "Email không hợp lệ"
- ✅ Không có quyền → Toast: "Không có quyền truy cập"

### Ví dụ 2: Product Form

```typescript
const form = useForm<ProductFormData>();

const createProduct = useCreateProduct({
  onSuccess: () => {
    toast.success("Tạo sản phẩm thành công");
  },
  onError: (error) => {
    handleApiError(error as AxiosError, {
      setError: form.setError,
      showToast: false,
    });
  },
});
```

**Kết quả:**
- ✅ SKU trùng → Error dưới input SKU: "Mã SKU này đã tồn tại"
- ✅ Slug trùng → Error dưới input slug: "Đường dẫn này đã được sử dụng"
- ✅ Price < 0 → Error dưới input price: "Giá trị quá nhỏ"

### Ví dụ 3: Delete Action (không có form)

```typescript
const handleDelete = async (id: number) => {
  try {
    await deleteUser(id);
    toast.success("Xóa thành công!");
  } catch (error) {
    // Không có form → chỉ toast
    handleApiError(error as AxiosError);
  }
};
```

**Kết quả:**
- ✅ 403 → Toast: "Không có quyền truy cập"
- ✅ 404 → Toast: "Không tìm thấy dữ liệu"
- ✅ 500 → Toast: "Lỗi hệ thống"

---

## 🔧 Mở Rộng

### Thêm Validation Message Mới

Trong file `handle-error.ts`:

```typescript
const VALIDATION_MESSAGE_MAP: Record<string, string> = {
  // Existing...
  
  // ✅ Thêm message mới
  "must be unique": "Phải là duy nhất",
  "already in use": "Đã được sử dụng",
};
```

### Thêm Conflict Field Mới

```typescript
const CONFLICT_FIELD_MAP: Record<string, string> = {
  // Existing...
  
  // ✅ Thêm field mới
  "barcode": "barcode",
  "mã vạch": "barcode",
};

const CONFLICT_MESSAGES: Record<string, string> = {
  // Existing...
  
  // ✅ Thêm message tương ứng
  barcode: "Mã vạch này đã tồn tại",
};
```

---

## 📚 Files Liên Quan

- **Main:** `src/lib/handle-error.ts`
- **Example:** `src/lib/handle-error.example.ts`
- **Real Usage:** `src/components/features/user/user-form-sheet.tsx`

---

## ✨ Lợi Ích

1. **DRY (Don't Repeat Yourself):**
   - Không cần viết lại logic xử lý lỗi ở mọi component
   - Chỉ 1 dòng code: `handleApiError(error, { setError: form.setError })`

2. **Consistency (Nhất quán):**
   - Tất cả lỗi được xử lý theo cùng 1 cách
   - Message tiếng Việt thống nhất

3. **Maintainability (Dễ bảo trì):**
   - Thêm/sửa message chỉ cần edit 1 chỗ
   - Dễ mở rộng thêm field mới

4. **Type Safety:**
   - TypeScript đảm bảo type an toàn
   - IntelliSense hỗ trợ tốt

5. **Better UX:**
   - Lỗi được hiển thị đúng chỗ (inline field hoặc toast)
   - Message rõ ràng, thân thiện

---

## 🎓 Best Practices

1. **Luôn dùng `handleApiError`** thay vì tự xử lý lỗi
2. **Set `showToast: false`** trong mutation callbacks (vì axios interceptor đã xử lý)
3. **Cast error** sang `AxiosError` khi catch
4. **Mở rộng mapping** khi có message mới từ backend

---

## 🙏 Credits

Tạo bởi: AI Assistant  
Dự án: Orchard Store Admin Dashboard

