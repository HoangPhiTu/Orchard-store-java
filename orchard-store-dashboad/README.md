# Orchard Admin Dashboard

Next.js 14 (App Router) admin panel for the Orchard e-commerce backend (Spring Boot).  
Tech stack: **TypeScript, Ant Design 5, Tailwind CSS, TanStack Query v5, Zustand, Axios, React Hook Form + Zod**.

---

## 📋 Table of Contents

1. [Project Structure](#1-project-structure-enterprise-ready)
2. [Environment Variables](#2-environment-variables)
3. [Installation & Setup](#3-installation--setup)
4. [Authentication Features](#4-authentication-features)
5. [Development Notes](#5-development-notes)
6. [Scripts](#6-scripts)

---

## 1. Project Structure (Enterprise-Ready)

```
src/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx              # Login page với saved logins
│  │  ├─ forgot-password/page.tsx    # Forgot password page (gửi OTP)
│  │  ├─ verify-otp/page.tsx         # Verify OTP page
│  │  └─ reset-password/page.tsx     # Reset password page (với OTP)
│  ├─ (admin)/
│  │  ├─ admin/dashboard/page.tsx    # Dashboard overview
│  │  └─ layout.tsx                  # Admin layout với role check
│  ├─ (store)/page.tsx               # Storefront placeholder
│  ├─ api/health/route.ts            # Example API route
│  ├─ layout.tsx                     # Root layout với AuthProvider
│  └─ not-found.tsx
├─ components/
│  ├─ layout/                        # Header, Sidebar
│  ├─ shared/                        # Logo, LoadingSpinner
│  ├─ admin/                         # Dashboard-only widgets
│  ├─ store/                         # Storefront widgets
│  └─ ui/                            # Shadcn base components
├─ lib/
│  ├─ axios-client.ts                # Axios với refresh token logic
│  ├─ utils.ts
│  ├─ constants.ts                   # API routes
│  └─ schemas/
│     └─ auth.schema.ts              # Zod schemas cho auth forms
├─ services/                         # HTTP clients
│  └─ auth.service.ts                # Auth API services
├─ hooks/                            # Reusable hooks
├─ stores/                           # Zustand stores
│  └─ auth-store.ts                  # Auth state management
├─ types/                            # DTO & API typing
│  └─ auth.types.ts                  # Auth TypeScript types
├─ providers/
│  ├─ auth-provider.tsx              # Auth initialization provider
│  └─ query-provider.tsx             # TanStack Query + AntD theme
└─ middleware.ts                     # Next.js middleware cho route protection
```

---

## 2. Environment Variables

Create a `.env.local` file in the project root (or copy `env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ACCESS_TOKEN_KEY=orchard_admin_token
JWT_SECRET=your-jwt-secret-key-here
```

- `NEXT_PUBLIC_API_URL` points to the Spring Boot backend.
- `NEXT_PUBLIC_ACCESS_TOKEN_KEY` is the token key used by axios interceptors, middleware, and Zustand store.
- `JWT_SECRET` (optional but recommended): JWT secret for token verification in middleware. Should match the secret used in backend Spring Boot. If not provided, middleware will decode tokens without verification (less secure but faster).

---

## 3. Installation & Setup

### Prerequisites

- Node.js ≥ 20 and npm ≥ 10.
- Backend API (Spring Boot) running and exposing `/api/auth/login`.
- Supabase DB + Redis already configured for the backend.

### Installation

```bash
cd orchard-admin-dashboad
npm install          # first time only
npm run dev          # starts Next.js on http://localhost:3000
```

### Step-by-Step Setup Guide

1. **Environment Setup**

   - Copy `env.local.example` to `.env.local`
   - Update `NEXT_PUBLIC_API_URL` to match your backend URL
   - Ensure `NEXT_PUBLIC_ACCESS_TOKEN_KEY` matches the cookie name in middleware

2. **Login Flow**

   - Visit `http://localhost:3000/login`
   - Submit valid admin credentials
   - On success, the app stores the JWT in:
     - `localStorage[TOKEN_KEY]`
     - Cookie `TOKEN_KEY` (used by middleware)
   - Browser automatically redirects to `/admin/dashboard`
   - **Remember me** (checkbox) → cookie/token will live 7 days; if unchecked, it's a session cookie

3. **Saved Login Snapshots**

   - Login page saves up to 3 recent logins (email + password encoded in Base64 in `localStorage`)
   - When focusing on Email/Password or clicking `Saved logins` button, a popover shows the list of previously logged-in accounts
   - Selecting an account auto-fills both email and password; there's a 🗑 button to delete each entry
   - Each record shows the last login time in `vi-VN` format for easy identification

4. **Route Protection với RBAC**

   - `middleware.ts` enforces authentication và **Role-Based Access Control (RBAC)**:
     - Decode/verify JWT token từ cookie sử dụng thư viện `jose`
     - Kiểm tra role từ JWT payload (`roles` array)
     - **Chặn CUSTOMER**: User có role CUSTOMER sẽ bị redirect về trang chủ với `?error=forbidden`
     - **Chỉ cho phép ADMIN và STAFF**: Chỉ user có `ROLE_ADMIN` hoặc `ROLE_STAFF` mới truy cập được `/admin/*`
     - Not logged in → redirect to `/login?next=<requested-path>`
     - Already logged in → blocked from revisiting `/login`, redirected to `/admin/dashboard`

5. **Verifying Authentication**
   - **Without token**: Open a fresh incognito window → hitting `/admin/dashboard` must redirect to `/login`
   - **With token**: Log in → try visiting `/login` again → should bounce back to `/admin/dashboard`

---

## 4. Authentication Features

### ✅ 4.1. Session Bootstrapping

**Mục đích**: Tự động kiểm tra và khôi phục session khi ứng dụng load.

**Implementation**:

- **File**: `src/providers/auth-provider.tsx`
- **File**: `src/stores/auth-store.ts` (method `initialize()`)
- **File**: `src/app/layout.tsx` (wrapped với `AuthProvider`)

**Cách hoạt động**:

1. Khi app load, `AuthProvider` tự động gọi `initialize()`
2. Kiểm tra token trong Cookie/LocalStorage
3. Nếu có token, gọi API `/api/auth/me` để verify và lấy thông tin user
4. Cập nhật auth state trong Zustand store

**Lợi ích**:

- User không cần login lại khi refresh trang
- Tự động sync user info với server
- Phát hiện token hết hạn và logout tự động

---

### ✅ 4.2. Refresh Token Logic

**Mục đích**: Tự động làm mới access token khi hết hạn mà không cần user login lại.

**Implementation**:

- **File**: `src/lib/axios-client.ts` (response interceptor)

**Cách hoạt động**:

1. Khi API call trả về 401 (Unauthorized)
2. Kiểm tra xem có refresh token trong LocalStorage không
3. Gọi API `/api/auth/refresh` với refresh token
4. Lưu access token mới vào Cookie
5. Retry request gốc với token mới
6. Nếu refresh thất bại → logout và redirect về login

**Tính năng đặc biệt**:

- Queue system: Nếu nhiều request cùng lúc bị 401, chỉ refresh 1 lần
- Tránh vòng lặp vô hạn khi refresh token cũng bị 401
- Tự động retry request gốc sau khi refresh thành công

---

### ✅ 4.3. Role-Based Access Control (RBAC) với JWT Verification

**Mục đích**: Đảm bảo chỉ user có quyền ADMIN hoặc STAFF mới truy cập được admin dashboard. Chặn CUSTOMER khỏi admin routes.

**Implementation**:

- **File**: `src/middleware.ts` (server-side RBAC với JWT verification)
- **File**: `src/lib/jwt.ts` (JWT decode/verify utilities)
- **File**: `src/app/(admin)/layout.tsx` (client-side role check)

**Cách hoạt động**:

**Server-side (Middleware với RBAC)**:

1. Extract JWT token từ Cookie
2. Decode/verify token sử dụng thư viện `jose`:
   - Nếu có `JWT_SECRET` → verify token với secret (an toàn)
   - Nếu không có → decode token mà không verify (nhanh hơn, ít an toàn hơn)
3. Extract `roles` từ JWT payload
4. **RBAC Logic**:
   - Nếu `isCustomerOnly(roles)` → redirect về `/` với `?error=forbidden`
   - Nếu không có `hasAdminOrStaffRole(roles)` → redirect về `/` với `?error=unauthorized`
   - Chỉ cho phép truy cập nếu có `ROLE_ADMIN` hoặc `ROLE_STAFF`
5. Redirect về `/login` nếu không có token khi truy cập `/admin/*`
6. Redirect về `/admin/dashboard` nếu có token và role hợp lệ khi truy cập `/login`

**Client-side (Layout)**:

- Kiểm tra `user.roles` sau khi auth initialized
- Nếu không có role `ADMIN` → logout và redirect về login với error message
- Hiển thị loading spinner trong lúc check auth

**JWT Payload Structure** (từ backend):

```json
{
  "sub": "admin@example.com",
  "userId": 1,
  "roles": ["ROLE_ADMIN", "ROLE_STAFF"],
  "authorities": ["product:view", "product:create"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

### ✅ 4.4. Forgot Password với OTP

**Mục đích**: Cho phép user yêu cầu reset password bằng cách gửi OTP qua email.

**Implementation**:

- **File**: `src/app/(auth)/forgot-password/page.tsx`
- **File**: `src/lib/schemas/auth.schema.ts` (`sendOtpSchema`)
- **File**: `src/services/auth.service.ts` (`sendOtp`)
- **Backend**: `POST /api/auth/send-otp`

**Tính năng**:

- Form validation với Zod schema (email required, valid email format)
- Email input với icon
- Success state với hướng dẫn chuyển đến verify OTP
- Button "Continue to verify OTP" để chuyển sang trang verify
- Link quay lại login
- Error handling với toast notifications
- Security: Không tiết lộ email có tồn tại hay không

**UI/UX**:

- Gradient background giống login page (slate-50 to white)
- Card design nhất quán với backdrop blur
- Responsive design
- Loading states với spinner

**Flow**:

```
1. User nhập email → Submit form
2. Call API /api/auth/send-otp
3. Backend gửi OTP 6 số qua email
4. Success message → Redirect đến /verify-otp?email=...
```

---

### ✅ 4.5. Verify OTP Page

**Mục đích**: Xác thực OTP code 6 số được gửi qua email.

**Implementation**:

- **File**: `src/app/(auth)/verify-otp/page.tsx`
- **File**: `src/lib/schemas/auth.schema.ts` (`verifyOtpSchema`)
- **File**: `src/services/auth.service.ts` (`verifyOtp`)
- **Backend**: `POST /api/auth/verify-otp`

**Tính năng**:

- 6 input fields riêng biệt cho OTP (mỗi input 1 số)
- Auto-focus và auto-advance giữa các input
- Hỗ trợ paste OTP (6 số)
- Backspace để quay lại input trước
- Resend OTP button với loading state
- Success state với auto-redirect đến reset password
- Error handling với toast notifications
- Validation: OTP phải là 6 số

**UI/UX**:

- Gradient background nhất quán
- Large input fields (h-14 w-14) với text-2xl font
- Visual feedback khi nhập
- Resend OTP với icon RefreshCw
- Link quay lại login

**Flow**:

```
1. User nhận OTP qua email
2. Nhập 6 số OTP vào form
3. Call API /api/auth/verify-otp
4. Backend verify OTP → Return reset token
5. Success → Redirect đến /reset-password?email=...&otp=...
```

---

### ✅ 4.6. Reset Password Page (OTP-based)

**Mục đích**: Cho phép user đặt lại password mới sau khi verify OTP thành công.

**Implementation**:

- **File**: `src/app/(auth)/reset-password/page.tsx`
- **File**: `src/lib/schemas/auth.schema.ts` (`resetPasswordSchema`)
- **File**: `src/services/auth.service.ts` (`resetPassword`)
- **Backend**: `POST /api/auth/reset-password`

**Tính năng**:

- Nhận email và OTP từ query params (`?email=...&otp=...`)
- Form validation với password confirmation
- Show/hide password toggle cho cả 2 fields
- Success state với auto-redirect về login (3 giây)
- Email và OTP validation (redirect nếu thiếu)
- Password matching validation
- Minimum password length (6 characters)

**Security**:

- OTP được validate ở server
- Password confirmation matching
- Password được encode bằng BCrypt trước khi lưu
- Reset failed login attempts sau khi reset password
- Update password changed timestamp

**Flow**:

```
1. User verify OTP thành công
2. Redirect đến /reset-password?email=...&otp=...
3. User nhập password mới và confirm
4. Call API /api/auth/reset-password với email, otp, newPassword, confirmPassword
5. Backend verify OTP, encode password, save vào database
6. Success → Redirect về /login
```

---

### ✅ 4.7. Get Current User API

**Mục đích**: Lấy thông tin user hiện tại từ server để verify session.

**Implementation**:

- **File**: `src/services/auth.service.ts` (`getCurrentUser`)
- **File**: `src/stores/auth-store.ts` (method `checkAuth()`)
- **Backend**: `GET /api/auth/me`

**Response Structure**:

```typescript
{
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  authorities?: string[];
}
```

---

### 🔄 Authentication Flows

#### Login Flow

```
1. User nhập email/password → Submit form
2. Call API /api/auth/login
3. Backend verify credentials → Return accessToken + refreshToken + user info
4. Lưu token vào Cookie (và LocalStorage nếu "Remember me")
5. Lưu user info vào LocalStorage
6. Update Zustand store
7. Redirect về /admin/dashboard (hoặc URL trong query param "next")
```

#### Session Restoration Flow

```
1. App load → AuthProvider.initialize()
2. Check token trong Cookie/LocalStorage
3. Nếu có token → Call /api/auth/me
4. Server verify token → Return user info
5. Update Zustand store với user info
6. Render app với authenticated state
```

#### Token Refresh Flow

```
1. API call trả về 401
2. Axios interceptor catch error
3. Check refresh token trong LocalStorage
4. Call /api/auth/refresh với refresh token
5. Server verify refresh token → Return new accessToken
6. Lưu accessToken mới vào Cookie
7. Retry request gốc với token mới
```

#### Logout Flow

```
1. User click logout
2. Call API /api/auth/logout (optional, để revoke token ở server)
3. Xóa token khỏi Cookie và LocalStorage
4. Xóa user info khỏi LocalStorage
5. Reset Zustand store
6. Redirect về /login
```

#### Forgot Password với OTP Flow

```
1. User vào /forgot-password
2. Nhập email → Submit form
3. Call API /api/auth/send-otp
4. Backend:
   - Check rate limit (max 5 lần trong 5 phút)
   - Generate OTP 6 số
   - Lưu OTP vào Redis (TTL: 5 phút)
   - Gửi OTP qua email
5. Success → Redirect đến /verify-otp?email=...
6. User nhập OTP 6 số
7. Call API /api/auth/verify-otp
8. Backend verify OTP → Tạo reset token
9. Success → Redirect đến /reset-password?email=...&otp=...
10. User nhập password mới và confirm
11. Call API /api/auth/reset-password
12. Backend:
    - Verify OTP/reset token
    - Encode password mới bằng BCrypt
    - Save vào database
    - Reset failed login attempts
    - Update password changed timestamp
    - Xóa OTP và reset token
13. Success → Redirect về /login
14. User có thể login với password mới
```

---

### 🔐 Security Features

#### Token Storage

- Access token: Cookie (HttpOnly-safe, có thể đọc bởi middleware)
- Refresh token: LocalStorage (chỉ dùng khi refresh)
- User info: LocalStorage (không nhạy cảm)

#### Cookie Configuration

```typescript
{
  path: "/",              // Accessible ở mọi route
  sameSite: "Lax",        // CSRF protection
  secure: false,          // true trong production với HTTPS
  expires: 7              // 7 ngày nếu "Remember me"
}
```

#### Password Security

- Minimum 6 characters
- Base64 encoding cho saved logins (không phải encryption, chỉ để tránh plain text)
- Password confirmation matching

#### Route Protection

- Server-side: Middleware check token
- Client-side: Layout check roles
- Auto-redirect nếu unauthorized

---

### 🧪 Testing Checklist

#### Login

- [ ] Login thành công với email/password đúng
- [ ] Login thất bại với credentials sai → Hiển thị error
- [ ] "Remember me" → Token lưu 7 ngày
- [ ] Không "Remember me" → Token session (tắt browser là mất)
- [ ] Saved logins → Hiển thị và chọn được
- [ ] Redirect về URL trong query param "next"

#### Session Management

- [ ] Refresh trang → Vẫn đăng nhập
- [ ] Token hết hạn → Tự động refresh
- [ ] Refresh token hết hạn → Logout và redirect về login
- [ ] Logout → Xóa sạch session và redirect

#### Route Protection

- [ ] Truy cập `/admin/*` không có token → Redirect về login
- [ ] Truy cập `/login` đã có token → Redirect về dashboard
- [ ] User không có role ADMIN → Logout và redirect

#### Forgot/Reset Password với OTP

- [ ] Submit forgot password với email hợp lệ → Success message và redirect đến verify OTP
- [ ] Submit với email không tồn tại → Success message (không tiết lộ email có tồn tại)
- [ ] Nhập OTP đúng → Success và redirect đến reset password
- [ ] Nhập OTP sai → Error message và clear OTP inputs
- [ ] OTP hết hạn → Error message và option resend
- [ ] Resend OTP → Gửi OTP mới và clear form
- [ ] Reset password với OTP hợp lệ → Success và redirect về login
- [ ] Reset password không có email/OTP → Redirect về forgot password
- [ ] Password confirmation không match → Validation error
- [ ] Sau khi reset password → Có thể login với password mới

---

### 📝 Backend API Endpoints Required

Đảm bảo backend có các endpoints sau:

- ✅ `POST /api/auth/login` - Login (đã có)
- ✅ `GET /api/auth/me` - Get current user (đã có)
- ✅ `POST /api/auth/refresh` - Refresh token (đã có)
- ✅ `POST /api/auth/send-otp` - Gửi OTP qua email (đã có)
- ✅ `POST /api/auth/verify-otp` - Verify OTP code (đã có)
- ✅ `POST /api/auth/reset-password` - Reset password với OTP (đã có)
- ⚠️ `POST /api/auth/logout` - Logout (cần verify)

---

## 5. Development Notes

- Tailwind CSS v4 (`@import "tailwindcss";`) + Ant Design reset CSS.
- TanStack Query client configured in `providers/query-provider.tsx` (with devtools enabled).
- Dashboard shell implemented with custom Sidebar/Header to mirror Saledash UI.

### Mock Data

Until backend analytics endpoints are ready, the dashboard uses mock data:

- Stat cards: total revenue, orders, customers, low-stock alert.
- Charts: `recharts` line + bar data seeded in the page.
- Recent orders table: 5 sample orders with colored status badges.

Swap these with live API hooks once endpoints are available (e.g., via TanStack Query).

### Common Tweaks

- Change dashboard accent colors or spacing → update `components/layout/*` or Tailwind classes in the layout.
- Add new protected pages → create routes under `src/app/(admin)/admin/*`; middleware will guard them automatically.
- Update token key → change both `.env.local` and `TOKEN_KEY` fallback in `middleware.ts`.

### Image Upload Module

**Mục đích**: Upload và quản lý ảnh (avatar, product images) lên MinIO (S3 Compatible).

**Implementation**:

- **Service**: `src/services/upload.service.ts`

  - Method: `uploadImage(file: File, folder: string): Promise<string>`
  - Validate file type (chỉ ảnh) và size (tối đa 5MB)
  - Gọi API `POST /api/admin/upload` với FormData
  - Trả về URL ảnh từ backend response

- **Component**: `src/components/shared/image-upload.tsx`
  - Reusable component cho upload ảnh
  - Props: `value`, `onChange`, `disabled`, `folder`, `size`
  - UI: Avatar tròn với ảnh hoặc placeholder, nút X để xóa, loading spinner
  - Tích hợp với React Hook Form qua `form.setValue()`

**Tích hợp vào User Form**:

- File: `src/components/features/user/user-form-sheet.tsx`
- `ImageUpload` component được đặt ở đầu form, căn giữa
- Folder: `"users"` cho avatar
- Kết nối với form state qua `form.watch("avatarUrl")` và `form.setValue()`
- Schema: `avatarUrl` field đã được thêm vào `user.schema.ts` (optional, nullable, URL validation)

**Tính năng**:

- ✅ Upload ảnh lên MinIO qua backend API
- ✅ Validate file type và size (5MB max)
- ✅ Loading state với spinner
- ✅ Error handling với toast notifications
- ✅ Xóa ảnh (set `avatarUrl` về `null`)
- ✅ Hiển thị ảnh hiện tại hoặc placeholder
- ✅ Disable state khi form đang submit

**Cách sử dụng**:

```tsx
import { ImageUpload } from "@/components/shared/image-upload";

<ImageUpload
  value={form.watch("avatarUrl")}
  onChange={(url) => form.setValue("avatarUrl", url || null)}
  folder="users"
  size="lg"
  disabled={isPending}
/>;
```

**Backend API**:

- `POST /api/admin/upload` - Upload ảnh (cần authentication)
  - Request: `multipart/form-data` với `file` và `folder`
  - Response: `ApiResponse<string>` với URL ảnh

**MinIO Configuration**:

- Endpoint: `http://127.0.0.1:9000`
- Bucket: `orchard-bucket`
- Folder structure: `users/`, `products/`, `others/`
- Access Policy: PUBLIC (cho phép đọc công khai)

Xem thêm: `orchard-store-backend/MINIO_SETUP_GUIDE.md`

---

### User Management Module

**Mục đích**: Quản lý users (nhân viên/admin) với đầy đủ CRUD operations và các tính năng bổ sung.

**Implementation**:

- **Service**: `src/services/user.service.ts`

  - Methods: `getUsers`, `getUser`, `createUser`, `updateUser`, `toggleUserStatus`, `resetPassword`, `deleteUser`
  - Tất cả methods đều unwrap `ApiResponse<T>` format từ backend

- **Hooks**: `src/hooks/use-users.ts`

  - `useUsers(filters)`: TanStack Query hook để lấy danh sách users với search, pagination, status filter
  - `useUserHistory(userId, pagination)`: Hook để lấy lịch sử đăng nhập của user
  - `useCurrentUser()`: Hook để lấy thông tin user hiện tại (`GET /api/auth/me`)

- **Components**:
  - `UserTable`: Data table hiển thị danh sách users với actions
  - `UserFormSheet`: Form tạo/sửa user (có tích hợp ImageUpload cho avatar)
  - `DeleteUserDialog`: Dialog xác nhận xóa user
  - `ToggleStatusDialog`: Dialog xác nhận khóa/mở khóa user
  - `ResetPasswordDialog`: Dialog reset password cho user khác

**User Management Page** (`/admin/users`):

- **Features**:

  - Search users theo keyword (email, fullName, phone)
  - Filter theo status (ACTIVE, INACTIVE, BANNED, SUSPENDED)
  - Pagination (20 items per page)
  - Actions dropdown cho mỗi user:
    - **Edit**: Mở form sheet để chỉnh sửa
    - **Lock/Unlock**: Toggle status với confirmation dialog
    - **Reset Password**: Admin reset password cho user khác
    - **Delete**: Xóa user với confirmation dialog
  - Role-based access control:
    - Disable "Lock/Unlock" nếu user đang cố toggle chính mình
    - Disable "Lock/Unlock" nếu user không có quyền ADMIN/SUPER_ADMIN
    - Tooltip hiển thị lý do disable

- **User Form** (`UserFormSheet`):
  - Create mode: Tạo user mới với password bắt buộc
  - Edit mode: Cập nhật user (email không thể thay đổi)
  - Tabs: "Thông tin" và "Lịch sử" (chỉ hiển thị khi edit)
  - Fields:
    - Avatar upload (ImageUpload component)
    - Full Name (required)
    - Email (required, không thể sửa khi edit)
    - Password (required khi create, optional khi edit)
    - Phone (optional)
    - Roles (multi-select với cards, min 1 role)
    - Status (switch: ACTIVE/INACTIVE)
  - Validation: Zod schema với Vietnamese error messages
  - Error handling: Tự động map backend errors vào form fields
  - Success handling: Tự động đóng sheet và refresh danh sách

**Profile Page** (`/admin/profile`):

- **Mục đích**: Hiển thị thông tin user hiện tại
- **Features**:
  - Avatar với initials fallback
  - Full Name, Email, User ID
  - Roles với badges (màu sắc theo role level)
  - Permissions (nếu có)
  - Loading state và error handling
- **Hook**: `useCurrentUser()` để fetch data từ `GET /api/auth/me`

**Delete User**:

- **Component**: `DeleteUserDialog`
- **Features**:
  - Confirmation dialog với user name và email
  - Backend validation: Không thể xóa chính mình (self-protection)
  - Hierarchy check: Chỉ có thể xóa user có level thấp hơn
  - Success toast và auto-refresh danh sách
  - Error handling với toast notifications

**Toggle Status (Lock/Unlock)**:

- **Component**: `ToggleStatusDialog`
- **Features**:
  - Confirmation dialog với action (Lock/Unlock) dựa trên status hiện tại
  - Backend validation: Không thể toggle chính mình
  - Hierarchy check: Chỉ có thể toggle user có level thấp hơn
  - Success toast và auto-refresh danh sách
  - UI: Disable button và tooltip nếu không có quyền

**Reset Password**:

- **Component**: `ResetPasswordDialog`
- **Features**:
  - Form nhập password mới và confirm
  - Backend validation:
    - Cho phép self-reset (user có thể reset password của chính mình)
    - Hierarchy check khi reset password của user khác
  - Success toast và auto-close dialog
  - Error handling với form field mapping

**Backend APIs**:

- `GET /api/admin/users` - Lấy danh sách users (search, pagination, status filter)
- `POST /api/admin/users` - Tạo user mới
- `PUT /api/admin/users/{id}` - Cập nhật user
- `PATCH /api/admin/users/{id}/status` - Toggle status (Lock/Unlock)
- `PUT /api/admin/users/{id}/reset-password` - Admin reset password
- `DELETE /api/admin/users/{id}` - Xóa user
- `GET /api/admin/users/{id}/history` - Lấy lịch sử đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

**Security & Validation**:

- **Hierarchy Levels**: RBAC với hierarchy (1-10), chỉ có thể thao tác user có level thấp hơn
- **Self-Protection**: Không thể xóa, toggle status, hoặc thay đổi role của chính mình
- **Role-Based Access**: Chỉ ADMIN và SUPER_ADMIN mới có quyền quản lý users
- **Form Validation**: Zod schema với Vietnamese error messages
- **Error Handling**: Centralized error handling với `handleApiError` utility

**Tính năng đặc biệt**:

- ✅ Avatar upload tích hợp vào User Form
- ✅ Login History tab trong Edit mode
- ✅ Role-based UI (disable actions nếu không có quyền)
- ✅ Self-protection UI (disable và tooltip)
- ✅ Comprehensive error messages (Vietnamese)
- ✅ Auto-refresh danh sách sau mỗi mutation

---

### Catalog Management Module

**Services & Hooks**:

- `src/services/brand.service.ts` & `src/services/category.service.ts`: Strongly-typed CRUD helpers that unwrap the backend `ApiResponse<T>` format and accept pagination/search params.
- `src/hooks/use-brands.ts` + `use-categories.ts`: TanStack Query hooks for list/detail/mutation flows (auto-invalidates caches after create/update/delete).

**Brand Management UI** (`/admin/brands`):

- Saledash-style data table với:
  - Search (client-side filtering)
  - Client-side pagination
  - Status badges (ACTIVE/INACTIVE)
  - Action dropdown (Edit, Delete)
- `BrandForm` sheet component:
  - Auto-slug generation từ name field
  - Logo upload preview
  - Zod validation (`brandFormSchema`)
  - TanStack Query mutations (create/update/delete)

**Category Management UI** (`/admin/categories`):

- Hierarchical data table với:
  - Search (client-side filtering)
  - Filter by parent category (All/Root/specific parent)
  - Client-side pagination
  - Status badges
  - Action dropdown (Edit, Delete)
- `CategoryForm` sheet component:
  - Parent category combobox (filters out current category to prevent circular references)
  - Auto-slug generation
  - Image upload preview
  - Zod validation (`categoryFormSchema`)
  - TanStack Query mutations (create/update/delete)

**Form Validation**:

- `brandFormSchema` / `categoryFormSchema` (Zod) được tái sử dụng cho cả popup forms và future pages.
- Auto-slug generation utility: `lib/utils.ts` → `slugify()` function.

### Dynamic Breadcrumbs

**Mục đích**: Hiển thị breadcrumbs động dựa trên URL hiện tại để user biết mình đang ở đâu và dễ dàng quay lại trang cha.

**Implementation**:

- **Hook**: `src/hooks/use-breadcrumbs.ts`
- **Component**: `src/components/ui/breadcrumb.tsx` (Shadcn UI style)
- **Integration**: `src/components/layout/header.tsx`

**Features**:

- Tự động parse pathname và tạo breadcrumb items
- Map route segments thành labels (từ `ADMIN_MENU` config hoặc `ROUTE_LABELS` mapping)
- Xử lý ID trong URL:
  - UUID/numeric ID → hiển thị "Details" (nếu context là products/orders/customers)
  - Hoặc rút gọn ID (ví dụ: `a1b2...c3d4`)
- Luôn bắt đầu với "Home" → `/admin/dashboard`
- Clickable navigation (trừ mục cuối) để quay lại trang cha
- Responsive: ẩn trên mobile, hiển thị trên desktop

**Example**:

- `/admin/products/create` → `Home > Products > Create`
- `/admin/products/123` → `Home > Products > Details`
- `/admin/categories` → `Home > Categories`

### Troubleshooting

- **401 during login**: Confirm backend `/api/auth/login` works via Postman and CORS allows `http://localhost:3000`.
- **Stuck on login**: Ensure `NEXT_PUBLIC_API_URL` is correct and backend is reachable.
- **Access without login**: Verify the cookie name matches and that middleware `matcher` still includes all routes.

---

## 6. Scripts

| Command         | Description       |
| --------------- | ----------------- |
| `npm run dev`   | Start dev server  |
| `npm run build` | Production build  |
| `npm run start` | Start prod server |
| `npm run lint`  | Run ESLint        |

---

## 🚀 Next Steps (Optional Enhancements)

1. **Two-Factor Authentication (2FA)**

   - TOTP-based 2FA
   - SMS/Email OTP (đã có OTP cho password reset)

2. **Account Lockout**

   - Lock account sau N lần login sai (đã implement)
   - Unlock sau X phút hoặc qua email

3. **Session Management**

   - Hiển thị active sessions
   - Revoke sessions từ xa

4. **Password Strength Meter**

   - Real-time password strength indicator
   - Enforce strong password policy

5. **Login History**

   - Track login attempts (đã có trong backend)
   - IP address logging
   - Device/browser detection

6. **Change Password (Authenticated)**
   - Cho phép user đổi password khi đã login
   - Verify current password trước khi đổi

---

## 📚 References

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## 📋 Changelog

### Version 1.3.0 (2025-11-23)

#### ✨ New Features

- **Image Upload Component**:

  - Reusable `ImageUpload` component cho upload ảnh lên MinIO
  - Tích hợp vào User Form để upload avatar
  - Validate file type (chỉ ảnh) và size (5MB max)
  - Loading state, error handling, và success toast
  - Xóa ảnh và hiển thị placeholder

- **User Avatar Support**:

  - Thêm `avatarUrl` field vào User schema và types
  - Avatar upload trong User Form (create/edit)
  - Hiển thị avatar trong Profile page
  - Backend support cho `avatarUrl` trong User entity và DTOs

- **Upload Service**:

  - `upload.service.ts` để gọi API upload
  - Tích hợp với MinIO qua backend API
  - Error handling và validation

- **User Management Features**:
  - **Profile Page** (`/admin/profile`): Hiển thị thông tin user hiện tại với avatar, roles, permissions
  - **Delete User**: Dialog xác nhận xóa user với self-protection và hierarchy checks
  - **Toggle Status (Lock/Unlock)**: Dialog xác nhận khóa/mở khóa user với role-based access control
  - **Reset Password**: Dialog reset password với support cho self-reset và hierarchy validation
  - **User Form Enhancements**: Tích hợp ImageUpload, Login History tab, comprehensive validation
  - **Role-Based UI**: Disable actions và tooltips dựa trên permissions và hierarchy

#### 🔧 Improvements

- **User Form**: Thêm ImageUpload component ở đầu form, căn giữa
- **Schema Validation**: Thêm `avatarUrl` validation (URL format, max 500 chars)
- **Type Safety**: Cập nhật User types để bao gồm `avatarUrl`

#### 🐛 Bug Fixes

- Fixed avatar không hiển thị do bucket policy PRIVATE (cần đổi sang PUBLIC)

---

### Version 1.2.0 (2025-11-21)

#### ✨ New Features

- **Dynamic Breadcrumbs**:
  - Tự động hiển thị breadcrumbs dựa trên URL hiện tại
  - Xử lý ID trong URL (hiển thị "Details" hoặc rút gọn)
  - Clickable navigation để quay lại trang cha
  - Responsive design (ẩn trên mobile)
- **RBAC Middleware với JWT Verification**:
  - Decode/verify JWT token sử dụng thư viện `jose` (Edge Runtime compatible)
  - Kiểm tra role từ JWT payload
  - Chặn CUSTOMER khỏi `/admin/*` routes
  - Chỉ cho phép ADMIN và STAFF truy cập
  - Hỗ trợ JWT_SECRET để verify token (optional)
- **Brand & Category Management**:
  - Full CRUD UI với search, pagination, filters
  - Sheet form components với validation và image upload preview
  - Auto-slug generation
  - TanStack Query integration với auto cache invalidation

#### 🔧 Improvements

- **JWT Utilities**: Tạo `lib/jwt.ts` với các helper functions cho decode/verify và role checking
- **Environment Config**: Thêm `JWT_SECRET` vào env config (optional)
- **Breadcrumbs Hook**: Tạo `useBreadcrumbs` hook để parse pathname và tạo breadcrumb items
- **UI Components**: Thêm Shadcn UI Breadcrumb component

#### 🐛 Bug Fixes

- Fixed middleware chỉ check token mà không check role
- Fixed CUSTOMER có thể truy cập admin routes

---

### Version 1.1.0 (2025-11-21)

#### ✨ New Features

- **OTP-based Password Reset**: Implemented complete OTP flow for password recovery
  - Send OTP via email (`/forgot-password`)
  - Verify OTP with 6-digit input (`/verify-otp`)
  - Reset password with verified OTP (`/reset-password`)
- **Enhanced Security**:
  - Rate limiting for OTP requests (max 5 attempts per 5 minutes)
  - OTP expiration (5 minutes TTL)
  - Reset token expiration (10 minutes TTL)
  - Password verification after save
  - Automatic failed login attempts reset after password reset

#### 🔧 Improvements

- **Better Error Handling**: Detailed error messages and logging
- **Transaction Management**: Proper transaction handling with EntityManager flush/clear
- **Logging**: Comprehensive logging for debugging password reset flow
- **UI/UX**: Improved OTP input with auto-focus, paste support, and visual feedback

#### 🐛 Bug Fixes

- Fixed password not being saved correctly after reset
- Fixed transaction commit issues
- Fixed entity manager cache issues
- Fixed `asChild` prop error in reset password success page

---

**Last Updated**: 2025-11-21  
**Version**: 1.2.0
