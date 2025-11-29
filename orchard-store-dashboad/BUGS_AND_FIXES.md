# Báo Cáo Lỗi và Cách Khắc Phục - Admin Dashboard

## Tổng Quan

Tài liệu này liệt kê các lỗi logic, vấn đề hiệu suất và lỗ hổng bảo mật đã được phát hiện trong codebase của Admin Dashboard (phần Users, Brands, và Categories), cùng với giải pháp khắc phục chi tiết.

**Ngày tạo:** $(date)  
**Phạm vi:** Users Management, Brands Management, Categories Management

---

## 1. LỖI LOGIC

### 1.1. User Service - getUser() Workaround Không Hiệu Quả

**File:** `src/services/user.service.ts` (dòng 60-75)

**Vấn đề:**

```typescript
getUser: (id: number): Promise<User> => {
  // TODO: Backend cần thêm endpoint GET /api/admin/users/{id}
  // Tạm thời sử dụng workaround: lấy từ danh sách với filter
  return http
    .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, {
      params: { size: 1 },
    })
    .then((res) => {
      const page = unwrapPage(res);
      const user = page.content.find((u) => u.id === id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user;
    });
};
```

**Mô tả:**

- Method này fetch toàn bộ danh sách users (với `size: 1` nhưng backend có thể trả về nhiều hơn)
- Sau đó filter trong frontend để tìm user theo ID
- Không hiệu quả, tốn băng thông và có thể không tìm thấy user nếu user không nằm trong page đầu tiên

**Giải pháp:**

1. **Ưu tiên:** Thêm endpoint `GET /api/admin/users/{id}` ở backend
2. **Tạm thời:** Sử dụng query với filter chính xác hơn:

```typescript
getUser: (id: number): Promise<User> => {
  // Tạm thời: Fetch với size lớn hơn và filter
  return http
    .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, {
      params: { size: 1000 }, // Hoặc dùng keyword search nếu backend hỗ trợ
    })
    .then((res) => {
      const page = unwrapPage(res);
      const user = page.content.find((u) => u.id === id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user;
    });
};
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 1.2. Category Form - Logic Slug Generation Phức Tạp

**File:** `src/components/features/catalog/category-form-sheet.tsx` (dòng 189-216)

**Vấn đề:**

```typescript
useEffect(() => {
  if (!watchedName) {
    if (!isEditing || !slugManuallyEditedRef.current) {
      form.setValue("slug", "", { shouldValidate: true, shouldDirty: true });
    }
    return;
  }
  if (!slugManuallyEditedRef.current || !isEditing) {
    const generated = slugify(watchedName);
    form.setValue("slug", generated, {
      shouldValidate: true,
      shouldDirty: !isEditing,
    });
  }
}, [watchedName, isEditing, form]);
```

**Mô tả:**

- Logic phức tạp với nhiều điều kiện lồng nhau
- `slugManuallyEditedRef.current` có thể không sync với state
- Có thể gây race condition khi user edit slug và name cùng lúc

**Giải pháp:**

```typescript
// Sử dụng state thay vì ref
const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

useEffect(() => {
  if (!watchedName) {
    if (!isEditing || !isSlugManuallyEdited) {
      form.setValue("slug", "", { shouldValidate: true, shouldDirty: true });
    }
    return;
  }

  // Chỉ auto-generate nếu chưa edit thủ công
  if (!isSlugManuallyEdited || !isEditing) {
    const generated = slugify(watchedName);
    form.setValue("slug", generated, {
      shouldValidate: true,
      shouldDirty: !isEditing,
    });
  }
}, [watchedName, isEditing, isSlugManuallyEdited, form]);

// Reset flag khi đóng form
useEffect(() => {
  if (!open) {
    setIsSlugManuallyEdited(false);
  }
}, [open]);
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

### 1.3. Brand Form - Logic Upload Ảnh Có Thể Gây Memory Leak

**File:** `src/components/features/catalog/brand-form-sheet.tsx` (dòng 158-207)

