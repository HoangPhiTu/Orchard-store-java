# 🎨 Frontend Documentation Index

> **Complete guide to Orchard Store Admin Dashboard (Frontend)**

---

## 📚 Documentation Files

| File                                       | Description                               | Status      |
| ------------------------------------------ | ----------------------------------------- | ----------- |
| [FE_STRUCTURE.md](./FE_STRUCTURE.md)       | Project structure, directory organization | ✅ Complete |
| [FE_CODING_RULES.md](./FE_CODING_RULES.md) | Coding standards, best practices          | ✅ Complete |

---

## 🎯 Reading Order

### For New Frontend Developers

1. **Start:** [FE_STRUCTURE.md](./FE_STRUCTURE.md)

   - Understand directory structure
   - Learn App Router organization
   - See component hierarchy
   - Review file naming conventions

2. **Coding Standards:** [FE_CODING_RULES.md](./FE_CODING_RULES.md)

   - Core rules (API, State, Error handling)
   - Form handling patterns
   - TypeScript best practices
   - Performance optimization

3. **Error Handling:** [../../src/lib/HANDLE-ERROR-README.md](../../src/lib/HANDLE-ERROR-README.md)

   - handleApiError utility
   - Auto translation EN → VI
   - Field detection
   - Examples

4. **Mutation Hook:** [../../src/hooks/USE-APP-MUTATION-README.md](../../src/hooks/USE-APP-MUTATION-README.md)

   - useAppMutation usage
   - Auto error/success handling
   - Query invalidation
   - Examples

5. **Refactor Guide:** [../../QUICK-REFACTOR-GUIDE.md](../../QUICK-REFACTOR-GUIDE.md)
   - 5-step refactor process
   - Pattern templates
   - Common mistakes

---

## 🛠️ Tech Stack Summary

| Technology          | Version | Purpose                      |
| ------------------- | ------- | ---------------------------- |
| **Next.js**         | 14.2.18 | React framework (App Router) |
| **React**           | 19.2.0  | UI library                   |
| **TypeScript**      | 5       | Type safety                  |
| **Tailwind CSS**    | 4.1.17  | Utility-first CSS            |
| **Shadcn UI**       | Latest  | Component library            |
| **TanStack Query**  | 5.90.10 | Server state management      |
| **Zustand**         | 4.5.7   | Client state management      |
| **React Hook Form** | 7.66.1  | Form management              |
| **Zod**             | 3.25.76 | Schema validation            |
| **Axios**           | 1.13.2  | HTTP client                  |
| **Sonner**          | 2.0.7   | Toast notifications          |

---

## 📁 Structure Highlights

### App Router (Pages)

```
app/
├── (auth)/          # Clean layout (login, forgot-password...)
├── admin/           # Sidebar layout (dashboard, users, products...)
│   └── layout.tsx   # Sidebar + Header
└── layout.tsx       # Root layout
```

**Route Groups:**

- `(auth)` → Public routes, no sidebar
- `admin` → Protected routes, with sidebar

### Components

```
components/
├── features/        # Business components (user-table, brand-form...)
├── ui/              # Shadcn components (button, input, dialog...)
├── layout/          # Layout pieces (sidebar, header)
├── providers/       # Context providers (query, auth, toast)
└── shared/          # Reusable generic components
```

**Organization:** Feature-first (one folder per feature)

### Hooks

```
hooks/
├── use-app-mutation.ts    # ⭐ Future-proof mutation hook
├── use-users.ts           # User queries
├── use-brands.ts          # Brand queries
└── ...
```

**Pattern:** Resource-based hooks

### Services

```
services/
├── user.service.ts
├── brand.service.ts
├── product.service.ts
└── ...
```

**Pattern:** All API calls centralized

---

## 🎯 Core Principles

### 1. API Calls Through Services

```
Component → Hook → Service → Axios → Backend
```

**Never skip layers!**

### 2. State Management

| State Type      | Tool            |
| --------------- | --------------- |
| Server data     | TanStack Query  |
| Global UI state | Zustand         |
| Form state      | React Hook Form |
| URL state       | useSearchParams |
| Local state     | useState        |

### 3. Error Handling (Automatic)

