# 📋 Frontend Coding Rules - Orchard Store

> **Quy chuẩn phát triển Frontend cho Next.js 14 + TypeScript**

Tài liệu này định nghĩa các quy tắc, patterns và best practices cho toàn bộ codebase Frontend. **Tất cả developers phải tuân thủ** để đảm bảo code nhất quán, dễ bảo trì và scalable.

---

## 📚 Mục lục

1. [Quy tắc Đặt tên & Cấu trúc](#1-quy-tắc-đặt-tên--cấu-trúc)
2. [Component Patterns](#2-component-patterns)
3. [Quản lý State](#3-quản-lý-state)
4. [API & Data Fetching](#4-api--data-fetching)
5. [Forms & Validation](#5-forms--validation)
6. [Error Handling](#6-error-handling)
7. [Styling](#7-styling)

---

## 1. Quy tắc Đặt tên & Cấu trúc

### 1.1. File & Folder Naming

**✅ DO: Sử dụng kebab-case**

```
src/
├── components/
│   ├── shared/
│   │   ├── image-upload.tsx
│   │   └── loading-spinner.tsx
│   ├── features/
│   │   ├── user/
│   │   │   ├── user-form-sheet.tsx
│   │   │   └── delete-user-dialog.tsx
│   │   └── catalog/
│   │       └── brand-table.tsx
│   └── layout/
│       ├── header.tsx
│       └── sidebar.tsx
├── hooks/
│   ├── use-users.ts
│   ├── use-app-mutation.ts
│   └── use-debounce.ts
├── services/
│   ├── user.service.ts
│   └── brand.service.ts
└── lib/
    └── schemas/
        ├── user.schema.ts
        └── auth.schema.ts
```

**❌ DON'T: Sử dụng camelCase hoặc PascalCase cho file/folder**

```
❌ components/shared/imageUpload.tsx
❌ components/features/UserFormSheet.tsx
❌ hooks/useUsers.ts
```

---

### 1.2. Component Naming

**✅ DO: Sử dụng PascalCase cho Component**

```tsx
// ✅ GOOD
export function UserFormSheet() { ... }
export function BrandTable() { ... }
export function DeleteUserDialog() { ... }
```

**❌ DON'T: Sử dụng camelCase hoặc kebab-case**

```tsx
// ❌ BAD
export function userFormSheet() { ... }
export function brand-table() { ... }
```

---

### 1.3. Interface & Type Naming

**✅ DO: PascalCase, không cần prefix 'I'**

```tsx
// ✅ GOOD
interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

type UserFormData = {
  name: string;
  email: string;
};

interface Brand {
  id: number;
  name: string;
  slug: string;
}
```

**❌ DON'T: Sử dụng prefix 'I' hoặc camelCase**

```tsx
// ❌ BAD
interface IUserFormSheetProps { ... }
type userFormData = { ... }
interface iBrand { ... }
```

---

### 1.4. Component Organization

**Quy tắc phân loại Component:**

| Loại Component | Vị trí | Ví dụ |
|----------------|--------|-------|
| **Shared Components** (Dùng chung, nhỏ lẻ) | `src/components/shared/` | `ImageUpload`, `LoadingSpinner`, `Logo` |
| **Feature Components** (Nghiệp vụ phức tạp) | `src/components/features/{module}/` | `UserFormSheet`, `BrandTable`, `DeleteUserDialog` |
| **Layout Components** | `src/components/layout/` | `Header`, `Sidebar`, `Footer` |
| **UI Components** (Shadcn) | `src/components/ui/` | `Button`, `Input`, `Dialog` |

**Ví dụ cấu trúc:**

```
src/components/
├── shared/              # Components dùng chung, đơn giản
│   ├── image-upload.tsx
│   ├── loading-spinner.tsx
│   └── logo.tsx
├── features/           # Components nghiệp vụ phức tạp
│   ├── user/
│   │   ├── user-form-sheet.tsx
│   │   ├── user-table.tsx
│   │   └── delete-user-dialog.tsx
│   └── catalog/
│       ├── brand-form-sheet.tsx
│       └── brand-table.tsx
├── layout/             # Layout components
│   ├── header.tsx
│   └── sidebar.tsx
└── ui/                 # Shadcn UI components
    ├── button.tsx
    ├── input.tsx
    └── dialog.tsx
```

---

## 2. Component Patterns

### 2.1. Server vs Client Components

**✅ DO: Ưu tiên Server Components (mặc định)**

```tsx
// ✅ GOOD: Server Component (mặc định)
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UserTable /> {/* Client Component */}
    </div>
  );
}
```

**✅ DO: Chỉ thêm 'use client' khi cần**

```tsx
// ✅ GOOD: Client Component (cần useState, useEffect, event handlers)
"use client";

import { useState } from "react";

export function UserFormSheet() {
  const [isOpen, setIsOpen] = useState(false);
  
  return <div>...</div>;
}
```

**❌ DON'T: Thêm 'use client' không cần thiết**

```tsx
// ❌ BAD: Component không cần client-side features
"use client"; // ❌ Không cần thiết

export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>; // Chỉ render, không có state/events
}
```

**Decision Tree:**

```
Component có dùng:
├─ useState, useEffect, useRef? → "use client"
├─ Event handlers (onClick, onChange)? → "use client"
├─ Browser APIs (localStorage, window)? → "use client"
├─ React Context? → "use client"
└─ Chỉ render props? → Server Component (mặc định)
```

---

### 2.2. Props Definition

**✅ DO: Luôn định nghĩa Interface cho Props**

```tsx
// ✅ GOOD
interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormSheet({ open, onOpenChange, user }: UserFormSheetProps) {
  return <div>...</div>;
}
```

**✅ DO: Dùng `type` cho định nghĩa dữ liệu đơn giản**

```tsx
// ✅ GOOD: Type cho data structures
type UserFormData = {
  name: string;
  email: string;
  roleIds: number[];
};

// ✅ GOOD: Interface cho component props
interface UserFormSheetProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
}
```

**❌ DON'T: Không định nghĩa Props hoặc dùng inline types**

```tsx
// ❌ BAD: Không có interface
export function UserFormSheet({ open, onOpenChange }: any) { ... }

// ❌ BAD: Inline type (khó đọc, không tái sử dụng)
export function UserFormSheet({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) { ... }
```

---

## 3. Quản lý State

### 3.1. State Management Decision Tree

```
Cần quản lý state nào?
│
├─ Server State (Data từ API)?
│  └─ ✅ TanStack Query (useQuery, useMutation)
│
├─ Global Client State (Auth, UI preferences)?
│  └─ ✅ Zustand (auth-store.ts, ui-store.ts)
│
├─ Form State?
│  └─ ✅ React Hook Form (useForm)
│
└─ Local UI State (Modal open, dropdown toggle)?
   └─ ✅ useState
```

---

### 3.2. Server State (API Data)

**✅ DO: Bắt buộc dùng TanStack Query**

```tsx
// ✅ GOOD: useQuery cho GET requests
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

export function useUsers(filters?: UserFilter) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
  });
}

// ✅ GOOD: useMutation cho POST/PUT/DELETE
import { useMutation } from "@tanstack/react-query";

export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
  });
}
```

**❌ DON'T: Dùng useEffect để fetch data thủ công**

```tsx
// ❌ BAD: Fetch thủ công với useEffect
export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/users").then((res) => {
      setUsers(res.data);
      setLoading(false);
    });
  }, []);

  return <div>...</div>;
}
```

---

### 3.3. Global Client State

**✅ DO: Dùng Zustand cho global state**

```tsx
// ✅ GOOD: Zustand store
// stores/auth-store.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));

// Usage
export function Header() {
  const { user, logout } = useAuthStore();
  return <div>...</div>;
}
```

**Use cases cho Zustand:**

- ✅ Auth info (user, token)
- ✅ UI preferences (sidebar open/close, theme)
- ✅ Notification store
- ❌ Server data (dùng TanStack Query)

---

### 3.4. Form State

**✅ DO: Dùng React Hook Form**

```tsx
// ✅ GOOD
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function UserFormSheet() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = (data: UserFormData) => {
    // Handle submit
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
    </form>
  );
}
```

---

### 3.5. Local UI State

**✅ DO: Dùng useState cho local state**

```tsx
// ✅ GOOD: Local state cho modal, dropdown
export function UserTable() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <>
      <button onClick={() => setIsDeleteDialogOpen(true)}>Delete</button>
      <DeleteDialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
      />
    </>
  );
}
```

---

## 4. API & Data Fetching

### 4.1. Service Layer Pattern

**✅ DO: Tuyệt đối không gọi axios trực tiếp trong Component**

```tsx
// ✅ GOOD: Service layer
// services/user.service.ts
import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";

export const userService = {
  getUsers: (params?: UserFilter) =>
    http.get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params })
      .then((res) => res.data.data),

  createUser: (data: CreateUserRequest) =>
    http.post<ApiResponse<User>>(API_ROUTES.USERS, data)
      .then((res) => res.data.data),
};

// ✅ GOOD: Component gọi qua Hook
// hooks/use-users.ts
export function useUsers(filters?: UserFilter) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
  });
}

// ✅ GOOD: Component chỉ gọi Hook
// components/features/user/user-table.tsx
export function UserTable() {
  const { data, isLoading } = useUsers();
  return <div>...</div>;
}
```

**❌ DON'T: Gọi axios trực tiếp trong Component**

```tsx
// ❌ BAD: Gọi axios trực tiếp
import axios from "axios";

export function UserTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/api/users").then((res) => setUsers(res.data));
  }, []);

  return <div>...</div>;
}
```

**Data Flow:**

```
Component
  ↓
Hook (useUsers, useCreateUser)
  ↓
Service (user.service.ts)
  ↓
Axios Client (lib/axios-client.ts)
  ↓
Backend API
```

---

### 4.2. Service File Structure

**✅ DO: Tổ chức service theo module**

```
src/services/
├── user.service.ts      # User CRUD
├── brand.service.ts     # Brand CRUD
├── category.service.ts  # Category CRUD
├── order.service.ts     # Order CRUD
└── upload.service.ts    # Image upload
```

**✅ DO: Standardize service methods**

```tsx
// ✅ GOOD: Consistent naming
export const userService = {
  // GET (List)
  getUsers: (params?: UserFilter) => ...,
  
  // GET (Detail)
  getUser: (id: number) => ...,
  
  // POST (Create)
  createUser: (data: CreateUserRequest) => ...,
  
  // PUT (Update)
  updateUser: (id: number, data: UpdateUserRequest) => ...,
  
  // DELETE
  deleteUser: (id: number) => ...,
};
```

---

## 5. Forms & Validation

### 5.1. Schema Definition

**✅ DO: Validate bằng Zod, schema tách ra file riêng**

```tsx
// ✅ GOOD: Schema trong lib/schemas/
// lib/schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  roleIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 role"),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
```

**❌ DON'T: Định nghĩa schema inline trong component**

```tsx
// ❌ BAD: Schema inline
export function UserFormSheet() {
  const schema = z.object({
    name: z.string().min(1),
    // ...
  });
  // ...
}
```

---

### 5.2. Form Hook Integration

**✅ DO: Dùng useForm kết hợp zodResolver**

```tsx
// ✅ GOOD
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserSchema } from "@/lib/schemas/user.schema";

export function UserFormSheet() {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleIds: [],
    },
  });

  const onSubmit = (data: CreateUserSchema) => {
    // Handle submit
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} />
      {form.formState.errors.name && (
        <span className="text-red-500">{form.formState.errors.name.message}</span>
      )}
    </form>
  );
}
```

---

### 5.3. Error Display (Inline Error)

**✅ DO: Sử dụng FormField component để hiển thị lỗi tự động**

```tsx
// ✅ GOOD: FormField tự động hiển thị lỗi
import { FormField } from "@/components/ui/form-field";

export function UserFormSheet() {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField 
        label="Tên" 
        error={form.formState.errors.name}
      >
        <Input {...form.register("name")} />
      </FormField>
      
      <FormField 
        label="Email" 
        error={form.formState.errors.email}
      >
        <Input type="email" {...form.register("email")} />
      </FormField>
    </form>
  );
}
```

**FormField component tự động:**

- ✅ Hiển thị label
- ✅ Hiển thị error message (tiếng Việt) dưới input
- ✅ Styling nhất quán

---

## 6. Error Handling

### 6.1. useAppMutation Pattern

**✅ DO: Sử dụng useAppMutation cho CUD operations**

```tsx
// ✅ GOOD: useAppMutation tự động xử lý lỗi
import { useAppMutation } from "@/hooks/use-app-mutation";
import { userService } from "@/services/user.service";

export function UserFormSheet() {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  const createMutation = useAppMutation({
    mutationFn: userService.createUser,
    queryKey: ["users"],
    form: form, // Tự động gán lỗi vào form fields
    successMessage: "Tạo user thành công!",
    onClose: () => setIsOpen(false), // Tự động đóng khi thành công
  });

  const onSubmit = (data: CreateUserSchema) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Đang tạo..." : "Tạo"}
      </Button>
    </form>
  );
}
```

**useAppMutation tự động:**

- ✅ **Chặn crash app** - `throwOnError: false`
- ✅ **Dịch lỗi sang Tiếng Việt** - Tự động qua `handleApiError`
- ✅ **Gán lỗi vào form fields** - Nếu có `form` prop
- ✅ **Hiển thị toast** - Success/Error tự động
- ✅ **Invalidate queries** - Refresh data sau khi thành công
- ✅ **Đóng modal** - Nếu có `onClose` prop

---

### 6.2. Không Try-Catch Thủ Công

**✅ DO: Để useAppMutation xử lý lỗi**

```tsx
// ✅ GOOD: Không cần try-catch
const onSubmit = (data: CreateUserSchema) => {
  createMutation.mutate(data);
  // useAppMutation tự động xử lý lỗi
};
```

**❌ DON'T: Try-catch thủ công (trừ trường hợp đặc biệt)**

```tsx
// ❌ BAD: Try-catch không cần thiết
const onSubmit = async (data: CreateUserSchema) => {
  try {
    await createMutation.mutateAsync(data);
  } catch (error) {
    // ❌ useAppMutation đã xử lý rồi, không cần catch lại
    console.error(error);
  }
};
```

**Trường hợp đặc biệt cần try-catch:**

```tsx
// ✅ GOOD: Cần xử lý logic đặc biệt
const onSubmit = async (data: CreateUserSchema) => {
  try {
    await createMutation.mutateAsync(data);
    // Custom logic sau khi thành công
    router.push("/admin/users");
  } catch (error) {
    // Chỉ catch nếu cần xử lý đặc biệt
    if (error.code === "CUSTOM_ERROR") {
      // Custom handling
    }
  }
};
```

---

### 6.3. Error Handling Flow

```
User submits form
  ↓
mutation.mutate(data)
  ↓
Backend returns error (400, 422, etc.)
  ↓
useAppMutation.onError
  ↓
handleApiError()
  ├─ Dịch lỗi sang Tiếng Việt
  ├─ Gán lỗi vào form fields (nếu có form)
  └─ Hiển thị toast (nếu không gán được vào form)
```

---

## 7. Styling

### 7.1. Tailwind CSS với cn() Utility

**✅ DO: Sử dụng hàm cn() để merge class động**

```tsx
// ✅ GOOD: cn() merge classes và xử lý conflicts
import { cn } from "@/lib/utils";

export function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg", // Base classes
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-900",
        className // Merge với className từ props
      )}
      {...props}
    />
  );
}
```

**cn() utility:**

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Lợi ích:**

- ✅ Merge classes tự động
- ✅ Xử lý conflicts (VD: `px-4` và `px-6` → chỉ giữ `px-6`)
- ✅ Type-safe với TypeScript

---

### 7.2. Không Dùng Inline Styles

**✅ DO: Dùng Tailwind classes**

```tsx
// ✅ GOOD: Tailwind classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <span className="text-lg font-semibold text-gray-900">Title</span>
</div>
```

**❌ DON'T: Dùng inline style**

```tsx
// ❌ BAD: Inline style
<div style={{ display: "flex", padding: "24px", backgroundColor: "white" }}>
  <span style={{ fontSize: "18px", fontWeight: "bold" }}>Title</span>
</div>
```

**Ngoại lệ:** Chỉ dùng inline style cho dynamic values

```tsx
// ✅ GOOD: Dynamic values cần inline style
<div style={{ width: `${progress}%` }} />
<div style={{ transform: `translateX(${offset}px)` }} />
```

---

### 7.3. Design System (Shadcn UI)

**✅ DO: Tuân thủ Design System của Shadcn UI**

```tsx
// ✅ GOOD: Sử dụng màu từ design system
<Button variant="default">Primary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// ✅ GOOD: Sử dụng màu semantic
<div className="bg-primary text-primary-foreground">...</div>
<div className="bg-destructive text-destructive-foreground">...</div>
<div className="bg-muted text-muted-foreground">...</div>
```

**Color Palette (Shadcn UI):**

| Variant | Usage | Example |
|---------|-------|---------|
| `primary` | Main actions, links | "Save", "Submit" |
| `destructive` | Delete, dangerous actions | "Delete", "Remove" |
| `secondary` | Secondary actions | "Cancel", "Back" |
| `muted` | Disabled, subtle text | Placeholder, helper text |
| `outline` | Outlined buttons | "View Details" |
| `ghost` | Minimal buttons | Icon buttons |

---

### 7.4. Responsive Design

**✅ DO: Sử dụng Tailwind responsive prefixes**

```tsx
// ✅ GOOD: Mobile-first responsive
<div className="
  flex flex-col gap-4        // Mobile: column
  md:flex-row md:gap-6       // Tablet+: row
  lg:gap-8                   // Desktop+: larger gap
">
  <div className="w-full md:w-1/2 lg:w-1/3">...</div>
</div>
```

**Breakpoints:**

- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

---

### 7.5. Form Contrast & Combobox Pattern (2025 Update)

**Mục tiêu:** Giảm lỗi “low contrast” và chuẩn hóa combobox dùng trong Category Form.

#### Contrast Rules

- `--muted-foreground` đặt tại `globals.css` = `hsl(215 16% 40%)` (tương đương `text-slate-600`).
- Nút `variant="outline"` phải dùng `text-slate-700`, `border-slate-300`, hover `bg-slate-100 text-slate-900`.
- `Input` ở trạng thái `disabled` dùng `bg-slate-100`, `text-slate-600`, `border-slate-200` (không mờ đi bằng opacity).

> ✅ Các nút “Cancel/Hủy” và hướng dẫn form luôn đáp ứng tiêu chuẩn WCAG AA.

#### Combobox chuẩn (Parent Category, Brand picker…)

```tsx
<Popover modal>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      role="combobox"
      className={cn(
        "h-11 w-full justify-between",
        selected ? "text-slate-900 font-medium" : "text-slate-500 font-normal"
      )}
    >
      <span className="truncate">
        {selected ? selected.name : "Chọn danh mục cha (hoặc để trống)"}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
    </Button>
  </PopoverTrigger>
  <PopoverContent
    align="start"
    sideOffset={4}
    matchWidth
    className="w-[--radix-popover-trigger-width] border-none bg-transparent p-0 shadow-none"
  >
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          className="w-full pl-9 text-sm font-medium text-slate-900 placeholder:text-slate-500"
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {/* Items ... */}
    </div>
  </PopoverContent>
</Popover>
```

**Yêu cầu:**

1. Luôn truyền `matchWidth` + `w-[--radix-popover-trigger-width]` để menu bám đúng trigger khi scroll/resize.
2. Placeholder = `text-slate-500`, giá trị được chọn = `text-slate-900 font-medium`.
3. Các item trong dropdown mặc định `text-slate-700`, hover/selected chuyển `text-slate-900` và có nền `bg-slate-100`.
4. Với Category, nhớ truyền `folder={parentSlug ? \`categories/${parentSlug}\` : "categories"}` vào `ImageUpload` để ảnh lưu đúng thư mục slug cha.

---

## 📝 Tóm tắt Quick Reference

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| File/Folder | kebab-case | `user-form-sheet.tsx` |
| Component | PascalCase | `UserFormSheet` |
| Interface/Type | PascalCase (no 'I' prefix) | `UserFormSheetProps` |
| Hook | camelCase (prefix 'use') | `useUsers`, `useAppMutation` |
| Service | camelCase (suffix '.service') | `user.service.ts` |
| Schema | camelCase (suffix '.schema') | `user.schema.ts` |

### Component Organization

| Type | Location | Example |
|------|----------|---------|
| Shared | `components/shared/` | `ImageUpload`, `LoadingSpinner` |
| Feature | `components/features/{module}/` | `UserFormSheet`, `BrandTable` |
| Layout | `components/layout/` | `Header`, `Sidebar` |
| UI | `components/ui/` | `Button`, `Input` (Shadcn) |

### State Management

| State Type | Solution | Example |
|------------|----------|---------|
| Server State | TanStack Query | `useQuery`, `useMutation` |
| Global State | Zustand | `useAuthStore`, `useUIStore` |
| Form State | React Hook Form | `useForm` |
| Local UI State | useState | Modal open, dropdown toggle |

### Data Flow

```
Component
  ↓
Hook (useUsers, useCreateUser)
  ↓
Service (user.service.ts)
  ↓
Axios Client
  ↓
Backend API
```

### Error Handling

- ✅ **Luôn dùng `useAppMutation`** cho CUD operations
- ✅ **Không try-catch thủ công** (trừ trường hợp đặc biệt)
- ✅ **Form errors tự động** qua `form` prop
- ✅ **Toast tự động** cho success/error

---

## ✅ Checklist trước khi commit

- [ ] File/folder đặt tên đúng kebab-case?
- [ ] Component đặt tên đúng PascalCase?
- [ ] Interface/Type không có prefix 'I'?
- [ ] Component đặt đúng thư mục (shared/features/layout)?
- [ ] Có 'use client' chỉ khi cần thiết?
- [ ] Props có interface riêng?
- [ ] Server state dùng TanStack Query?
- [ ] Không gọi axios trực tiếp trong component?
- [ ] Form dùng React Hook Form + Zod?
- [ ] Schema tách ra file riêng?
- [ ] CUD operations dùng useAppMutation?
- [ ] Styling dùng Tailwind + cn()?
- [ ] Không dùng inline style (trừ dynamic values)?

---

**Tài liệu này sẽ được cập nhật thường xuyên. Nếu có thắc mắc, hãy thảo luận với Tech Lead.**