**Vấn đề:**

```typescript
const handleLogoChange = (file: File | null) => {
  setLogoFile(file);
  // Không set File vào logoUrl - chỉ lưu vào state riêng
  if (!file) {
    form.setValue("logoUrl", undefined);
  }
};
```

**Mô tả:**

- File object được lưu trong state nhưng không được cleanup khi component unmount
- Nếu user upload file lớn, có thể gây memory leak
- Không có validation file size/type trước khi lưu vào state

**Giải pháp:**

```typescript
// Thêm validation và cleanup
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const handleLogoChange = (file: File | null) => {
  if (file) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn. Kích thước tối đa là 5MB");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)");
      return;
    }
  }

  setLogoFile(file);
  if (!file) {
    form.setValue("logoUrl", undefined);
  }
};

// Cleanup khi unmount
useEffect(() => {
  return () => {
    // Revoke object URL nếu có
    if (logoFile && logoFile instanceof File) {
      // File object sẽ được garbage collected tự động
      // Nhưng nếu có preview URL, cần revoke
    }
  };
}, [logoFile]);
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 1.4. User Form - Reset Form Logic Có Thể Gây Infinite Loop

**File:** `src/components/features/user/user-form-sheet.tsx` (dòng 162-177)

**Vấn đề:**

```typescript
useEffect(() => {
  if (user) {
    form.reset({
      fullName: user.fullName,
      email: user.email,
      password: "", // Don't pre-fill password
      phone: user.phone || null,
      roleIds: userRoleIds,
      status: user.status,
      avatarUrl: user.avatarUrl || null,
    });
  } else {
    form.reset(DEFAULT_VALUES);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.id, userRoleIds.join(",")]); // Use user.id and stringified roleIds to prevent infinite loop
```

**Mô tả:**

- Dependency `userRoleIds.join(",")` có thể thay đổi mỗi lần render nếu `userRoleIds` là array mới
- Có thể gây infinite loop nếu `userRoleIds` được tạo lại mỗi lần render

**Giải pháp:**

```typescript
// Sử dụng useMemo để stable reference
const userRoleIdsString = useMemo(() => userRoleIds.join(","), [userRoleIds]);

useEffect(() => {
  if (user) {
    form.reset({
      fullName: user.fullName,
      email: user.email,
      password: "",
      phone: user.phone || null,
      roleIds: userRoleIds,
      status: user.status,
      avatarUrl: user.avatarUrl || null,
    });
  } else {
    form.reset(DEFAULT_VALUES);
  }
}, [user?.id, userRoleIdsString, form]); // Sử dụng stringified version
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

## 2. VẤN ĐỀ HIỆU SUẤT

### 2.1. Console.log Trong Production Code

**File:** Nhiều file (67 matches trong 23 files)

**Vấn đề:**

- Có nhiều `console.log`, `console.error`, `console.warn` trong production code
- Làm chậm ứng dụng và có thể leak thông tin nhạy cảm

**Ví dụ:**

```typescript
// src/components/features/user/user-form-sheet.tsx
console.log("🚀 onSubmit called with data:", {...});
console.log("📤 Uploading image:", data.avatarUrl.name);
console.log("✅ Image uploaded successfully:", finalAvatarUrl);
```

**Giải pháp:**

1. **Sử dụng environment variable để control:**

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
    // Trong production, có thể gửi lên error tracking service
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
};
```

2. **Thay thế tất cả console.log bằng logger:**

```typescript
import { logger } from "@/lib/logger";

// Thay vì
console.log("🚀 onSubmit called with data:", data);

// Dùng
logger.log("🚀 onSubmit called with data:", data);
```

3. **Hoặc sử dụng ESLint rule để tự động remove:**

```json
// .eslintrc.json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

**Mức độ nghiêm trọng:** ⚠️ Low (nhưng nên fix)

---

### 2.2. Category Form - Fetch Tất Cả Categories Với Size=1000

**File:** `src/components/features/catalog/category-form-sheet.tsx` (dòng 120-129)