```typescript
const mutation = useAppMutation({
  mutationFn: createUser,
  setError: form.setError, // ✅ Auto assign errors
  queryKey: "users", // ✅ Auto invalidate
  successMessage: "Done!", // ✅ Auto toast
});

// No try-catch needed!
mutation.mutate(data);
```

**Features:**

- ✅ Auto translate EN → VI
- ✅ Auto assign to form fields
- ✅ Auto toast for generic errors
- ✅ 100% automatic

### 4. Forms (react-hook-form + Zod)

```typescript
// 1. Schema
const schema = z.object({ ... });

// 2. Form
const form = useForm({
  resolver: zodResolver(schema),
});

// 3. Mutation
const mutation = useAppMutation({
  setError: form.setError,  // Connect form errors
});

// 4. Submit
const onSubmit = (data) => mutation.mutate(data);
```

---

## 🖼️ User Avatar Flow (0.3.0+)

| Layer        | File                                               | Trách nhiệm                                                                                                                   |
| ------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| UI Component | `src/components/shared/image-upload.tsx`           | Client-first preview (FileReader), validation type/size, cho phép xóa ảnh trước khi submit.                                   |
| User Form    | `src/components/features/user/user-form-sheet.tsx` | Upload ảnh mới **sau** khi bấm Save; nếu chỉnh sửa chính mình thì cập nhật luôn `auth-store` + invalidates `["currentUser"]`. |
| Profile Page | `src/app/admin/profile/page.tsx`                   | Cho phép user tự đổi avatar + thông tin cá nhân; đồng bộ store và query cache khi thành công.                                 |
| Header       | `src/components/layout/header.tsx`                 | Hiển thị avatar realtime từ `useAuthStore`. Fallback = initials khi chưa có ảnh.                                              |

**Lifecycle:**

1. User chọn ảnh mới → `ImageUpload` hiển thị preview tức thời.
2. Khi submit, form gọi `uploadService.uploadImage(file, "users")`.
3. Backend trả URL → form update user (create/update).
4. Nếu thành công và đó là chính user hiện tại → `useAuthStore.setState({ user: updatedUser })` + `queryClient.invalidateQueries({ queryKey: ["currentUser"] })`.
5. Header/Profile phản ứng ngay (React state) nên không cần reload.

**Cleanup:** Backend tự động xóa ảnh cũ (UserAdminService + S3ImageService) nên MinIO không còn file rác.

---

## 🔐 Admin Email Change Flow (0.3.1+)

| Layer            | File                                                                          | Trách nhiệm                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Service          | `src/services/user.service.ts`                                                | `initiateChangeEmail` & `verifyChangeEmail` gọi `/api/admin/users/{id}/email/init` và `/email/verify`.                            |
| Hooks            | `useChangeEmailInit`, `useChangeEmailVerify` (trong `src/hooks/use-users.ts`) | TanStack mutations tự toast, invalidate `["admin","users"]`, đóng dialog khi thành công.                                          |
| Dialog           | `src/components/features/user/change-email-dialog.tsx`                        | Hai bước (email → OTP), helper text, disable nút khi pending, tự reset state khi đóng.                                            |
| Form integration | `src/components/features/user/user-form-sheet.tsx`                            | Chỉ SUPER_ADMIN (và đang Edit) mới thấy nút icon bút cạnh Email. Nút mở dialog, cập nhật form + header/profile sau khi đổi email. |

**Flow:** SUPER_ADMIN nhập email mới → nhận OTP tại email đó → xác nhận → form cập nhật và cache `currentUser` invalidated nếu chính mình.

---

## 📜 User Login History Tab (0.3.1+)

| Layer   | File                                                   | Trách nhiệm                                                                                                                                    |
| ------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Types   | `src/types/user.types.ts`                              | Interface `LoginHistory` bao gồm `browser`, `os`, `deviceType`, `failureReason` + `PagingParams`.                                              |
| Service | `user.service.ts#getLoginHistory`                      | Gọi API `GET /api/admin/users/{id}/history?page=&size=` và unwrap `Page<LoginHistory>`.                                                        |
| Hook    | `src/hooks/use-user-history.ts`                        | `useUserLoginHistory(userId, params)` – chỉ enable khi có `userId`, dùng `keepPreviousData` để phân trang mượt.                                |
| UI      | `src/components/features/users/user-history-table.tsx` | Shadcn Table hiển thị cột “Thiết bị” (icon laptop/mobile/tablet + “Chrome trên Windows”), IP thân thiện (Localhost) và tooltip lý do thất bại. |
| Form    | `user-form-sheet.tsx`                                  | Tabs “Thông tin / Lịch sử” (tab lịch sử chỉ render khi Edit) → không cần rời sheet để xem audit.                                               |

