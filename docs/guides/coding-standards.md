# ⚡ Coding Standards Quick Reference

> **Quick lookup cheat sheet for Orchard Store**

---

## 🎯 Golden Rules

### Frontend

| Rule               | Pattern                            | Example                                                |
| ------------------ | ---------------------------------- | ------------------------------------------------------ |
| **API Calls**      | Component → Hook → Service → Axios | `useUsers()` → `userService.getUsers()` → `http.get()` |
| **Server State**   | TanStack Query                     | `useQuery()`, `useAppMutation()`                       |
| **Client State**   | Zustand                            | `useAuthStore()`, `useUIStore()`                       |
| **Forms**          | react-hook-form + Zod              | `useForm({ resolver: zodResolver(schema) })`           |
| **Error Handling** | useAppMutation (auto)              | `setError: form.setError` → Auto assign errors         |
| **Styling**        | Tailwind CSS                       | `className="flex gap-4 rounded-lg"`                    |

### Backend

| Rule             | Pattern          | Example                                |
| ---------------- | ---------------- | -------------------------------------- |
| **Architecture** | Modular Monolith | `modules/auth`, `modules/product`      |
| **Data Access**  | JPA Repository   | `UserRepository extends JpaRepository` |
| **DTOs**         | MapStruct        | `@Mapper UserMapper`                   |
| **Validation**   | Bean Validation  | `@Email`, `@NotNull`, `@Size`          |
| **Security**     | JWT + RBAC       | Hierarchy levels (1-10)                |
| **Migrations**   | Flyway           | `V1__init_schema.sql`                  |

---

## 🌐 API Call Pattern

```typescript
// 1. Define service
// services/user.service.ts
export const userService = {
  getUsers: (filters) => http.get("/api/admin/users", { params: filters }),
  createUser: (data) => http.post("/api/admin/users", data),
};

// 2. Create hook
// hooks/use-users.ts
export const useUsers = (filters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
  });
};

// 3. Use in component
function UserList() {
  const { data, isLoading } = useUsers({ keyword: "john" });
  return <UserTable users={data} />;
}
```

---

## 📝 Form Pattern

```typescript
// 1. Zod schema
const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Bắt buộc"),
});

type FormData = z.infer<typeof schema>;

// 2. Setup form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

// 3. Setup mutation
const mutation = useAppMutation({
  mutationFn: (data) => userService.createUser(data),
  setError: form.setError, // ✅ Auto error handling
  successMessage: "Success!",
});

// 4. Submit
const onSubmit = (data: FormData) => {
  mutation.mutate(data); // ✅ No try-catch!
};
```

---

## ⚠️ Error Handling Pattern

```typescript
// ✅ AUTOMATIC with useAppMutation
const mutation = useAppMutation({
  mutationFn: createUser,
  setError: form.setError, // Auto assign to fields
  queryKey: "users", // Auto invalidate on success
  successMessage: "Created!", // Auto toast success
});

// What happens automatically:
// 1. Validation error (422) → form.setError("email", ...)
// 2. Conflict (409) → Detect field → form.setError("email", ...)
// 3. Permission (403) → Toast "Không có quyền"
// 4. Server error (500) → Toast "Lỗi hệ thống"
```

---

## 🗄️ State Management Pattern

```typescript
// ✅ Server State (TanStack Query)
const { data: users } = useUsers();              // GET
const mutation = useAppMutation({ ... });       // POST/PUT/DELETE

// ✅ Global Client State (Zustand)
const { user, logout } = useAuthStore();         // User session
const { sidebarOpen, toggleSidebar } = useUIStore();  // UI state

// ✅ URL State (Search Params)
const searchParams = useSearchParams();
const keyword = searchParams.get("keyword");     // Filters

// ✅ Local State (useState)
const [isOpen, setIsOpen] = useState(false);     // Modal state
```

---

## 📊 Component Pattern

```typescript
"use client";  // Only if using hooks/events

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface Props {
  // Props types
}

export function MyComponent({ prop1, prop2 }: Props) {
  // 1. State
  const [state, setState] = useState();

  // 2. Form (if needed)
  const form = useForm();

  // 3. Queries
  const { data } = useMyQuery();

  // 4. Mutations
  const mutation = useAppMutation({ ... });

  // 5. Handlers
  const handleClick = () => { ... };

  // 6. Effects
  useEffect(() => { ... }, []);

  // 7. Render
  return <div>...</div>;
}
```

---

## 🎨 Styling Pattern

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  // Base classes
  "flex items-center gap-4 rounded-lg border p-4",

  // Conditional classes
  isActive && "bg-indigo-50 border-indigo-200",
  isDisabled && "opacity-50 cursor-not-allowed",

  // Props className
  className
)}>
```

---

## 📐 TypeScript Pattern

```typescript
// ✅ Interface for objects
interface User {
  id: number;
  email: string;
  fullName: string;
}