**Vấn đề:**

```typescript
// Fetch all categories for parent selection (without pagination)
const allCategoriesQuery = useCategories({
  size: 1000, // Large size to get all categories
});
```

**Mô tả:**

- Fetch 1000 categories mỗi lần mở form, ngay cả khi chỉ cần một vài categories
- Không có caching hiệu quả
- Có thể gây chậm nếu có nhiều categories

**Giải pháp:**

1. **Sử dụng tree endpoint nếu có:**

```typescript
// Sử dụng tree endpoint thay vì paginated list
const allCategoriesQuery = useCategoriesTree();
```

2. **Hoặc lazy load với search:**

```typescript
// Chỉ fetch khi user mở parent selector
const [shouldFetchAll, setShouldFetchAll] = useState(false);

const allCategoriesQuery = useCategories(
  shouldFetchAll ? { size: 1000 } : undefined,
  { enabled: shouldFetchAll }
);

// Trigger fetch khi mở popover
const handleParentSelectOpenChange = useCallback(
  (nextOpen: boolean) => {
    setIsParentSelectOpen(nextOpen);
    if (nextOpen && !shouldFetchAll) {
      setShouldFetchAll(true);
    }
    if (!nextOpen) {
      resetParentSearch();
    }
  },
  [resetParentSearch, shouldFetchAll]
);
```

3. **Hoặc sử dụng virtual scrolling cho parent selector**

**Mức độ nghiêm trọng:** ⚠️ Medium

**Trạng thái:** ✅ Đã sửa - Lazy load categories chỉ khi mở parent selector

---

### 2.3. User Form - Nhiều useEffect Có Thể Gây Re-render Không Cần Thiết

**File:** `src/components/features/user/user-form-sheet.tsx`

**Vấn đề:**

- Có nhiều `useEffect` và `useWatch` hooks
- Mỗi lần form value thay đổi có thể trigger nhiều re-renders

**Giải pháp:**

1. **Combine các useEffect liên quan:**

```typescript
// Thay vì nhiều useEffect riêng biệt
useEffect(() => {
  // Effect 1
}, [dependency1]);

useEffect(() => {
  // Effect 2
}, [dependency2]);

// Combine thành một
useEffect(() => {
  // Effect 1
  // Effect 2
}, [dependency1, dependency2]);
```

2. **Sử dụng `useMemo` và `useCallback` để optimize:**

```typescript
// Memoize expensive computations
const computedValue = useMemo(() => {
  // Expensive computation
}, [dependencies]);

// Memoize callbacks
const handleChange = useCallback(
  (value: string) => {
    // Handler logic
  },
  [dependencies]
);
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

### 2.4. Brand Form - Không Cleanup Image File Khi Unmount

**File:** `src/components/features/catalog/brand-form-sheet.tsx`

**Vấn đề:**

- File object được lưu trong state nhưng không được cleanup
- Có thể gây memory leak với file lớn

**Giải pháp:**

```typescript
// Cleanup khi unmount hoặc khi đóng form
useEffect(() => {
  return () => {
    // Revoke object URL nếu có preview
    if (logoFile && logoFile instanceof File) {
      // File object sẽ được garbage collected
      // Nhưng nếu có object URL, cần revoke
      // const previewUrl = URL.createObjectURL(logoFile);
      // URL.revokeObjectURL(previewUrl);
    }
  };
}, [logoFile]);

// Hoặc cleanup khi đóng form
useEffect(() => {
  if (!open) {
    setLogoFile(null);
  }
}, [open]);
```

**Mức độ nghiêm trọng:** ⚠️ Low

---

## 3. LỖ HỔNG BẢO MẬT

### 3.1. Token Được Lưu Trong Cookie Và LocalStorage

**File:** `src/stores/auth-store.ts`, `src/lib/axios-client.ts`

**Vấn đề:**

```typescript
// auth-store.ts
persistToken(data.accessToken, payload.remember);
// Lưu vào cả cookie và localStorage