=> Admin xem được audit login chi tiết ngay trong sheet với đầy đủ thông tin thiết bị/browsers và lý do lỗi.

---

## 🚀 Quick Start

### Create New Feature

**1. Create service:**

```typescript
// services/brand.service.ts
export const brandService = {
  getBrands: () => http.get("/api/brands"),
  createBrand: (data) => http.post("/api/brands", data),
};
```

**2. Create hook:**

```typescript
// hooks/use-brands.ts
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getBrands(),
  });
};
```

**3. Create component:**

```typescript
// components/features/brand/brand-list.tsx
export function BrandList() {
  const { data: brands, isLoading } = useBrands();

  if (isLoading) return <Loading />;

  return (
    <div>
      {brands.map((b) => (
        <BrandCard key={b.id} brand={b} />
      ))}
    </div>
  );
}
```

**4. Create page:**

```typescript
// app/admin/brands/page.tsx
import { BrandList } from "@/components/features/brand/brand-list";

export default function BrandsPage() {
  return (
    <div>
      <h1>Brand Management</h1>
      <BrandList />
    </div>
  );
}
```

---

## 🎓 Common Patterns

### Pattern 1: List with Search & Filters

```typescript
"use client";

import { useSearchParams } from "next/navigation";

export default function UsersPage() {
  const searchParams = useSearchParams();

  const filters = {
    keyword: searchParams.get("keyword") || "",
    page: Number(searchParams.get("page")) || 0,
  };

  const { data, isLoading } = useUsers(filters);

  return <UserTable users={data} />;
}
```

### Pattern 2: Create/Edit Form

```typescript
const mutation = useAppMutation({
  mutationFn: isEditing
    ? ({ id, data }) => userService.updateUser(id, data)
    : (data) => userService.createUser(data),
  queryKey: "users",
  setError: form.setError,
  successMessage: isEditing ? "Updated!" : "Created!",
});

const onSubmit = (data) => {
  isEditing ? mutation.mutate({ id: user.id, data }) : mutation.mutate(data);
};
```

### Pattern 3: Delete with Confirmation

```typescript
const deleteMutation = useAppMutation({
  mutationFn: (id: number) => userService.deleteUser(id),
  queryKey: "users",
  successMessage: "Deleted successfully!",
});

const handleDelete = (userId: number) => {
  if (confirm("Are you sure?")) {
    deleteMutation.mutate(userId);
  }
};
```

---

## 📊 Performance Tips

### 1. Server Components (Default)

```typescript
// ✅ Server Component (default - no "use client")
export default function UsersPage() {
  return <div>Static content</div>;
}

// ✅ Client Component (only when needed)
("use client");
export function UserTable() {
  const [selected, setSelected] = useState([]);
  return <div>...</div>;
}
```

### 2. Lazy Load Heavy Components

```typescript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 3. Memoize Expensive Calculations

```typescript
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

### 4. Debounce Inputs

```typescript
const debouncedSearch = useDebounce(searchValue, 500);

useEffect(() => {
  // Only search after 500ms of no typing
  performSearch(debouncedSearch);
}, [debouncedSearch]);
```

---

## 🔗 External Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Tutorials

- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Tutorial](https://ui.dev/c/query)

---

## ✨ Summary

**What you'll learn:**

1. **Structure** - Modular Next.js App Router
2. **Rules** - API, State, Error handling, Forms
3. **Patterns** - Common coding patterns
4. **Performance** - Optimization techniques

**Key takeaways:**

- ✅ Services layer for ALL API calls
- ✅ useAppMutation for automatic error handling
- ✅ TanStack Query for server state
- ✅ react-hook-form + Zod for forms
- ✅ Follow coding standards → Professional codebase

---

**Happy Coding! 🚀**

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Maintainer:** Frontend Team