// ✅ Type for unions/primitives
type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";
type UserFilter = string | undefined;

// ✅ Generics
interface Page<T> {
  content: T[];
  totalElements: number;
}

// ✅ Infer from Zod
const schema = z.object({ ... });
type FormData = z.infer<typeof schema>;

// ❌ NO any
const data: any = ...;  // ❌ Never use any!
```

---

## 🔍 Import Pattern

```typescript
// ✅ GOOD - Organized imports

// 1. React/Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// 3. Internal - Absolute imports with @/
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";

// 4. Relative imports (only for same directory)
import { UserCard } from "./user-card";

// ❌ BAD - Relative paths for different directories
import { Button } from "../../../components/ui/button"; // ❌
```

---

## 📋 File Naming

| Type           | Naming                  | Example                               |
| -------------- | ----------------------- | ------------------------------------- |
| **Pages**      | `page.tsx`              | `app/admin/users/page.tsx`            |
| **Layouts**    | `layout.tsx`            | `app/admin/layout.tsx`                |
| **Components** | `kebab-case.tsx`        | `user-form-sheet.tsx`                 |
| **Hooks**      | `use-{name}.ts`         | `use-users.ts`, `use-debounce.ts`     |
| **Services**   | `{resource}.service.ts` | `user.service.ts`, `brand.service.ts` |
| **Stores**     | `{name}-store.ts`       | `auth-store.ts`, `ui-store.ts`        |
| **Types**      | `{name}.types.ts`       | `user.types.ts`, `api.types.ts`       |
| **Schemas**    | `{name}.schema.ts`      | `user.schema.ts`, `auth.schema.ts`    |

---

## ✅ Pre-Commit Checklist

Before committing:

- [ ] ✅ No direct API calls in components
- [ ] ✅ Used services for API calls
- [ ] ✅ Used useAppMutation for mutations
- [ ] ✅ Used react-hook-form + Zod for forms
- [ ] ✅ TanStack Query for server state
- [ ] ✅ TypeScript (no `any`)
- [ ] ✅ Tailwind CSS (no inline styles)
- [ ] ✅ Loading states added
- [ ] ✅ Error states added
- [ ] ✅ No console.logs
- [ ] ✅ No linter errors

---

## 🚫 Common Mistakes

### ❌ Mistake 1: Direct API Calls

```typescript
// ❌ BAD
axios.get("/api/users");

// ✅ GOOD
userService.getUsers();
```

### ❌ Mistake 2: Server Data in Zustand

```typescript
// ❌ BAD
const users = useUserStore((state) => state.users);

// ✅ GOOD
const { data: users } = useUsers();
```

### ❌ Mistake 3: Manual Error Handling

```typescript
// ❌ BAD
onError: (error) => {
  if (error.status === 409) {
    /* ... */
  }
  // 100+ lines
};

// ✅ GOOD
setError: form.setError; // Auto!
```

### ❌ Mistake 4: No Validation Schema

```typescript
// ❌ BAD
const [email, setEmail] = useState("");
// Manual validation...

// ✅ GOOD
const schema = z.object({ email: z.string().email() });
const form = useForm({ resolver: zodResolver(schema) });
```

---

## 🎯 Code Examples

### Complete CRUD Pattern

```typescript
// 1. Service
export const userService = {
  getUsers: (filters) => http.get("/api/users", { params: filters }),
  getUser: (id) => http.get(`/api/users/${id}`),
  createUser: (data) => http.post("/api/users", data),
  updateUser: (id, data) => http.put(`/api/users/${id}`, data),
  deleteUser: (id) => http.delete(`/api/users/${id}`),
};

// 2. Hooks
export const useUsers = (filters) =>
  useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });

// 3. Component (List)
function UserList() {
  const { data, isLoading } = useUsers();

  if (isLoading) return <Loading />;
  return <UserTable users={data.content} />;
}

// 4. Component (Form)
function UserForm({ user, onClose }) {
  const form = useForm({
    resolver: zodResolver(userSchema),
  });

  const mutation = useAppMutation({
    mutationFn: user
      ? ({ id, data }) => userService.updateUser(id, data)
      : (data) => userService.createUser(data),
    queryKey: "users",
    setError: form.setError,
    successMessage: user ? "Updated!" : "Created!",
    onSuccess: onClose,
  });

  const onSubmit = (data) => {
    user ? mutation.mutate({ id: user.id, data }) : mutation.mutate(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 🔗 Quick Links

### Documentation

- [Frontend Structure](./frontend/FE_STRUCTURE.md)
- [Coding Rules](./frontend/FE_CODING_RULES.md)
- [Error Handling Guide](../src/lib/HANDLE-ERROR-README.md)
- [useAppMutation Guide](../src/hooks/USE-APP-MUTATION-README.md)

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

**Last Updated:** December 2024  
**Version:** 0.2.0  
**For:** Quick reference during development