// axios-client.ts
const token = Cookies.get(TOKEN_KEY);
// Lấy từ cookie
```

**Mô tả:**

- Token được lưu trong cả cookie và localStorage
- Có thể bị XSS attack nếu localStorage bị compromise
- Cookie không có `HttpOnly` flag (phải set ở backend)

**Giải pháp:**

1. **Chỉ lưu token trong cookie với HttpOnly flag (backend):**

   - Backend nên set cookie với `HttpOnly`, `Secure`, `SameSite=Strict`
   - Frontend không cần lưu token trong localStorage

2. **Nếu phải lưu trong localStorage:**

```typescript
// Thêm encryption cho sensitive data
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-key";

const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};

const decryptToken = (encryptedToken: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Lưu encrypted
localStorage.setItem(TOKEN_KEY, encryptToken(token));

// Đọc và decrypt
const encrypted = localStorage.getItem(TOKEN_KEY);
const token = encrypted ? decryptToken(encrypted) : null;
```

3. **Sử dụng secure storage (nếu có):**
   - Sử dụng `sessionStorage` thay vì `localStorage` (tự động clear khi đóng tab)
   - Hoặc sử dụng secure storage library

**Mức độ nghiêm trọng:** 🔴 High

---

### 3.2. Không Có Rate Limiting Trên Client Side

**File:** `src/components/features/user/reset-password-dialog.tsx`, các form components

**Vấn đề:**

- Không có rate limiting cho các actions quan trọng như:
  - Reset password
  - Change email
  - Login attempts
  - Form submissions

**Giải pháp:**

1. **Implement client-side rate limiting:**

```typescript
// src/lib/security/rate-limit.ts
interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  key: string;
}

export const useRateLimit = (options: RateLimitOptions) => {
  const { maxAttempts, windowMs, key } = options;

  const checkRateLimit = (): boolean => {
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          count: 1,
          resetAt: Date.now() + windowMs,
        })
      );
      return true;
    }

    const data = JSON.parse(stored);

    if (Date.now() > data.resetAt) {
      // Reset window
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          count: 1,
          resetAt: Date.now() + windowMs,
        })
      );
      return true;
    }

    if (data.count >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    // Increment count
    data.count++;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  };

  return { checkRateLimit };
};

// Sử dụng trong component
const { checkRateLimit } = useRateLimit({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  key: "reset_password",
});

const handleSubmit = async () => {
  if (!checkRateLimit()) {
    toast.error("Quá nhiều lần thử. Vui lòng đợi 15 phút.");
    return;
  }
  // ... submit logic
};
```

2. **Backend cũng phải có rate limiting (quan trọng hơn)**

**Mức độ nghiêm trọng:** 🔴 High

---

### 3.3. Input Validation Chỉ Ở Client Side

**File:** Tất cả form components

**Vấn đề:**

- Validation chỉ được thực hiện ở client side với Zod
- Không có server-side validation (hoặc không đầy đủ)
- Attacker có thể bypass client validation

**Giải pháp:**

1. **Backend phải có validation đầy đủ:**

   - Sử dụng Bean Validation (Java) hoặc tương đương
   - Validate tất cả inputs từ client

2. **Client validation chỉ để UX tốt hơn:**

   - Hiển thị lỗi ngay lập tức
   - Nhưng không tin tưởng client validation

3. **Validate file uploads:**

```typescript
// Validate file type, size, content
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type không hợp lệ" };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File quá lớn" };
  }

  // Check file content (magic bytes)
  // Có thể validate bằng cách đọc first bytes của file

  return { valid: true };
};
```

**Mức độ nghiêm trọng:** 🔴 High

---

### 3.4. Image Upload Không Validate File Type/Size Đầy Đủ

**File:** `src/components/shared/image-upload.tsx`, form components

**Vấn đề:**

- Chỉ validate ở client side
- Không validate file content (magic bytes)
- Có thể upload file độc hại với extension giả mạo

**Giải pháp:**

```typescript
// Validate file content (magic bytes)
const validateImageContent = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer.slice(0, 4));

      // Check magic bytes
      // JPEG: FF D8 FF
      // PNG: 89 50 4E 47
      // WebP: RIFF ... WEBP
      const isJPEG =
        bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const isPNG =
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47;

      resolve(isJPEG || isPNG);
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

