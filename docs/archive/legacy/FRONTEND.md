# ⚡ Frontend Documentation - Orchard Store

**Last Updated**: 2025-11-22  
**Stack**: Next.js 14 · TanStack Query · Axios · React Hook Form · Zod · WebSocket

> **📌 Xem thêm:**
>
> - **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**: Coding standards, naming conventions
> - **[BACKEND.md](./BACKEND.md)**: Backend documentation
> - **[PROJECT.md](./PROJECT.md)**: Planning và roadmap

---

## 📋 Mục Lục

1. [Tổng Quan](#-tổng-quan)
2. [Project Structure](#-project-structure)
3. [Error Handling](#-error-handling)
4. [Authentication & State Management](#-authentication--state-management)
5. [UI Components & Features](#-ui-components--features)
6. [WebSocket Notifications](#-websocket-notifications)
7. [Best Practices](#-best-practices)

---

## 🎯 Tổng Quan

Admin Dashboard được xây dựng với Next.js 14 (App Router), TypeScript, Tailwind CSS, và TanStack Query. Hệ thống sử dụng centralized error handling, form inline error handling, và WebSocket notifications.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios với interceptors
- **Notifications**: Sonner (Toast) + WebSocket (STOMP)
- **JWT**: jose (Edge Runtime compatible)

---

## 📁 Project Structure

```
src/
├─ app/
│  ├─ (auth)/                    # Authentication routes
│  │  ├─ login/page.tsx
│  │  ├─ forgot-password/page.tsx
│  │  ├─ verify-otp/page.tsx
│  │  └─ reset-password/page.tsx
│  ├─ (admin)/                   # Admin routes (protected)
│  │  ├─ layout.tsx              # Admin layout với role check
│  │  ├─ dashboard/page.tsx
│  │  ├─ brands/page.tsx
│  │  ├─ categories/page.tsx
│  │  └─ users/page.tsx
│  └─ layout.tsx                 # Root layout
├─ components/
│  ├─ layout/                    # Header, Sidebar
│  ├─ features/                  # Feature-specific components
│  │  ├─ user/
│  │  ├─ notification/
│  │  └─ dashboard/
│  ├─ shared/                    # Logo, LoadingSpinner
│  └─ ui/                        # Shadcn base components
├─ lib/
│  ├─ axios-client.ts            # Axios với interceptors
│  ├─ jwt.ts                     # JWT utilities
│  └─ utils.ts
├─ services/                     # HTTP clients
│  ├─ auth.service.ts
│  ├─ user.service.ts
│  ├─ brand.service.ts
│  └─ category.service.ts
├─ hooks/                        # Reusable hooks
│  ├─ use-auth.ts
│  ├─ use-users.ts
│  ├─ use-breadcrumbs.ts
│  └─ use-websocket.ts
├─ stores/                       # Zustand stores
│  ├─ auth-store.ts
│  ├─ notification-store.ts
│  └─ ui-store.ts
├─ types/                        # TypeScript types
│  ├─ auth.types.ts
│  ├─ user.types.ts
│  └─ api.types.ts
├─ providers/
│  ├─ auth-provider.tsx
│  └─ query-provider.tsx
└─ middleware.ts                 # Next.js middleware cho route protection
```

---

## 🔧 Error Handling

### Centralized Error Handling (Axios Interceptor)

**File**: `src/lib/axios-client.ts`

#### Request Interceptor

```typescript
http.interceptors.request.use((config) => {
  // Lấy token từ cookie
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Features:**

- Tự động thêm `Authorization` header từ cookie `orchard_admin_token`
- Timeout: 30 giây
- BaseURL từ environment variable

#### Response Interceptor - Success

```typescript
http.interceptors.response.use(
  (response) => {
    return response.data; // Unwrap data tự động
  }
  // Error handler...
);
```

**Features:**

- Tự động unwrap `response.data` → Service layer nhận data trực tiếp
- Giảm boilerplate code trong service files

#### Response Interceptor - Error Handling

**401 Unauthorized:**

- Tự động refresh token nếu có refresh token
- Queue system: Nếu nhiều request cùng lúc bị 401, chỉ refresh 1 lần
- Nếu refresh thất bại → Logout và redirect về `/login`
- Toast: "Phiên đăng nhập hết hạn"

**403 Forbidden:**

- Toast: "Không có quyền truy cập"

**404 Not Found:**

- Toast: "Không tìm thấy dữ liệu" + message từ backend

**409 Conflict:**

- **Không hiển thị toast** (để form xử lý inline error)
- Form component sẽ xử lý và hiển thị error dưới input field

**422 Validation Error:**

- Nếu có `errors` object → Hiển thị lỗi đầu tiên
- Nếu không → Hiển thị message chung
- Toast: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."

**500 Server Error:**

- Toast: "Lỗi hệ thống"

**Network Error:**

- Toast: "Mất kết nối máy chủ"

### Form Inline Error Handling (409 Conflict)

**File**: `src/components/features/user/user-form-sheet.tsx`

#### Handle Conflict Error Function

```typescript
const handleConflictError = (error: AxiosError) => {
  const errorMessage =
    (error.response?.data as { message?: string })?.message || "";
  const messageLower = errorMessage.toLowerCase();

  // Kiểm tra message chứa từ khóa 'email'
  if (messageLower.includes("email")) {
    form.setError("email", {
      type: "manual", // Báo cho form biết đây là lỗi từ server
      message: "Email này đã được sử dụng",
    });
  }

  // Kiểm tra message chứa từ khóa 'phone'
  if (
    messageLower.includes("phone") ||
    messageLower.includes("số điện thoại") ||
    messageLower.includes("điện thoại")
  ) {
    form.setError("phone", {
      type: "manual",
      message: "Số điện thoại đã tồn tại",
    });
  }
};
```

#### Mutation Error Handling

```typescript
const createUser = useCreateUser({
  onSuccess: () => {
    toast.success("Tạo người dùng thành công");
    onOpenChange(false);
    form.reset(DEFAULT_VALUES);
  },
  onError: (error) => {
    // Kiểm tra nếu là lỗi 409 (Conflict)
    if (
      error instanceof Error &&
      "response" in error &&
      (error as AxiosError).response?.status === 409
    ) {
      handleConflictError(error as AxiosError);
      return false; // Prevent error from propagating
    }
    return true; // Let other errors propagate
  },
  throwOnError: (error) => {
    if (
      error instanceof Error &&
      "response" in error &&
      (error as AxiosError).response?.status === 409
    ) {
      return false; // Không throw, đã xử lý inline
    }
    return true; // Throw các lỗi khác
  },
});
```

**Features:**

- **Inline Error Display**: Lỗi hiển thị ngay dưới input field
- **Input Styling**: Input chuyển sang màu đỏ khi có lỗi
- **No Error Overlay**: Không hiển thị Next.js error overlay cho lỗi 409
- **Smart Detection**: Tự động phát hiện field nào bị lỗi dựa trên message từ backend
- **Vietnamese Messages**: Tất cả thông báo lỗi đều bằng tiếng Việt

---

## 🔐 Authentication & State Management

### Zustand Store

**File**: `src/stores/auth-store.ts`

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Implementation...
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Features:**

- Persistent storage với localStorage
- Auto-initialize khi app load
- Token refresh logic
- Force logout helper

### Force Logout Helper

**File**: `src/stores/auth-store.ts`

```typescript
export const forceLogout = () => {
  const logout = useAuthStore.getState().logout;
  logout().catch(() => (window.location.href = "/login"));
};
```

**Usage**: Được gọi từ Axios interceptor khi token hết hạn hoặc refresh thất bại.

### RBAC Middleware

**File**: `src/middleware.ts`

**Features:**

- Decode/verify JWT token từ cookie sử dụng thư viện `jose` (Edge Runtime compatible)
- Kiểm tra role từ JWT payload
- **Chặn CUSTOMER**: User có role CUSTOMER sẽ bị redirect về trang chủ với `?error=forbidden`
- **Chỉ cho phép ADMIN và STAFF**: Chỉ user có `ROLE_ADMIN` hoặc `ROLE_STAFF` mới truy cập được `/admin/*`
- Hỗ trợ JWT_SECRET để verify token (optional)

### JWT Utilities

**File**: `src/lib/jwt.ts`

```typescript
// Decode JWT không verify (nhanh, ít an toàn)
export const decodeTokenUnsafe = (token: string): JWTPayload | null

// Verify và decode JWT với secret (an toàn)
export const verifyToken = (token: string, secret: string): JWTPayload | null

// Lấy roles từ JWT payload
export const extractRoles = (payload: JWTPayload): string[]

// Kiểm tra ADMIN/STAFF role
export const hasAdminOrStaffRole = (roles: string[]): boolean

// Kiểm tra chỉ có CUSTOMER role
export const isCustomerOnly = (roles: string[]): boolean
```

---

## 🎨 UI Components & Features

### Routing & Layout

- **`src/app/admin/**`\*\* – chứa mọi màn hình admin
- **Admin layout** – `src/app/admin/layout.tsx`, bảo vệ quyền truy cập, kết nối `Sidebar`, `Header`, logout, mobile sidebar
- **Auth routes** – `src/app/(auth)` (login, forgot-password, verify-otp, reset-password)

### Sidebar

**File**: `src/components/layout/sidebar.tsx`

**Features:**

- Menu chính + channels + resources
- List Brands/Categories
- Collapse functionality
- Scroll desktop/mobile
- Logout button

### Header

**File**: `src/components/layout/header.tsx`

**Features:**

- **Dynamic Breadcrumbs**: Hiển thị breadcrumbs động dựa trên URL hiện tại
- Sử dụng `useBreadcrumbs` hook để parse pathname và tạo breadcrumb items
- Xử lý ID trong URL (UUID/numeric) → hiển thị "Details" hoặc rút gọn ID
- Clickable navigation (trừ mục cuối) để quay lại trang cha
- Responsive: ẩn trên mobile, hiển thị trên desktop
- Notification bell với unread count badge
- Avatar với user menu
- Toggle mobile sidebar

### Dashboard

**File**: `src/app/admin/dashboard/page.tsx`

**Features:**

- Stats cards (total revenue, orders, customers, low-stock alert)
- Charts (Recharts line + bar)
- Recent orders table với colored status badges

### Brand & Category Management

**Files**: `src/app/admin/brands/page.tsx`, `src/app/admin/categories/page.tsx`

**Features:**

- Full CRUD UI với Shadcn UI Table
- Search (client-side filtering)
- Client-side pagination
- Status badges (ACTIVE/INACTIVE)
- Action dropdown (Edit, Delete)
- Sheet form components với:
  - Auto-slug generation từ name
  - Image upload preview
  - Zod validation
  - TanStack Query mutations (create/update/delete)

### User Management

#### User Form Sheet với Tabs Layout

**File**: `src/components/features/user/user-form-sheet.tsx`

**Features:**

- **Tabs Layout (Edit Mode Only)**:

  - **Tab 1 (Profile)**: Form nhập liệu thông tin user (Full Name, Email, Password, Phone, Roles, Status).
  - **Tab 2 (History)**: Bảng lịch sử đăng nhập hiển thị thời gian, IP Address, và trạng thái (SUCCESS/FAILED/LOCKED).
  - **Create Mode**: Chỉ hiển thị form, không có Tabs.

- **Login History Integration**:
  - Sử dụng `useUserHistory` hook để fetch dữ liệu từ `GET /api/admin/users/{id}/history`.
  - Hiển thị trong `LoginHistoryTable` component với format DD/MM/YYYY HH:mm.
  - Badge màu sắc theo trạng thái: Xanh (SUCCESS), Đỏ (FAILED), Cam (LOCKED).

**Components:**

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Shadcn UI Tabs)
- `LoginHistoryTable` - Component hiển thị bảng lịch sử đăng nhập

**Hook:**

- `useUserHistory(userId, filters)` - React Query hook để fetch login history

**Type Definitions:**

- `LoginHistory` - Interface cho login history item
- `LoginHistoryPage` - Page response type với pagination

### User Management (Legacy)

**File**: `src/app/admin/users/page.tsx`

**Features:**

- Full CRUD UI với search, filter, pagination
- User table với Avatar, Badge màu sắc
- Status badges (Active: xanh lá, Inactive: xám, Banned: đỏ)
- Role badges (Admin: màu đỏ/cam, Staff: màu xanh)
- Form sheet với inline error handling cho 409 Conflict errors

**Components:**

- `components/features/user/user-table.tsx` - Table component
- `components/features/user/user-form-sheet.tsx` - Form component
- `components/features/user/reset-password-dialog.tsx` - Reset password dialog (Admin only)

**Actions Menu:**

- **Edit**: Mở UserFormSheet để chỉnh sửa user
- **Reset Password**: Mở ResetPasswordDialog để đặt lại mật khẩu (chỉ Admin)
- **Lock/Unlock**: Toggle user status (ACTIVE ↔ INACTIVE)

**Form Validation (Zod Schema):**

**File**: `src/lib/schemas/user.schema.ts`

**Create User Schema:**

- ✅ `fullName`: Required, min 2 ký tự, max 50 ký tự, chỉ chữ cái và khoảng trắng
- ✅ `email`: Required, validate format email
- ✅ `password`: Required, min 6 ký tự, max 100 ký tự
- ✅ `phone`: Optional, validate số điện thoại Việt Nam (regex: `^(0|\+84|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$`)
- ✅ `roleIds`: Required, min 1 phần tử
- ✅ `status`: Optional, default "ACTIVE"

**Update User Schema:**

- ✅ `fullName`: Optional, min 2 ký tự, max 50 ký tự
- ✅ `phone`: Optional, validate số điện thoại Việt Nam
- ✅ `password`: Optional, nếu nhập thì min 6 ký tự
- ✅ `roleIds`: Optional, nếu có thì min 1 phần tử
- ✅ `status`: Optional
- ⚠️ **Email không được cập nhật** (không có trong schema)

**UI Constraints (Form UI):**

- ✅ **Email Field**: Disabled và `bg-slate-100` khi Edit mode
- ✅ **Password Field**: Helper text "Để trống nếu bạn không muốn thay đổi mật khẩu" khi Edit
- ✅ **Status Switch**: Ẩn khi Create (mặc định ACTIVE), chỉ hiện khi Edit
- ✅ **Submit Button**: Disable khi `form.formState.isSubmitting` để tránh double click

**Error Handling:**

- ✅ **409 Conflict**: Inline error cho email/phone duplicate
  - Email duplicate → `form.setError('email', { message: 'Email này đã được sử dụng' })`
  - Phone duplicate → `form.setError('phone', { message: 'Số điện thoại đã tồn tại' })`
- ✅ **400 Bad Request (Role Hierarchy)**:
  - Toast error từ Axios interceptor với message cụ thể từ backend
  - Warning Alert hiển thị trên form với icon và message được format gọn gàng
  - **Format Message**: Tách thành title và details (technical info như "Role level: X < User level: Y" hiển thị riêng)
  - **Visual Design**:
    - Background: `bg-amber-50` với border `border-amber-200`
    - Title: `text-amber-900 font-semibold`
    - Details: `text-amber-700 font-mono bg-amber-100/50` (monospace cho technical details)
  - Message ví dụ:
    - Title: "Bạn không thể gán role có quyền cao hơn cho user này."
    - Details: "Role level: 9 < User level: 10"
  - Không throw error để tránh Next.js error overlay
- ✅ **422 Validation**: Global toast từ Axios interceptor
- ✅ **Other 400 Errors**: Global toast với message từ backend

---

## 🔔 WebSocket Notification System

### Backend Setup

**File**: `src/main/java/.../config/WebSocketConfig.java`

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

**File**: `src/main/java/.../modules/notification/service/NotificationService.java`

```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendNewOrderNotification(Long orderId, String orderNumber, String customerName) {
        String message = String.format("Có đơn hàng mới #%s từ %s", orderNumber, customerName);
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", orderId);
        data.put("orderNumber", orderNumber);
        sendNotification("/topic/admin-notifications", message, "NEW_ORDER", data);
    }
}
```

### Frontend Implementation

#### WebSocket Hook

**File**: `src/hooks/use-websocket.ts`

```typescript
export const useWebSocket = () => {
  const stompClient = useRef<Client | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const client = new Client({
      brokerURL: `${env.apiUrl}/ws`,
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => new SockJS(`${env.apiUrl}/ws`),
      onConnect: () => {
        client.subscribe("/topic/admin-notifications", (message) => {
          const notification = JSON.parse(message.body);
          addNotification({
            message: notification.message,
            type: notification.type,
            timestamp: notification.timestamp,
            data: notification.data,
          });
          toast.info(notification.message);
        });
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, addNotification]);
};
```

#### Notification Store

**File**: `src/stores/notification-store.ts`

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}
```

**Features:**

- Persistent storage trong localStorage
- Unread count tracking
- Mark as read functionality

#### Notification Components

**File**: `src/components/features/notification/notification-list.tsx`

**Features:**

- Danh sách notifications với timestamp
- Mark as read/unread
- Remove notification
- Clear all notifications
- Format timestamp với `date-fns`

**File**: `src/components/layout/header.tsx`

**Features:**

- Notification bell icon với unread count badge
- Popover chứa danh sách notifications
- Click để mở/đóng popover

---

## 📝 Service Layer Updates

### Pattern

Tất cả service methods đã được cập nhật để tương thích với response interceptor mới (đã unwrap `response.data`):

**Before (Old):**

```typescript
export const userService = {
  getUsers: (params?: UserFilters) =>
    http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params })
      .then((res) => unwrapPage(res.data)), // ❌ res.data
};
```

**After (New):**

```typescript
export const userService = {
  getUsers: (params?: UserFilters) =>
    http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params })
      .then((res) => unwrapPage(res)), // ✅ res (đã unwrap bởi interceptor)
};
```

### Updated Services

- `src/services/user.service.ts`
- `src/services/role.service.ts`
- `src/services/auth.service.ts`
- `src/services/category.service.ts`
- `src/services/brand.service.ts`
- `src/services/upload.service.ts`

**Exception:**

- **Auth endpoints** (login, refreshToken, getCurrentUser): Backend trả về DTO trực tiếp (không wrap trong ApiResponse) → Dùng `res` trực tiếp

---

## ✅ Best Practices

### 1. Error Handling

- ✅ **Luôn sử dụng Axios Interceptor** để xử lý lỗi tập trung
- ✅ **Không duplicate toast** - Interceptor đã xử lý, component không cần toast lại
- ✅ **Form inline errors** cho lỗi 409 - User experience tốt hơn
- ✅ **Tiếng Việt** cho tất cả error messages

### 2. Service Layer

- ✅ **Unwrap response** trong interceptor → Service layer nhận data trực tiếp
- ✅ **Consistent pattern** - Tất cả services follow cùng một pattern
- ✅ **Type safety** - Sử dụng TypeScript types cho request/response

### 3. Form Validation

- ✅ **Zod schemas** cho client-side validation
  - **User Schema**: Full validation với regex cho số điện thoại Việt Nam
  - **Auth Schema**: Login, forgot password, OTP, reset password
  - **Product Schema**: Variant validation (SKU, price, stock)
  - **Catalog Schema**: Brand và Category với slug validation
  - Tất cả validation messages đã được chuẩn hóa sang **tiếng Việt**
- ✅ **React Hook Form** cho form state management
- ✅ **Inline errors** cho server-side validation errors (409)
  - Email duplicate → Inline error trên email field
  - Phone duplicate → Inline error trên phone field
- ✅ **Manual error type** để phân biệt lỗi từ server vs client
- ✅ **Schema per mode**: `createUserSchema` và `updateUserSchema` riêng biệt

### 4. WebSocket

- ✅ **Auto-connect** khi authenticated
- ✅ **Auto-reconnect** khi mất kết nối
- ✅ **Persistent storage** để giữ notifications qua page refresh
- ✅ **Cleanup** khi component unmount

### 5. State Management

- ✅ **Zustand** cho client state (auth, notifications, UI)
- ✅ **TanStack Query** cho server state (API calls, caching)
- ✅ **Persistent storage** cho auth state và notifications

---

## 📚 Related Documentation

- **[BACKEND.md](./BACKEND.md)**: Backend API documentation
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**: Coding standards và conventions
- **[PROJECT.md](./PROJECT.md)**: Planning và roadmap

---

## 📝 Changelog

### 22/11/2025

- ✅ **Admin Reset Password Feature**:
  - Created `ResetPasswordDialog` component với Shadcn Dialog
  - Added "Reset Password" menu item trong UserTable actions dropdown
  - Created `adminResetPasswordSchema` với Zod validation (min 6 ký tự)
  - Added `resetPassword` method vào `user.service.ts`
  - Integrated vào User Management page với state management
- ✅ **User Validation Rules (Backend)**:
  - Added duplicate validation cho email và phone
  - Added self-protection validation (không cho tự khóa/xóa chính mình)
  - Added role validation (roleIds không được rỗng)
  - Created `OperationNotPermittedException` cho unauthorized operations
- ✅ **User Form Validation (Frontend)**:
  - Created `user.schema.ts` với validation chặt chẽ:
    - Full Name: min 2, max 50, chỉ chữ cái và khoảng trắng
    - Email: format validation
    - Phone: Regex số điện thoại Việt Nam
    - Password: min 6, max 100 ký tự
    - Roles: min 1 phần tử
  - Separated `createUserSchema` và `updateUserSchema`
  - All validation messages chuẩn hóa sang tiếng Việt
- ✅ **Form UI Constraints**:
  - Email field disabled và styled khi Edit mode
  - Password helper text khi Edit
  - Status switch ẩn khi Create
  - Submit button disable khi submitting

### 21/11/2025

- ✅ Implemented centralized error handling trong Axios interceptor
- ✅ Added form inline error handling cho lỗi 409 Conflict
- ✅ Updated tất cả service files để tương thích với response unwrapping
- ✅ Implemented WebSocket notification system
- ✅ Added Vietnamese error messages cho tất cả error types
- ✅ Added User Management module với full CRUD operations
- ✅ Added RBAC middleware với JWT verification
- ✅ Added dynamic breadcrumbs
- ✅ Added Brand & Category Management với full CRUD UI

---

**Last Updated**: 2025-11-22  
**Version**: 1.3.0
