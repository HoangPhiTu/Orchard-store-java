# User Management - Documentation

**Module:** User Management (Quản lý Người dùng)  
**Version:** 1.0  
**Last Updated:** 2025-12-03

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Documentation](#api-documentation)
6. [Tính Năng Đặc Biệt](#tính-năng-đặc-biệt)
7. [Caching Strategy](#caching-strategy)
8. [Code Examples](#code-examples)
9. [Testing Guide](#testing-guide)

---

## 📊 Tổng Quan

Module **User Management** cung cấp đầy đủ các chức năng quản lý người dùng trong hệ thống admin, bao gồm:

- ✅ Xem danh sách users với tìm kiếm, lọc và phân trang
- ✅ Xem chi tiết user
- ✅ Tạo user mới
- ✅ Cập nhật thông tin user
- ✅ Khóa/Mở khóa user (toggle status)
- ✅ Reset password cho user
- ✅ Xóa user
- ✅ Xem lịch sử đăng nhập
- ✅ Quản lý roles và permissions (RBAC)

### Tech Stack

**Backend:**

- Spring Boot 3.x
- Spring Data JPA
- Spring Cache (Redis)
- Spring Security
- MapStruct (DTO Mapping)
- Flyway (Database Migration)

**Frontend:**

- Next.js 14 (App Router)
- React Query (TanStack Query)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod

---

## 🗄️ Database Schema

### Bảng `users`

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'ADMIN',
    primary_role_id BIGINT,
    additional_permissions JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED')),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    last_password_reset_request TIMESTAMP,
    last_login TIMESTAMP,
    last_login_ip VARCHAR(45),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (failed_login_attempts >= 0)
);
```

### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_primary_role ON users(primary_role_id) WHERE primary_role_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_additional_permissions ON users USING GIN (additional_permissions);
CREATE INDEX idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;
```

### Mô Tả Các Trường

| Trường                        | Kiểu         | Mô Tả                                         | Ví Dụ                 |
| ----------------------------- | ------------ | --------------------------------------------- | --------------------- |
| `id`                          | BIGSERIAL    | Primary key tự động tăng                      | `1`                   |
| `email`                       | VARCHAR(255) | Email đăng nhập (unique)                      | `"admin@example.com"` |
| `password`                    | VARCHAR(255) | Mật khẩu đã hash (BCrypt)                     | `"$2a$10$..."`        |
| `full_name`                   | VARCHAR(255) | Họ và tên đầy đủ                              | `"Nguyễn Văn A"`      |
| `phone`                       | VARCHAR(20)  | Số điện thoại                                 | `"0123456789"`        |
| `avatar_url`                  | VARCHAR(500) | URL ảnh đại diện                              | `"https://..."`       |
| `role`                        | VARCHAR(20)  | Role cũ (legacy, backward compatibility)      | `"ADMIN"`             |
| `primary_role_id`             | BIGINT       | ID role chính (RBAC)                          | `1`                   |
| `additional_permissions`      | JSONB        | Permissions bổ sung (override từ roles)       | `{"products": ["*"]}` |
| `status`                      | VARCHAR(20)  | Trạng thái (ACTIVE/INACTIVE/BANNED/SUSPENDED) | `"ACTIVE"`            |
| `failed_login_attempts`       | INTEGER      | Số lần đăng nhập sai                          | `0`                   |
| `locked_until`                | TIMESTAMP    | Thời gian khóa đến khi nào                    | `2025-12-03 10:00:00` |
| `password_changed_at`         | TIMESTAMP    | Thời gian đổi mật khẩu lần cuối               | `2025-12-03 10:00:00` |
| `last_password_reset_request` | TIMESTAMP    | Thời gian yêu cầu reset password lần cuối     | `2025-12-03 10:00:00` |
| `last_login`                  | TIMESTAMP    | Thời gian đăng nhập lần cuối                  | `2025-12-03 10:00:00` |
| `last_login_ip`               | VARCHAR(45)  | IP đăng nhập lần cuối                         | `"192.168.1.1"`       |
| `notes`                       | TEXT         | Ghi chú về user                               | `"User VIP"`          |
| `created_at`                  | TIMESTAMP    | Thời gian tạo                                 | `2025-12-03 10:00:00` |
| `updated_at`                  | TIMESTAMP    | Thời gian cập nhật                            | `2025-12-03 10:00:00` |

### Bảng `user_roles` (Many-to-Many)

```sql
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
```

### Bảng `login_history`

```sql
CREATE TABLE login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(255),
    login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED')),
    failure_reason VARCHAR(255),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_email ON login_history(email);
CREATE INDEX idx_login_history_time ON login_history(login_at DESC);
CREATE INDEX idx_login_history_status ON login_history(login_status);
```

### Constraints

- **Unique Constraint:** `email` phải unique
- **Check Constraint:**
  - `status` chỉ được là `ACTIVE`, `INACTIVE`, `BANNED`, hoặc `SUSPENDED`
  - `failed_login_attempts >= 0`
  - `login_status` chỉ được là `SUCCESS`, `FAILED`, hoặc `LOCKED`
- **Foreign Keys:**
  - `users.primary_role_id` → `roles.id`
  - `user_roles.user_id` → `users.id` (ON DELETE CASCADE)
  - `user_roles.role_id` → `roles.id` (ON DELETE CASCADE)
  - `login_history.user_id` → `users.id` (ON DELETE SET NULL)

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.auth
├── controller/
│   └── UserAdminController.java
├── service/
│   ├── UserAdminService.java
│   └── UserAdminServiceImpl.java
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java
├── dto/
│   ├── UserResponseDTO.java
│   ├── UserCreateRequestDTO.java
│   └── UserUpdateRequestDTO.java
└── mapper/
    └── UserAdminMapper.java
```

### Entity: `User.java`

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // Legacy role field (backward compatibility)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private LegacyRole role = LegacyRole.ADMIN;

    // Enhanced role management (RBAC ready)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_role_id")
    private Role primaryRole;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_permissions", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> additionalPermissions = Map.of();

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private List<Role> roles = new ArrayList<>();

    public enum Status {
        ACTIVE, INACTIVE, BANNED, SUSPENDED
    }
}
```

**Đặc điểm:**

- Hỗ trợ RBAC (Role-Based Access Control) với bảng `user_roles`
- Legacy role field để backward compatibility
- Additional permissions (JSONB) để override permissions từ roles
- Security fields: `failed_login_attempts`, `locked_until`
- Audit fields: `last_login`, `last_login_ip`

### DTO: `UserResponseDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
    private List<RoleDTO> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private String lastLoginIp;
}
```

### Service: `UserAdminServiceImpl.java`

**Các phương thức chính:**

1. **`getUserById(Long id)`**

   - **Caching:** `@Cacheable(value = "users", key = "#id")`
   - **Optimization:** Sử dụng `findByIdWithRoles()` với EntityGraph để tránh N+1 query
   - **Return:** `UserResponseDTO` với đầy đủ thông tin user và roles

2. **`getUsers(keyword, status, pageable)`**

   - Tìm kiếm theo keyword (email, tên, số điện thoại)
   - Lọc theo status
   - Phân trang và sắp xếp

3. **`createUser(UserCreateRequestDTO request)`**

   - Validate email unique
   - Hash password với BCrypt
   - Assign roles
   - Cache eviction

4. **`updateUser(Long id, UserUpdateRequestDTO request)`**

   - **Cache Eviction:** `@CacheEvict(value = "users", key = "#id")`
   - Validate email unique (trừ chính nó)
   - Cập nhật roles

5. **`toggleUserStatus(Long id)`**

   - **Cache Eviction:** `@CacheEvict(value = "users", key = "#id")`
   - Chuyển đổi giữa ACTIVE và INACTIVE

6. **`resetPassword(Long id, String newPassword)`**

   - Hash password mới
   - Cache eviction

7. **`deleteUser(Long id)`**

   - **Cache Eviction:** `@CacheEvict(value = "users", allEntries = true)`
   - Validation: Không cho phép xóa chính mình

8. **`getLoginHistory(Long userId, Pageable pageable)`**

   - Lấy lịch sử đăng nhập của user
   - Phân trang

### Controller: `UserAdminController.java`

**Endpoints:**

- `GET /api/admin/users` - Lấy danh sách với phân trang
- `GET /api/admin/users/{id}` - Lấy chi tiết theo ID
- `POST /api/admin/users` - Tạo mới
- `PUT /api/admin/users/{id}` - Cập nhật
- `PUT /api/admin/users/{id}/toggle-status` - Khóa/Mở khóa
- `PUT /api/admin/users/{id}/reset-password` - Reset password
- `DELETE /api/admin/users/{id}` - Xóa
- `GET /api/admin/users/{id}/login-history` - Lịch sử đăng nhập

**Security:**

- Tất cả endpoints yêu cầu role `ADMIN`
- Sử dụng `@PreAuthorize("hasRole('ADMIN')")`

---

## 🎨 Frontend Implementation

### Package Structure

```
orchard-store-dashboad/src
├── components/
│   └── features/
│       └── user/
│           ├── user-form-sheet.tsx
│           ├── user-row.tsx
│           ├── user-table.tsx
│           └── dialogs/
│               ├── reset-password-dialog.tsx
│               ├── delete-user-dialog.tsx
│               └── toggle-status-dialog.tsx
├── hooks/
│   └── use-users.ts
├── services/
│   └── user.service.ts
└── types/
    └── user.types.ts
```

### TypeScript Types: `user.types.ts`

```typescript
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";

export interface User {
  id: number;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  roles: Role[];
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLogin?: string | null;
  lastLoginIp?: string | null;
}

export interface UserFilter {
  keyword?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}
```

### Service: `user.service.ts`

```typescript
export const userService = {
  getUsers: (params?: UserFilter) => ...,
  getUser: (id: number) => ...,
  createUser: (data: UserFormData) => ...,
  updateUser: (id: number, data: Partial<UserFormData>) => ...,
  toggleUserStatus: (id: number) => ...,
  resetPassword: (id: number, newPassword: string) => ...,
  deleteUser: (id: number) => ...,
  getLoginHistory: (userId: number, params?: { page?: number; size?: number }) => ...,
};
```

### React Hooks: `use-users.ts`

#### `useUsers(filters?: UserFilter)`

```typescript
export const useUsers = (filters?: UserFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeUserFilters(filters),
    [filters]
  );

  return useQuery<Page<User>, Error>({
    queryKey: [...USERS_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: () => userService.getUsers(normalizedFilters),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
```

**Features:**

- Normalize filters để đảm bảo consistent query keys
- `keepPreviousData` để tránh flash khi pagination
- Caching với staleTime và gcTime

#### `useUser(id: number | null)`

```typescript
export const useUser = (id: number | null) => {
  return useQuery<User, Error>({
    queryKey: [...USERS_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("User ID is required");
      }
      return userService.getUser(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

**Features:**

- Chỉ query khi có ID
- Caching lâu hơn (5 phút staleTime) vì user data ít thay đổi
- Không refetch khi mount lại hoặc window focus

### Components

#### `UserFormSheet`

**Tính năng:**

- Form validation với react-hook-form và zod
- Role selection với multi-select
- Avatar upload
- i18n đầy đủ
- Optimized với `useCallback` và `useMemo`
- Lazy loaded để giảm initial bundle size

#### `UserTable`

**Tính năng:**

- Virtual scrolling cho performance tốt với large datasets
- Sortable columns
- Action buttons (Edit, Delete, Toggle Status, Reset Password)
- i18n đầy đủ

#### Dialogs

- **`ResetPasswordDialog`**: Reset password cho user
- **`DeleteUserDialog`**: Xác nhận trước khi xóa
- **`ToggleStatusDialog`**: Xác nhận trước khi khóa/mở khóa

---

## 📡 API Documentation

### Base URL

```
/api/admin/users
```

### 1. GET /api/admin/users

Lấy danh sách users với phân trang và tìm kiếm.

**Query Parameters:**

- `page` (int, default: 0) - Số trang
- `size` (int, default: 20) - Số lượng mỗi trang
- `keyword` (string, optional) - Từ khóa tìm kiếm (email, tên, số điện thoại)
- `status` (string, optional) - Lọc theo status (ACTIVE/INACTIVE/BANNED/SUSPENDED)

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách users thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "email": "user@example.com",
        "fullName": "John Doe",
        "phone": "0123456789",
        "status": "ACTIVE",
        "roles": [
          {
            "id": 1,
            "name": "ADMIN",
            "description": "Administrator"
          }
        ]
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  }
}
```

### 2. GET /api/admin/users/{id}

Lấy chi tiết user theo ID.

**Response:**

```json
{
  "success": true,
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "0123456789",
    "avatar": "https://...",
    "status": "ACTIVE",
    "roles": [...],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00",
    "lastLogin": "2024-01-01T00:00:00",
    "lastLoginIp": "192.168.1.1"
  }
}
```

### 3. POST /api/admin/users

Tạo user mới.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "fullName": "New User",
  "phone": "0123456789",
  "roleIds": [1, 2]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo user thành công",
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    ...
  }
}
```

**Status Codes:**

- `201 Created` - Tạo thành công
- `400 Bad Request` - Validation error
- `409 Conflict` - Email đã tồn tại

### 4. PUT /api/admin/users/{id}

Cập nhật thông tin user.

**Request Body:**

```json
{
  "fullName": "Updated Name",
  "phone": "0987654321",
  "avatar": "https://...",
  "roleIds": [1]
}
```

**Status Codes:**

- `200 OK` - Cập nhật thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Validation error
- `409 Conflict` - Email đã tồn tại

### 5. PUT /api/admin/users/{id}/toggle-status

Khóa/Mở khóa user.

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật trạng thái user thành công",
  "data": {
    "id": 1,
    "status": "INACTIVE"
  }
}
```

### 6. PUT /api/admin/users/{id}/reset-password

Reset password cho user.

**Request Body:**

```json
{
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reset password thành công",
  "data": null
}
```

### 7. DELETE /api/admin/users/{id}

Xóa user.

**Response:**

```json
{
  "success": true,
  "message": "Xóa user thành công",
  "data": null
}
```

**Status Codes:**

- `200 OK` - Xóa thành công
- `404 Not Found` - Không tìm thấy
- `400 Bad Request` - Không thể xóa (ví dụ: đang là chính mình)

### 8. GET /api/admin/users/{id}/login-history

Lấy lịch sử đăng nhập của user.

**Query Parameters:**

- `page` (int, default: 0) - Số trang
- `size` (int, default: 20) - Số lượng mỗi trang

**Response:**

```json
{
  "success": true,
  "message": "Lấy lịch sử đăng nhập thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "email": "user@example.com",
        "ipAddress": "192.168.1.1",
        "loginStatus": "SUCCESS",
        "loginAt": "2024-01-01T00:00:00",
        "deviceType": "Desktop",
        "browser": "Chrome",
        "os": "Windows"
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  }
}
```

---

## ⚡ Tính Năng Đặc Biệt

### 1. RBAC (Role-Based Access Control)

**Backend:**

- Hỗ trợ multiple roles per user qua bảng `user_roles`
- Primary role và additional roles
- Additional permissions (JSONB) để override permissions từ roles
- Hierarchy levels cho roles

**Frontend:**

- Multi-select cho role assignment
- Hiển thị roles của user trong table và detail view

### 2. Security Features

- **Password Hashing:** Sử dụng BCrypt
- **Account Locking:** Tự động khóa sau N lần đăng nhập sai
- **Login History:** Ghi lại tất cả lần đăng nhập (success/failed/locked)
- **IP Tracking:** Lưu IP đăng nhập lần cuối

### 3. Code Splitting

Form component được lazy load để giảm initial bundle size:

```typescript
const UserFormSheet = dynamic(
  () =>
    import("@/components/features/user/user-form-sheet").then(
      (mod) => mod.UserFormSheet
    ),
  {
    ssr: false,
    loading: () => null,
  }
);
```

---

## 💾 Caching Strategy

### Backend Caching

#### Cache Configuration

- **Cache Name:** `"users"`
- **Cache Key:** `#id` (user ID)
- **Cache Provider:** Redis (Spring Cache)

#### Cached Methods

1. **`getUserById(Long id)`**

   ```java
   @Cacheable(value = "users", key = "#id", unless = "#result == null")
   ```

   - Cache user data khi fetch
   - TTL: Mặc định của Redis configuration

2. **Cache Eviction**

   - **`updateUser()`**: `@CacheEvict(value = "users", key = "#id")`
   - **`toggleUserStatus()`**: `@CacheEvict(value = "users", key = "#id")`
   - **`resetPassword()`**: `@CacheEvict(value = "users", key = "#id")`
   - **`deleteUser()`**: `@CacheEvict(value = "users", allEntries = true)`

#### Cache Hit Rate

- **Expected:** ~80-90% cho user detail queries
- **Performance:** Giảm database load đáng kể

### Frontend Caching

#### React Query Configuration

**List Query (`useUsers`):**

- `staleTime`: 2 phút
- `gcTime`: 10 phút
- `refetchOnMount`: false
- `refetchOnWindowFocus`: false

**Detail Query (`useUser`):**

- `staleTime`: 5 phút (lâu hơn vì ít thay đổi)
- `gcTime`: 15 phút
- `refetchOnMount`: false
- `refetchOnWindowFocus`: false

#### Cache Invalidation

Tự động invalidate khi:

- Create user → Invalidate list queries
- Update user → Invalidate detail query và list queries
- Delete user → Invalidate list queries
- Toggle status → Invalidate detail query và list queries

---

## 💻 Code Examples

### Backend: Get User with Caching

```java
@Override
@Transactional(readOnly = true)
@Cacheable(value = "users", key = "#id", unless = "#result == null")
public UserResponseDTO getUserById(Long id) {
    log.info("Getting user by ID: {} (cache miss)", id);
    User user = userRepository.findByIdWithRoles(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    return userAdminMapper.toDTO(user);
}
```

### Frontend: Use User Hook

```typescript
function UserDetailPage({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{user.fullName}</h1>
      <p>{user.email}</p>
      <div>
        <h2>Roles:</h2>
        {user.roles.map((role) => (
          <span key={role.id}>{role.name}</span>
        ))}
      </div>
    </div>
  );
}
```

### Frontend: Create User Mutation

```typescript
function CreateUserForm() {
  const createUser = useCreateUser();
  const { t } = useI18n();

  const onSubmit = async (data: UserFormData) => {
    await createUser.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending
          ? t("common.loading")
          : t("admin.forms.user.create.submit")}
      </Button>
    </form>
  );
}
```

---

## 🧪 Testing Guide

### Backend Testing

1. **Unit Tests:**

   - Test validation rules
   - Test business logic (trùng email, không xóa chính mình)
   - Test password hashing

2. **Integration Tests:**

   - Test API endpoints
   - Test database constraints
   - Test pagination và filtering
   - Test caching

### Frontend Testing

1. **Component Tests:**

   - Test form validation
   - Test role selection
   - Test dialogs

2. **E2E Tests:**

   - Test CRUD operations
   - Test search và filter
   - Test toggle status
   - Test reset password

### Test Cases

**Backend:**

- ✅ Tạo user với email và password hợp lệ
- ✅ Tạo user trùng email → throw exception
- ✅ Cập nhật user → validate không trùng email (trừ chính nó)
- ✅ Xóa user đang là chính mình → throw exception
- ✅ Toggle status → chuyển đổi ACTIVE/INACTIVE
- ✅ Reset password → hash password mới

**Frontend:**

- ✅ Validate form với Zod schema
- ✅ Hiển thị error messages
- ✅ Multi-select roles
- ✅ Avatar upload

---

## 📝 Notes & Best Practices

### Backend

1. **Security:**

   - Sử dụng BCrypt cho password hashing
   - Validate email unique
   - Account locking sau N lần đăng nhập sai

2. **Performance:**

   - Sử dụng EntityGraph để tránh N+1 query
   - Caching với Spring Cache
   - Pagination cho danh sách lớn

3. **RBAC:**

   - Hỗ trợ multiple roles per user
   - Additional permissions để override

### Frontend

1. **State Management:**

   - Sử dụng React Query cho server state
   - Local state cho form với React Hook Form

2. **UX:**

   - Real-time validation
   - Loading states
   - Error handling với user-friendly messages
   - Debounced search

3. **Performance:**

   - Code splitting với lazy loading
   - Virtual scrolling cho large datasets
   - Memoization với useMemo và useCallback

---

## 🚀 Future Enhancements

1. **Soft Delete:** Thêm `deleted_at` thay vì hard delete
2. **Audit Log:** Ghi lại lịch sử thay đổi
3. **Bulk Operations:** Import/Export CSV
4. **Advanced Search:** Tìm kiếm theo nhiều tiêu chí
5. **Two-Factor Authentication:** 2FA cho security
6. **Email Verification:** Xác thực email khi tạo user

---

## 📚 References

- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-03  
**Author:** Development Team