// Sử dụng trong upload handler
const handleFileChange = async (file: File | null) => {
  if (!file) {
    setImageFile(null);
    return;
  }

  // Validate file type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)");
    return;
  }

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    toast.error("File quá lớn. Kích thước tối đa là 5MB");
    return;
  }

  // Validate file content
  const isValidContent = await validateImageContent(file);
  if (!isValidContent) {
    toast.error("File không phải là ảnh hợp lệ");
    return;
  }

  setImageFile(file);
};
```

**Mức độ nghiêm trọng:** ⚠️ Medium

---

### 3.5. Password Reset Không Có Rate Limiting

**File:** `src/components/features/user/reset-password-dialog.tsx`

**Vấn đề:**

- Không có rate limiting cho password reset
- Attacker có thể spam reset password requests

**Giải pháp:**

- Áp dụng rate limiting như đã mô tả ở mục 3.2
- Backend cũng phải có rate limiting

**Mức độ nghiêm trọng:** 🔴 High

---

## 4. CÁC VẤN ĐỀ KHÁC

### 4.1. Error Handling Không Nhất Quán

**Vấn đề:**

- Một số components hiển thị error message khác nhau
- Không có error boundary cho một số components

**Giải pháp:**

- Sử dụng global error handler
- Wrap components quan trọng với ErrorBoundary

---

### 4.2. Type Safety Có Thể Cải Thiện

**Vấn đề:**

- Một số nơi sử dụng `any` hoặc type assertions không an toàn

**Giải pháp:**

- Loại bỏ tất cả `any`
- Sử dụng type guards thay vì type assertions

---

## 5. KHUYẾN NGHỊ TỔNG THỂ

### 5.1. Code Quality

- ✅ Thêm ESLint rules để catch các vấn đề sớm
- ✅ Thêm Prettier để format code nhất quán
- ✅ Thêm Husky để chạy linter trước khi commit

### 5.2. Testing

- ✅ Thêm unit tests cho các services
- ✅ Thêm integration tests cho các forms
- ✅ Thêm E2E tests cho các flows quan trọng

### 5.3. Security

- ✅ Implement Content Security Policy (CSP)
- ✅ Thêm XSS protection headers
- ✅ Implement CSRF protection
- ✅ Regular security audits

### 5.4. Performance

- ✅ Implement code splitting
- ✅ Lazy load components
- ✅ Optimize images
- ✅ Implement service worker cho caching

---

## 6. PRIORITY FIXES

### High Priority (Fix ngay):

1. 🔴 Token storage security (3.1)
2. 🔴 Rate limiting (3.2, 3.5)
3. 🔴 Input validation (3.3)

### Medium Priority (Fix trong sprint này):

1. ⚠️ User service getUser() workaround (1.1)
2. ⚠️ Category form fetch all (2.2)
3. ⚠️ Image upload validation (3.4)
4. ⚠️ Brand form memory leak (1.3)

### Low Priority (Fix khi có thời gian):

1. ⚠️ Console.log cleanup (2.1)
2. ⚠️ Category form slug logic (1.2)
3. ⚠️ User form useEffect optimization (2.3)

---

## 7. KẾT LUẬN

Tài liệu này đã liệt kê các lỗi và vấn đề đã được phát hiện trong codebase. Các vấn đề bảo mật (High priority) nên được fix ngay lập tức, trong khi các vấn đề hiệu suất và logic có thể được fix trong các sprint tiếp theo.

**Tổng số vấn đề:** 15

- **High:** 3
- **Medium:** 5
- **Low:** 7

---

**Lưu ý:** Tài liệu này nên được cập nhật định kỳ khi có thêm vấn đề mới hoặc khi các vấn đề đã được fix.
