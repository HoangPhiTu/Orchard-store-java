# 🎨 Frontend Structure - Orchard Store Admin Dashboard

> **Next.js 14 App Router với Modular Component Architecture**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [App Router Organization](#app-router-organization)
4. [Component Organization](#component-organization)
5. [File Naming Conventions](#file-naming-conventions)
6. [Module Dependencies](#module-dependencies)

---

## 🎯 Overview

### Tech Stack

| Technology          | Version | Purpose                      |
| ------------------- | ------- | ---------------------------- |
| **Next.js**         | 14.2.18 | React framework (App Router) |
| **React**           | 19.2.0  | UI library                   |
| **TypeScript**      | 5       | Type safety                  |
| **Tailwind CSS**    | 4.1.17  | Styling                      |
| **Shadcn UI**       | Latest  | Component library            |
| **TanStack Query**  | 5.90.10 | Server state management      |
| **Zustand**         | 4.5.7   | Client state management      |
| **React Hook Form** | 7.66.1  | Form management              |
| **Zod**             | 3.25.76 | Schema validation            |

---

## 📁 Directory Structure

```
orchard-store-dashboard/
├── src/
│   ├── app/                              # 📄 Next.js App Router (Pages)
│   │   ├── (auth)/                       # 🔓 Auth Routes (Clean Layout)
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   ├── verify-otp/
│   │   │   └── reset-password/
│   │   ├── admin/                        # 🔐 Admin Routes (Sidebar Layout)
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── brands/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   └── layout.tsx                # Admin layout with sidebar
│   │   ├── api/                          # 🌐 API Routes (Route Handlers)
│   │   │   ├── auth/
│   │   │   └── health/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page (/) → Redirect to /admin/dashboard
│   │   └── not-found.tsx                 # 404 page
│   │
│   ├── components/                       # 🧩 React Components
│   │   ├── features/                     # 📦 Feature-specific components
│   │   │   ├── user/                     # User management components
│   │   │   │   ├── user-table.tsx
│   │   │   │   ├── user-form-sheet.tsx
│   │   │   │   ├── reset-password-dialog.tsx
│   │   │   │   └── login-history-table.tsx
│   │   │   ├── product/                  # Product components
│   │   │   │   ├── brand-form.tsx
│   │   │   │   ├── category-form.tsx
│   │   │   │   ├── product-card.tsx
│   │   │   │   └── image-upload.tsx
│   │   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── auth/                     # Auth-specific components
│   │   │   ├── orders/                   # Order components
│   │   │   └── customers/                # Customer components
│   │   ├── layout/                       # 🏗️ Layout components
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── providers/                    # ⚙️ Context providers
│   │   │   ├── query-provider.tsx        # TanStack Query
│   │   │   ├── auth-provider.tsx         # Auth context
│   │   │   └── toast-provider.tsx        # Toast notifications
│   │   ├── shared/                       # 🔄 Shared/reusable components
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── logo.tsx
│   │   │   └── progress-steps.tsx
│   │   └── ui/                           # 🎨 Shadcn UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── ... (20+ components)
│   │
│   ├── hooks/                            # 🪝 Custom React Hooks
│   │   ├── use-app-mutation.ts           # ⭐ Future-proof mutation hook
│   │   ├── use-users.ts                  # User-related hooks
│   │   ├── use-roles.ts                  # Role-related hooks
│   │   ├── use-brands.ts                 # Brand hooks
│   │   ├── use-categories.ts             # Category hooks
│   │   ├── use-auth.ts                   # Auth hooks
│   │   ├── use-breadcrumbs.ts            # Breadcrumb hook
│   │   ├── use-debounce.ts               # Debounce hook
│   │   └── use-websocket.ts              # WebSocket hook
│   │
│   ├── lib/                              # 📚 Utilities & Helpers
│   │   ├── axios-client.ts               # ⭐ Axios instance (with interceptors)
│   │   ├── handle-error.ts               # ⭐ Error handling utility
│   │   ├── jwt.ts                        # JWT utilities
│   │   ├── utils.ts                      # General utilities (cn, etc.)
│   │   └── schemas/                      # Zod validation schemas
│   │       ├── auth.schema.ts
│   │       ├── user.schema.ts
│   │       ├── product.schema.ts
│   │       └── admin-reset-password.schema.ts
│   │
│   ├── services/                         # 🌐 API Service Layer
│   │   ├── auth.service.ts               # Auth APIs
│   │   ├── user.service.ts               # User APIs
│   │   ├── role.service.ts               # Role APIs
│   │   ├── brand.service.ts              # Brand APIs
│   │   ├── category.service.ts           # Category APIs
│   │   ├── product.service.ts            # Product APIs
│   │   ├── order.service.ts              # Order APIs
│   │   └── upload.service.ts             # File upload APIs
│   │
│   ├── stores/                           # 🗄️ Zustand Global Stores
│   │   ├── auth-store.ts                 # Auth state (user, token, login/logout)
│   │   ├── ui-store.ts                   # UI state (sidebar, theme)
│   │   └── notification-store.ts         # Notification state
│   │
│   ├── types/                            # 📝 TypeScript Type Definitions
│   │   ├── api.types.ts                  # API response types
│   │   ├── auth.types.ts                 # Auth types
│   │   ├── user.types.ts                 # User types
│   │   ├── product.types.ts              # Product types
│   │   ├── catalog.types.ts              # Catalog types
│   │   ├── order.types.ts                # Order types
│   │   └── login-history.types.ts        # Login history types
│   │
│   ├── config/                           # ⚙️ Configuration
│   │   ├── env.ts                        # Environment variables (validated)
│   │   ├── api-routes.ts                 # API endpoint constants
│   │   └── menu.ts                       # Sidebar menu config
│   │
│   └── middleware.ts                     # 🛡️ Next.js Middleware (Route protection)
│
├── public/                               # 📁 Static Assets
│   ├── images/
│   └── icons/
│
├── docs/                                 # 📚 Documentation
│   ├── frontend/
│   │   ├── FE_STRUCTURE.md               # This file
│   │   └── FE_CODING_RULES.md            # Coding rules
│   └── backend/
│
├── tailwind.config.ts                    # Tailwind configuration
├── tsconfig.json                         # TypeScript configuration
├── next.config.js                        # Next.js configuration
├── package.json                          # Dependencies
└── README.md                             # Project README
```

---

## 🚪 App Router Organization

### Route Groups

Next.js App Router sử dụng **route groups** (folder có tên trong ngoặc đơn) để organize routes mà không ảnh hưởng đến URL.

#### 1. `(auth)` Group - Authentication Routes

**Purpose:** Clean layout cho auth pages (no sidebar, no header)

```
app/(auth)/
├── login/
│   └── page.tsx              → /login
├── forgot-password/
│   └── page.tsx              → /forgot-password
├── verify-otp/
│   └── page.tsx              → /verify-otp
└── reset-password/
    └── page.tsx              → /reset-password
```

**Layout:** No sidebar, centered form, minimal UI

**Middleware:** Public routes (no auth required)

#### 2. `admin` Group - Admin Dashboard Routes

**Purpose:** Admin pages với sidebar layout

```
app/admin/
├── layout.tsx                # Admin layout (sidebar + header)
├── dashboard/
│   └── page.tsx              → /admin/dashboard
├── users/
│   └── page.tsx              → /admin/users
├── brands/
│   └── page.tsx              → /admin/brands
├── categories/
│   └── page.tsx              → /admin/categories
├── orders/
│   └── page.tsx              → /admin/orders
└── customers/
    └── page.tsx              → /admin/customers
```

**Layout:** Sidebar + Header (consistent admin experience)

**Middleware:** Protected routes (auth required)

#### 3. `api` Routes - Backend Proxy (Optional)

```
app/api/
├── auth/
│   └── route.ts              → /api/auth (proxy to backend)
└── health/
    └── route.ts              → /api/health
```

**Purpose:**

- Proxy requests to backend (optional)
- Server-side API calls
- Webhook handlers

---

## 🧩 Component Organization

### 1. `components/features/` - Feature Components

**Purpose:** Business logic components (specific to features)

**Structure:**

```
components/features/
├── user/                     # User Management
│   ├── user-table.tsx        # User list table
│   ├── user-form-sheet.tsx   # Create/Edit user form
│   ├── reset-password-dialog.tsx
│   └── login-history-table.tsx
├── product/                  # Product Management
│   ├── brand-form.tsx
│   ├── category-form.tsx
│   ├── product-card.tsx
│   └── image-upload.tsx
├── dashboard/                # Dashboard Widgets
│   ├── stats-card.tsx
│   └── placeholder-chart.tsx
├── auth/                     # Auth Components
├── orders/                   # Order Management
└── customers/                # Customer Management
```

**Rules:**

- ✅ One feature = One folder
- ✅ Self-contained (related components together)
- ✅ Export from index.ts if needed

### 2. `components/layout/` - Layout Components

**Purpose:** Reusable layout pieces

```
components/layout/
├── sidebar.tsx               # Admin sidebar (navigation)
└── header.tsx                # Admin header (user menu, notifications)
```

### 3. `components/providers/` - Context Providers

**Purpose:** Global providers (wrap entire app or sections)

```
components/providers/
├── query-provider.tsx        # TanStack Query + React Query Devtools
├── auth-provider.tsx         # Auth context (check auth on mount)
└── toast-provider.tsx        # Toast notifications (Sonner)
```

**Usage:**

```tsx
// In app/layout.tsx
<Providers>
  <AuthProvider>
    {children}
    <ToastProvider />
  </AuthProvider>
</Providers>
```

### 4. `components/shared/` - Shared Components

**Purpose:** Reusable components dùng ở nhiều nơi

```
components/shared/
├── loading-spinner.tsx       # Generic loading indicator
├── logo.tsx                  # App logo
└── progress-steps.tsx        # Step progress indicator
```

### 5. `components/ui/` - Shadcn UI Components

**Purpose:** Base UI components (from Shadcn UI)

```
components/ui/
├── button.tsx
├── input.tsx
├── dialog.tsx
├── sheet.tsx
├── table.tsx
└── ... (20+ components)
```

**Source:** Generated từ `shadcn-ui` CLI

**Customizable:** Có thể edit trực tiếp (không phải npm package)

---

## 🪝 Hooks Organization

### Custom Hooks

```
hooks/
├── use-app-mutation.ts       # ⭐ Future-proof mutation hook
├── use-users.ts              # User-related queries/mutations
├── use-roles.ts              # Role queries
├── use-brands.ts             # Brand queries/mutations
├── use-categories.ts         # Category queries/mutations
├── use-auth.ts               # Auth utilities
├── use-breadcrumbs.ts        # Breadcrumb generation
├── use-debounce.ts           # Debounce utility
└── use-websocket.ts          # WebSocket connection
```

**Naming Convention:**

- `use-{resource}.ts` - Resource-specific hooks (users, brands...)
- `use-{feature}.ts` - Feature hooks (auth, websocket...)
- `use-{utility}.ts` - Utility hooks (debounce, breadcrumbs...)

**Pattern:**

```typescript
// use-users.ts
export const useUsers = (filters) => useQuery(...);          // List query
export const useUser = (id) => useQuery(...);                // Detail query
export const useUserHistory = (userId) => useQuery(...);     // Related query

// DON'T export mutation hooks anymore - use useAppMutation instead!
```

---

## 📚 Lib Organization

### Utilities & Helpers

```
lib/
├── axios-client.ts           # ⭐ Axios instance
│                            # - Request interceptor (attach JWT)
│                            # - Response interceptor (unwrap data, refresh token, error handling)
│
├── handle-error.ts           # ⭐ Error handling utility
│                            # - Translate EN → VI
│                            # - Detect conflict fields
│                            # - Assign to form fields
│                            # - Toast for generic errors
│
├── jwt.ts                    # JWT decode/validate utilities
├── utils.ts                  # General utils (cn, formatDate...)
│
└── schemas/                  # Zod Validation Schemas
    ├── auth.schema.ts        # Login, Forgot Password, Reset Password
    ├── user.schema.ts        # Create/Update User
    ├── product.schema.ts     # Product schemas
    └── ...
```

**Key Files:**

**1. `axios-client.ts`**

```typescript
// Axios instance with interceptors
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor: Attach JWT
http.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Error handling, refresh token
http.interceptors.response.use(...);
```

**2. `handle-error.ts`**

```typescript
// Centralized error handling
export function handleApiError<T>(
  error: AxiosError,
  options?: { setError; showToast; formFieldPrefix }
) {
  // Auto translate, detect fields, assign errors, toast
}
```

---

## 🌐 Services Layer

### API Service Pattern

```
services/
├── auth.service.ts           # Authentication APIs
├── user.service.ts           # User management APIs
├── role.service.ts           # Role APIs
├── brand.service.ts          # Brand APIs
├── category.service.ts       # Category APIs
├── product.service.ts        # Product APIs
├── order.service.ts          # Order APIs
└── upload.service.ts         # File upload APIs
```

**Pattern:**

```typescript
// user.service.ts
import http from "@/lib/axios-client";

export const userService = {
  // List với pagination
  getUsers: (filters?: UserFilters) => {
    return http.get<Page<User>>("/api/admin/users", { params: filters });
  },

  // Get detail
  getUser: (id: number) => {
    return http.get<User>(`/api/admin/users/${id}`);
  },

  // Create
  createUser: (data: UserCreateRequestDTO) => {
    return http.post<User>("/api/admin/users", data);
  },

  // Update
  updateUser: (id: number, data: UserUpdateRequestDTO) => {
    return http.put<User>(`/api/admin/users/${id}`, data);
  },

  // Delete
  deleteUser: (id: number) => {
    return http.delete(`/api/admin/users/${id}`);
  },
};
```

**Benefits:**

- ✅ Centralized API calls
- ✅ Type-safe (TypeScript generics)
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Auto unwrap data (via axios interceptor)

---

## 🗄️ Stores (Zustand)

### Global Client State

```
stores/
├── auth-store.ts             # User, token, login/logout
├── ui-store.ts               # Sidebar state, theme
└── notification-store.ts     # WebSocket notifications
```

**Pattern:**

```typescript
// auth-store.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (token, user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  checkAuth: async () => {
    /* ... */
  },
}));
```

**Usage:**

```typescript
// In component
const { user, isAuthenticated, logout } = useAuthStore();
```

**When to use Zustand:**

- ✅ Client-side UI state (sidebar open/close, theme)
- ✅ User session (token, user info)
- ✅ WebSocket notifications
- ✅ Global UI state (modal, drawer)

**When NOT to use Zustand:**

- ❌ Server data (users, products...) → Use TanStack Query
- ❌ Form state → Use React Hook Form
- ❌ Component-specific state → Use useState

---

## 📝 Types Organization

### TypeScript Definitions

```
types/
├── api.types.ts              # Generic API types (Page<T>, ApiResponse)
├── auth.types.ts             # Login, Token, OTP types
├── user.types.ts             # User, UserFilters, UserCreateDTO...
├── product.types.ts          # Product, Variant, Brand, Category
├── order.types.ts            # Order, OrderItem types
└── login-history.types.ts    # Login history types
```

**Pattern:**

```typescript
// user.types.ts

// Domain type (from backend)
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  lastLogin?: string;
}

// Request DTO
export interface UserCreateRequestDTO {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleIds: number[];
  status?: UserStatus;
}

// Filters
export interface UserFilters {
  keyword?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
}

// Enums
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";
```

---

## ⚙️ Config Files

```
config/
├── env.ts                    # Environment variables (validated với Zod)
├── api-routes.ts             # API endpoint constants
└── menu.ts                   # Sidebar menu configuration
```

**Example: `env.ts`**

```typescript
import { z } from "zod";

const envSchema = z.object({
  apiUrl: z.string().url(),
  appUrl: z.string().url(),
  nodeEnv: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nodeEnv: process.env.NODE_ENV,
});
```

---

## 📋 File Naming Conventions

### General Rules

| File Type      | Naming                  | Example                    |
| -------------- | ----------------------- | -------------------------- |
| **Pages**      | `page.tsx`              | `app/admin/users/page.tsx` |
| **Layouts**    | `layout.tsx`            | `app/admin/layout.tsx`     |
| **Components** | `kebab-case.tsx`        | `user-form-sheet.tsx`      |
| **Hooks**      | `use-{name}.ts`         | `use-users.ts`             |
| **Services**   | `{resource}.service.ts` | `user.service.ts`          |
| **Stores**     | `{name}-store.ts`       | `auth-store.ts`            |
| **Types**      | `{name}.types.ts`       | `user.types.ts`            |
| **Schemas**    | `{name}.schema.ts`      | `user.schema.ts`           |
| **Utils**      | `{name}.ts`             | `utils.ts`                 |

### Component Naming

**✅ Good:**

```
user-form-sheet.tsx
reset-password-dialog.tsx
login-history-table.tsx
brand-form.tsx
```

**❌ Bad:**

```
UserFormSheet.tsx           # Should use kebab-case
user_form_sheet.tsx         # Should use hyphen, not underscore
userForm.tsx                # Not descriptive enough
```

### Export Convention

**Named export (Recommended):**

```typescript
// user-table.tsx
export function UserTable({ users }: Props) {
  // ...
}
```

**Usage:**

```typescript
import { UserTable } from "@/components/features/user/user-table";
```

---

## 🔗 Import Path Aliases

### Configured Aliases

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Usage

**✅ Good (with alias):**

```typescript
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import { handleApiError } from "@/lib/handle-error";
```

**❌ Bad (relative paths):**

```typescript
import { Button } from "../../../components/ui/button";
import { userService } from "../../services/user.service";
```

---

## 📊 Module Dependencies

### Dependency Flow

```
┌─────────────────────────────────────────┐
│           Pages (app/)                   │
│         (React Server Components)        │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│      Feature Components                  │
│      (components/features/)              │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│         Custom Hooks                     │
│         (hooks/)                         │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│         Services Layer                   │
│         (services/)                      │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│         Axios Client                     │
│         (lib/axios-client.ts)            │
└──────────────────────────────────────────┘
```

**Rules:**

1. **Pages** → Use **Feature Components** + **Custom Hooks**
2. **Feature Components** → Use **Custom Hooks** + **UI Components**
3. **Custom Hooks** → Use **Services** + **Stores**
4. **Services** → Use **Axios Client**
5. **Never skip layers** (e.g., Page → Service directly)

---

## 🎯 Layer Responsibilities

### Pages (`app/`)

**Responsibilities:**

- ✅ Route definition
- ✅ Layout composition
- ✅ SEO metadata
- ✅ Server Components (when possible)
- ❌ No API calls directly
- ❌ No business logic

**Example:**

```typescript
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>User Management</h1>
      <UserTable /> {/* Feature component */}
    </div>
  );
}
```

### Feature Components (`components/features/`)

**Responsibilities:**

- ✅ Business logic UI
- ✅ Use custom hooks
- ✅ Form handling
- ✅ State management (local)
- ❌ No direct API calls (use services via hooks)

**Example:**

```typescript
// components/features/user/user-form-sheet.tsx
export function UserFormSheet({ user, onClose }: Props) {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    // Custom hook
    mutationFn: (data) => userService.createUser(data), // Service
    setError: form.setError,
    successMessage: "Success!",
  });

  return <Sheet>...</Sheet>;
}
```

### Custom Hooks (`hooks/`)

**Responsibilities:**

- ✅ Wrap TanStack Query (useQuery, useMutation)
- ✅ Call services
- ✅ Transform data if needed
- ❌ No UI/JSX
- ❌ No direct axios calls

**Example:**

```typescript
// hooks/use-users.ts
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => userService.getUsers(filters), // Service call
  });
};
```

### Services (`services/`)

**Responsibilities:**

- ✅ API calls (via axios)
- ✅ Type definitions
- ✅ URL construction
- ❌ No state management
- ❌ No UI logic

**Example:**

```typescript
// services/user.service.ts
export const userService = {
  getUsers: (filters) => http.get("/api/admin/users", { params: filters }),
  createUser: (data) => http.post("/api/admin/users", data),
};
```

### Stores (`stores/`)

**Responsibilities:**

- ✅ Global client state
- ✅ Actions to update state
- ✅ Persist state (if needed)
- ❌ No server data (use TanStack Query)
- ❌ No API calls directly

---

## 🎨 Styling Organization

### Tailwind CSS

**Global styles:** `app/globals.css`

**Component styles:** Inline Tailwind classes

```typescript
<div className="flex items-center gap-4 rounded-lg border p-4">
  <Button className="bg-indigo-600 hover:bg-indigo-700">Submit</Button>
</div>
```

**Utility:** `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```typescript
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // From props
)}>
```

---

## 🔐 Middleware

### Route Protection

**File:** `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY);
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/forgot-password", "/verify-otp"];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Protected routes:** `/admin/*`  
**Public routes:** `/login`, `/forgot-password`, `/verify-otp`, `/reset-password`

---

## 📊 Code Splitting

### Automatic (Next.js)

- ✅ Each page is a separate bundle
- ✅ Shared code extracted to chunks
- ✅ Dynamic imports for large components

### Manual (Optional)

```typescript
// Lazy load heavy components
const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only
});
```

---

## 🎓 Best Practices

### 1. Feature-First Organization

**✅ Good:**

```
components/features/user/
├── user-table.tsx
├── user-form-sheet.tsx
├── reset-password-dialog.tsx
└── login-history-table.tsx
```

**❌ Bad:**

```
components/
├── tables/
│   ├── user-table.tsx
│   └── product-table.tsx
└── forms/
    ├── user-form.tsx
    └── product-form.tsx
```

### 2. Colocation

**Keep related files together:**

```
features/user/
├── user-table.tsx            # Component
├── user-table.types.ts       # Types (if complex)
└── user-table.test.tsx       # Tests (future)
```

### 3. Barrel Exports (Optional)

```typescript
// components/features/user/index.ts
export { UserTable } from "./user-table";
export { UserFormSheet } from "./user-form-sheet";
export { ResetPasswordDialog } from "./reset-password-dialog";

// Usage:
import { UserTable, UserFormSheet } from "@/components/features/user";
```

---

## 🔗 Related Documentation

- [FE_CODING_RULES.md](./FE_CODING_RULES.md) - Coding standards
- [Error Handling Guide](../../src/lib/HANDLE-ERROR-README.md)
- [useAppMutation Guide](../../src/hooks/USE-APP-MUTATION-README.md)

---

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Maintainer:** Frontend Team
