# Frontend Error Handling & Form Validation

> **Cập nhật**: 21/11/2025  
> **Stack**: Next.js 14 · TanStack Query · Axios · React Hook Form · Zod

---

## 📋 Mục Lục

1. [Centralized Error Handling (Axios Interceptor)](#1-centralized-error-handling-axios-interceptor)
2. [Form Inline Error Handling (409 Conflict)](#2-form-inline-error-handling-409-conflict)
3. [Service Layer Updates](#3-service-layer-updates)
4. [WebSocket Notification System](#4-websocket-notification-system)

---

## 1. Centralized Error Handling (Axios Interceptor)

### 🎯 Mục Đích

Tập trung xử lý lỗi từ backend vào một nơi duy nhất (`src/lib/axios-client.ts`), đảm bảo:
- **Consistency**: Tất cả lỗi được xử lý theo cùng một cách
- **User Experience**: Hiển thị thông báo lỗi tiếng Việt rõ ràng
- **Maintainability**: Dễ dàng cập nhật logic xử lý lỗi

### 📁 Files

- **`src/lib/axios-client.ts`**: Axios instance với request/response interceptors
- **`src/stores/auth-store.ts`**: Export `forceLogout()` helper function
- **`src/components/providers/query-provider.tsx`**: QueryClient configuration

### 🔧 Implementation

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
  },
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

### 🔄 Refresh Token Logic

```typescript
// Khi gặp 401, tự động refresh token
if (error?.response?.status === 401 && !originalRequest._retry) {
  // 1. Kiểm tra refresh token trong localStorage
  // 2. Gọi API /api/auth/refresh với refresh token
  // 3. Lưu access token mới vào cookie
  // 4. Retry request gốc với token mới
  // 5. Nếu refresh thất bại → Logout
}
```

**Features:**
- Queue system để tránh multiple refresh calls
- Tự động retry request gốc sau khi refresh thành công
- Tránh infinite loop khi refresh token cũng bị 401

### 📝 Error Message Extraction

```typescript
const getErrorMessage = (error: AxiosError): string => {
  const response = error.response?.data;
  
  // Format 1: ApiResponse { status, message, data, timestamp }
  if ("message" in response && typeof response.message === "string") {
    return response.message;
  }
  
  // Format 2: GlobalExceptionHandler { status, error, message, timestamp, path, errors? }
  if ("error" in response && typeof response.error === "string") {
    return response.error;
  }
  
  return "Đã có lỗi xảy ra";
};
```

---

## 2. Form Inline Error Handling (409 Conflict)

### 🎯 Mục Đích

Khi gặp lỗi **409 Conflict** (ví dụ: email/phone đã tồn tại), hiển thị lỗi **ngay dưới input field** thay vì chỉ hiển thị toast, giúp user biết chính xác field nào bị lỗi.

### 📁 Files

- **`src/components/features/user/user-form-sheet.tsx`**: User create/edit form
- **`src/hooks/use-users.ts`**: React Query mutations

### 🔧 Implementation

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

  // Nếu không match với email hoặc phone, hiển thị toast chung
  if (
    !messageLower.includes("email") &&
    !messageLower.includes("phone") &&
    !messageLower.includes("số điện thoại") &&
    !messageLower.includes("điện thoại")
  ) {
    toast.error(errorMessage || "Dữ liệu đã tồn tại");
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
      return; // Không throw error để tránh Next.js error overlay
    }
  },
  // Quan trọng: Không throw error cho lỗi 409
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

### ✨ Features

- **Inline Error Display**: Lỗi hiển thị ngay dưới input field
- **Input Styling**: Input chuyển sang màu đỏ khi có lỗi
- **No Error Overlay**: Không hiển thị Next.js error overlay cho lỗi 409
- **Smart Detection**: Tự động phát hiện field nào bị lỗi dựa trên message từ backend
- **Vietnamese Messages**: Tất cả thông báo lỗi đều bằng tiếng Việt

### 🎨 UI Behavior

1. User submit form với email/phone đã tồn tại
2. Backend trả về 409 với message chứa "email" hoặc "phone"
3. Form tự động:
   - Set error cho field tương ứng với `type: "manual"`
   - Input chuyển sang màu đỏ
   - Hiển thị message lỗi tiếng Việt ngay dưới input
   - **Không hiển thị** Next.js error overlay

---

## 3. Service Layer Updates

### 🎯 Mục Đích

Cập nhật tất cả service files để tương thích với response interceptor mới (đã unwrap `response.data`).

### 📁 Files Updated

- **`src/services/user.service.ts`**
- **`src/services/role.service.ts`**
- **`src/services/auth.service.ts`**
- **`src/services/category.service.ts`**
- **`src/services/brand.service.ts`**
- **`src/services/upload.service.ts`**

### 🔧 Changes

#### Before (Old)

```typescript
export const userService = {
  getUsers: (params?: UserFilters) =>
    http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params })
      .then((res) => unwrapPage(res.data)), // ❌ res.data
};
```

#### After (New)

```typescript
export const userService = {
  getUsers: (params?: UserFilters) =>
    http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params })
      .then((res) => unwrapPage(res)), // ✅ res (đã unwrap bởi interceptor)
};
```

### 📝 Pattern

**Tất cả service methods:**
- **GET/POST/PUT/PATCH**: Response đã được unwrap → Dùng `res` thay vì `res.data`
- **DELETE**: Vẫn dùng `res.data` nếu cần

**Exception:**
- **Auth endpoints** (login, refreshToken, getCurrentUser): Backend trả về DTO trực tiếp (không wrap trong ApiResponse) → Dùng `res` trực tiếp

---

## 4. WebSocket Notification System

### 🎯 Mục Đích

Hiển thị thông báo real-time khi có sự kiện mới (ví dụ: đơn hàng mới) mà không cần refresh trang.

### 📁 Files

**Backend:**
- **`src/main/java/.../config/WebSocketConfig.java`**: WebSocket configuration
- **`src/main/java/.../modules/notification/service/NotificationService.java`**: Service để gửi notifications
- **`src/main/java/.../modules/shopping/service/CheckoutService.java`**: Trigger notification khi có đơn hàng mới

**Frontend:**
- **`src/hooks/use-websocket.ts`**: React hook để kết nối WebSocket
- **`src/stores/notification-store.ts`**: Zustand store để quản lý notifications
- **`src/components/layout/header.tsx`**: Notification bell với badge
- **`src/components/features/notification/notification-list.tsx`**: Danh sách notifications

### 🔧 Backend Implementation

#### WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Prefix cho client subscribe
        config.setApplicationDestinationPrefixes("/app"); // Prefix cho client gửi message
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // SockJS fallback
    }
}
```

#### Notification Service

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

### 🔧 Frontend Implementation

#### WebSocket Hook

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

### ✨ Features

- **Real-time Updates**: Tự động nhận notifications khi có sự kiện mới
- **Persistent Storage**: Notifications được lưu trong localStorage
- **Unread Count Badge**: Hiển thị số notifications chưa đọc trên bell icon
- **Toast Notification**: Hiển thị toast khi nhận notification mới
- **Auto-connect**: Tự động kết nối khi user đã đăng nhập
- **Auto-reconnect**: Tự động kết nối lại nếu mất kết nối

---

## 📚 Best Practices

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
- ✅ **React Hook Form** cho form state management
- ✅ **Inline errors** cho server-side validation errors (409)
- ✅ **Manual error type** để phân biệt lỗi từ server vs client

### 4. WebSocket

- ✅ **Auto-connect** khi authenticated
- ✅ **Auto-reconnect** khi mất kết nối
- ✅ **Persistent storage** để giữ notifications qua page refresh
- ✅ **Cleanup** khi component unmount

---

## 🔗 Related Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Backend API documentation
- **[DASHBOARD_FEATURES.md](../orchard-store-dashboad/docs/DASHBOARD_FEATURES.md)**: Frontend features
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**: Coding standards và conventions

---

## 📝 Changelog

### 21/11/2025
- ✅ Implemented centralized error handling trong Axios interceptor
- ✅ Added form inline error handling cho lỗi 409 Conflict
- ✅ Updated tất cả service files để tương thích với response unwrapping
- ✅ Implemented WebSocket notification system
- ✅ Added Vietnamese error messages cho tất cả error types

