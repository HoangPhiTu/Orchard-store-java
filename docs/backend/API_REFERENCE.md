# 📡 API Specification - Orchard Store Backend

> **Complete API documentation for Authentication & User Management**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Auth Module APIs](#auth-module-apis)
4. [User Module APIs](#user-module-apis)
5. [Error Codes](#error-codes)
6. [Common Patterns](#common-patterns)

---

## 🎯 Overview

### Base URL

```
Development: http://localhost:8080
Production: https://api.orchard-store.com
```

### Authentication

**All `/api/admin/*` endpoints require JWT token:**

```http
Authorization: Bearer <access_token>
```

**Public endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

### Response Format

**Success Response:**
```json
{
  "status": 200,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error Response:**
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Error message in Vietnamese",
  "timestamp": "2024-12-23T10:30:00",
  "path": "/api/admin/users"
}
```

**Validation Error Response (422):**
```json
{
  "status": 422,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": "must be a well-formed email address",
    "password": "must not be blank"
  },
  "timestamp": "2024-12-23T10:30:00",
  "path": "/api/admin/users"
}
```

---

## 🔐 Authentication

### Token Types

| Token Type | Expiry | Storage | Purpose |
|------------|--------|---------|---------|
| **Access Token** | 15 minutes | Cookie (httpOnly) | API authentication |
| **Refresh Token** | 7 days | localStorage | Refresh access token |

### Token Refresh Flow

```
1. Access token expires (15min)
2. Frontend sends refresh token
3. Backend validates refresh token
4. Generate new access + refresh tokens
5. Invalidate old refresh token
6. Return new tokens
```

---

## 🔑 Auth Module APIs

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user với email và password

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@orchard.com",
  "password": "admin123",
  "rememberMe": true
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "email": "admin@orchard.com",
      "fullName": "Administrator",
      "roles": ["SUPER_ADMIN", "ADMIN"]
    }
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error Responses:**

**401 Unauthorized** - Sai email hoặc password:
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Email hoặc mật khẩu không đúng",
  "timestamp": "2024-12-23T10:30:00"
}
```

**403 Forbidden** - Account bị khóa:
```json
{
  "status": 403,
  "error": "FORBIDDEN",
  "message": "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
  "timestamp": "2024-12-23T10:30:00"
}
```

**429 Too Many Requests** - Quá 5 lần đăng nhập sai:
```json
{
  "status": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Tài khoản tạm thời bị khóa 30 phút do đăng nhập sai quá nhiều lần",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 2. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refresh access token khi hết hạn

**Request:**
```http
POST /api/auth/refresh HTTP/1.1
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",  // New refresh token
    "expiresIn": 900,
    "user": {
      "id": 1,
      "email": "admin@orchard.com",
      "fullName": "Administrator",
      "roles": ["SUPER_ADMIN", "ADMIN"]
    }
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (401):**
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Refresh token không hợp lệ hoặc đã hết hạn",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 3. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout và invalidate refresh token

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
POST /api/auth/logout HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Đăng xuất thành công",
  "data": null,
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 4. Forgot Password (Send OTP)

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Gửi OTP qua email để reset password

**Request:**
```http
POST /api/auth/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "admin@orchard.com"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
  "data": {
    "email": "admin@orchard.com",
    "expiresIn": 300  // 5 minutes
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (404):**
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Email không tồn tại trong hệ thống",
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (429)** - Too many requests:
```json
{
  "status": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 5 phút.",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 5. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verify OTP code từ email

**Request:**
```http
POST /api/auth/verify-otp HTTP/1.1
Content-Type: application/json

{
  "email": "admin@orchard.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Xác thực OTP thành công",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIs...",  // Use this for reset password
    "email": "admin@orchard.com"
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (400)** - Invalid OTP:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Mã OTP không đúng",
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (410)** - OTP expired:
```json
{
  "status": 410,
  "error": "GONE",
  "message": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password với OTP token

**Request:**
```http
POST /api/auth/reset-password HTTP/1.1
Content-Type: application/json

{
  "resetToken": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
  "data": null,
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (400):**
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

## 👥 User Module APIs

### 1. List Users (with Pagination & Search)

**Endpoint:** `GET /api/admin/users`

**Description:** Lấy danh sách users với pagination và search

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (0-indexed), default: 0 |
| `size` | integer | No | Page size, default: 10 |
| `sort` | string | No | Sort field và direction, e.g., "createdAt,desc" |
| `keyword` | string | No | Search keyword (email, fullName, phone) |

**Request:**
```http
GET /api/admin/users?page=0&size=10&sort=createdAt,desc&keyword=john HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Lấy danh sách users thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "email": "admin@orchard.com",
        "fullName": "Administrator",
        "phone": "0900000000",
        "status": "ACTIVE",
        "roles": ["SUPER_ADMIN", "ADMIN"],
        "createdAt": "2024-01-01T00:00:00",
        "lastLogin": "2024-12-23T09:00:00"
      },
      {
        "id": 2,
        "email": "manager@orchard.com",
        "fullName": "Manager Name",
        "phone": "0901111111",
        "status": "ACTIVE",
        "roles": ["MANAGER"],
        "createdAt": "2024-01-02T00:00:00",
        "lastLogin": "2024-12-22T15:30:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 25,
    "totalPages": 3,
    "first": true,
    "last": false
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (403)** - No permission:
```json
{
  "status": 403,
  "error": "FORBIDDEN",
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 2. Get User Detail

**Endpoint:** `GET /api/admin/users/{id}`

**Description:** Lấy thông tin chi tiết của một user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
GET /api/admin/users/1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "email": "admin@orchard.com",
    "fullName": "Administrator",
    "phone": "0900000000",
    "status": "ACTIVE",
    "roles": ["SUPER_ADMIN", "ADMIN"],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-12-20T10:00:00",
    "lastLogin": "2024-12-23T09:00:00",
    "lastLoginIp": "192.168.1.100"
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (404):**
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy user với ID: 999",
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 3. Create User

**Endpoint:** `POST /api/admin/users`

**Description:** Tạo user mới (nhân viên/admin)

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
POST /api/admin/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "email": "staff@orchard.com",
  "password": "password123",
  "fullName": "Staff User",
  "phone": "0902222222",
  "roleIds": [4, 5],
  "status": "ACTIVE"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Email address (unique) |
| `password` | string | ✅ Yes | Password (min 6 characters) |
| `fullName` | string | ✅ Yes | Full name (max 255 chars) |
| `phone` | string | ❌ No | Phone number (10-15 digits) |
| `roleIds` | array | ✅ Yes | Array of role IDs (min 1 role) |
| `status` | string | ❌ No | ACTIVE, INACTIVE, BANNED, SUSPENDED (default: ACTIVE) |

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Tạo user thành công",
  "data": {
    "id": 10,
    "email": "staff@orchard.com",
    "fullName": "Staff User",
    "phone": "0902222222",
    "status": "ACTIVE",
    "roles": ["MANAGER", "STAFF"],
    "createdAt": "2024-12-23T10:30:00"
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (409 Conflict)** - Email đã tồn tại:
```json
{
  "status": 409,
  "error": "CONFLICT",
  "message": "Email đã tồn tại: staff@orchard.com",
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (409 Conflict)** - Phone đã tồn tại:
```json
{
  "status": 409,
  "error": "CONFLICT",
  "message": "Số điện thoại đã tồn tại: 0902222222",
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (400 Bad Request)** - Không có quyền gán role cao hơn:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Bạn không thể gán role có cấp bậc cao hơn hoặc ngang bằng mình. Role level: 10 >= Your level: 9",
  "timestamp": "2024-12-23T10:30:00"
}
```

**Error (422 Validation Error):**
```json
{
  "status": 422,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": "must be a well-formed email address",
    "password": "size must be between 6 and 255",
    "roleIds": "must not be empty"
  },
  "timestamp": "2024-12-23T10:30:00"
}
```

---

### 4. Update User

**Endpoint:** `PUT /api/admin/users/{id}`

**Description:** Cập nhật thông tin user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
PUT /api/admin/users/10 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "fullName": "Updated Staff Name",
  "phone": "0903333333",
  "roleIds": [4],
  "status": "ACTIVE"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ❌ No | Full name (max 255 chars) |
| `phone` | string | ❌ No | Phone number |
| `roleIds` | array | ❌ No | Array of role IDs (min 1 if provided) |
| `status` | string | ❌ No | ACTIVE, INACTIVE, BANNED, SUSPENDED |

**Notes:**
- Email và password KHÔNG thể update qua endpoint này
- Nếu tự update (self-edit):
  - ✅ Cho phép: `fullName`, `phone`
  - ❌ Chặn: `roleIds`, `status`

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Cập nhật user thành công",
  "data": {
    "id": 10,
    "email": "staff@orchard.com",
    "fullName": "Updated Staff Name",
    "phone": "0903333333",
    "status": "ACTIVE",
    "roles": ["MANAGER"],
    "updatedAt": "2024-12-23T10:35:00"
  },
  "timestamp": "2024-12-23T10:35:00"
}
```

**Error (400)** - Không có quyền chỉnh sửa:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình.",
  "timestamp": "2024-12-23T10:35:00"
}
```

**Error (400)** - Tự thay đổi role:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Bạn không thể tự thay đổi chức vụ của chính mình.",
  "timestamp": "2024-12-23T10:35:00"
}
```

**Error (404):**
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy user với ID: 999",
  "timestamp": "2024-12-23T10:35:00"
}
```

**Error (409)** - Phone conflict:
```json
{
  "status": 409,
  "error": "CONFLICT",
  "message": "Số điện thoại đã tồn tại: 0903333333",
  "timestamp": "2024-12-23T10:35:00"
}
```

---

### 5. Toggle User Status

**Endpoint:** `PUT /api/admin/users/{id}/toggle-status`

**Description:** Khóa/Mở khóa tài khoản user (ACTIVE ↔ INACTIVE)

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
PUT /api/admin/users/10/toggle-status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Toggle status thành công",
  "data": {
    "id": 10,
    "email": "staff@orchard.com",
    "fullName": "Staff User",
    "status": "INACTIVE",  // Changed from ACTIVE to INACTIVE
    "roles": ["MANAGER"],
    "updatedAt": "2024-12-23T10:40:00"
  },
  "timestamp": "2024-12-23T10:40:00"
}
```

**Logic:**
- ACTIVE → INACTIVE
- INACTIVE → ACTIVE
- BANNED → ACTIVE
- SUSPENDED → ACTIVE

**Error (400)** - Self-protection:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Bạn không thể tự khóa hoặc xóa tài khoản của chính mình",
  "timestamp": "2024-12-23T10:40:00"
}
```

**Error (400)** - Hierarchy protection:
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình.",
  "timestamp": "2024-12-23T10:40:00"
}
```

---

### 6. Reset User Password (Admin)

**Endpoint:** `POST /api/admin/users/{id}/reset-password`

**Description:** Admin reset password cho user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
POST /api/admin/users/10/reset-password HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "newPassword": "newPassword123"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Reset password thành công",
  "data": null,
  "timestamp": "2024-12-23T10:45:00"
}
```

**Error (404):**
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy user với ID: 999",
  "timestamp": "2024-12-23T10:45:00"
}
```

---

### 7. Get User Login History

**Endpoint:** `GET /api/admin/users/{id}/login-history`

**Description:** Lấy lịch sử đăng nhập của user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number, default: 0 |
| `size` | integer | No | Page size, default: 20 |

**Request:**
```http
GET /api/admin/users/1/login-history?page=0&size=20 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 100,
        "email": "admin@orchard.com",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "deviceType": "Desktop",
        "loginSuccessful": true,
        "failureReason": null,
        "loginAt": "2024-12-23T09:00:00"
      },
      {
        "id": 99,
        "email": "admin@orchard.com",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "deviceType": "Desktop",
        "loginSuccessful": false,
        "failureReason": "Invalid password",
        "loginAt": "2024-12-23T08:55:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "first": true,
    "last": false
  },
  "timestamp": "2024-12-23T10:50:00"
}
```

---

## 🔐 Role Management APIs

### 1. List Roles

**Endpoint:** `GET /api/admin/roles`

**Description:** Lấy danh sách tất cả roles

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```http
GET /api/admin/roles HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "roleCode": "SUPER_ADMIN",
      "roleName": "Super Administrator",
      "description": "Full system access with all permissions",
      "hierarchyLevel": 10,
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "roleCode": "ADMIN",
      "roleName": "Administrator",
      "description": "Full access to all modules except system settings",
      "hierarchyLevel": 9,
      "status": "ACTIVE"
    },
    {
      "id": 3,
      "roleCode": "MANAGER",
      "roleName": "Manager",
      "description": "Can manage products, orders, and view analytics",
      "hierarchyLevel": 7,
      "status": "ACTIVE"
    },
    {
      "id": 4,
      "roleCode": "STAFF",
      "roleName": "Staff",
      "description": "Can view and update orders, limited product access",
      "hierarchyLevel": 5,
      "status": "ACTIVE"
    },
    {
      "id": 5,
      "roleCode": "VIEWER",
      "roleName": "Viewer",
      "description": "Read-only access to all modules",
      "hierarchyLevel": 3,
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2024-12-23T10:55:00"
}
```

---

## ⚠️ Error Codes

### HTTP Status Codes

| Code | Error | Description | Example |
|------|-------|-------------|---------|
| **200** | OK | Success | User created successfully |
| **400** | BAD_REQUEST | Business logic error | Không có quyền chỉnh sửa, Tự thay đổi role |
| **401** | UNAUTHORIZED | Authentication failed | Email/password sai, Token hết hạn |
| **403** | FORBIDDEN | No permission | Không có quyền truy cập |
| **404** | NOT_FOUND | Resource not found | User với ID không tồn tại |
| **409** | CONFLICT | Data conflict | Email/phone đã tồn tại |
| **422** | VALIDATION_ERROR | Validation failed | Email không hợp lệ, password quá ngắn |
| **429** | TOO_MANY_REQUESTS | Rate limit exceeded | Quá nhiều OTP requests |
| **500** | INTERNAL_SERVER_ERROR | Server error | Lỗi hệ thống |

### Common Error Messages (Vietnamese)

**Authentication:**
- "Email hoặc mật khẩu không đúng"
- "Phiên đăng nhập hết hạn"
- "Token không hợp lệ"

**Authorization:**
- "Bạn không có quyền truy cập tài nguyên này"
- "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình"
- "Bạn không thể tự thay đổi chức vụ của chính mình"
- "Bạn không thể tự khóa hoặc xóa tài khoản của chính mình"

**Validation:**
- "Email không hợp lệ"
- "Mật khẩu phải có ít nhất 6 ký tự"
- "Phải chọn ít nhất một vai trò"

**Conflict:**
- "Email đã tồn tại: {email}"
- "Số điện thoại đã tồn tại: {phone}"

**Not Found:**
- "Không tìm thấy user với ID: {id}"
- "Không tìm thấy role với ID: {id}"

---

## 🎯 Common Patterns

### Pagination Request

```http
GET /api/admin/users?page=0&size=10&sort=createdAt,desc
```

**Parameters:**
- `page`: Page number (0-indexed)
- `size`: Items per page
- `sort`: Field name + direction (field,asc or field,desc)

### Pagination Response

```json
{
  "content": [...],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

### Search/Filter Pattern

```http
GET /api/admin/users?keyword=john&status=ACTIVE&page=0&size=10
```

**Search fields:**
- Email (LIKE %keyword%)
- Full Name (LIKE %keyword%)
- Phone (LIKE %keyword%)

---

## 🔒 Authorization Rules

### RBAC Hierarchy

```
Level 10 ─ SUPER_ADMIN  (Manage all)
Level  9 ─ ADMIN        (Manage level ≤ 8)
Level  7 ─ MANAGER      (Manage level ≤ 6)
Level  5 ─ STAFF        (Manage level ≤ 4)
Level  3 ─ VIEWER       (Read-only)
```

### Permission Matrix

| Action | SUPER_ADMIN | ADMIN | MANAGER | STAFF | VIEWER |
|--------|-------------|-------|---------|-------|--------|
| **Create User** | ✅ All roles | ✅ Level ≤ 8 | ✅ Level ≤ 6 | ✅ Level ≤ 4 | ❌ |
| **Update User** | ✅ All users | ✅ Level ≤ 8 | ✅ Level ≤ 6 | ✅ Level ≤ 4 | ❌ |
| **Update Self** | ✅ Name, Phone | ✅ Name, Phone | ✅ Name, Phone | ✅ Name, Phone | ✅ Name, Phone |
| **Delete User** | ✅ All (except self) | ✅ Level ≤ 8 | ✅ Level ≤ 6 | ✅ Level ≤ 4 | ❌ |
| **Toggle Status** | ✅ All (except self) | ✅ Level ≤ 8 | ✅ Level ≤ 6 | ✅ Level ≤ 4 | ❌ |
| **View Users** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Self-Edit Rules

**Allowed:**
- ✅ Update `fullName`
- ✅ Update `phone`

**Blocked:**
- ❌ Change own `roleIds`
- ❌ Change own `status`
- ❌ Delete self
- ❌ Toggle own status

---

## 📋 Request Examples (cURL)

### 1. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@orchard.com",
    "password": "admin123"
  }'
```

### 2. List Users

```bash
curl -X GET "http://localhost:8080/api/admin/users?page=0&size=10&keyword=john" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 3. Create User

```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@orchard.com",
    "password": "password123",
    "fullName": "Staff User",
    "phone": "0902222222",
    "roleIds": [4],
    "status": "ACTIVE"
  }'
```

### 4. Update User

```bash
curl -X PUT http://localhost:8080/api/admin/users/10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "phone": "0903333333",
    "roleIds": [4, 5]
  }'
```

### 5. Toggle Status

```bash
curl -X PUT http://localhost:8080/api/admin/users/10/toggle-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 🎓 Frontend Integration Examples

### Using Services + Hooks

```typescript
// 1. Service call
import { userService } from "@/services/user.service";

// Login
const response = await userService.login({ email, password });

// List users
const users = await userService.getUsers({ keyword: "john", page: 0, size: 10 });

// Create user
const newUser = await userService.createUser({
  email: "staff@orchard.com",
  password: "password123",
  fullName: "Staff User",
  roleIds: [4],
});

// 2. With React Query
const { data, isLoading } = useUsers({ keyword: "john" });

// 3. With useAppMutation
const mutation = useAppMutation({
  mutationFn: (data) => userService.createUser(data),
  queryKey: ["admin", "users"],
  setError: form.setError,
  successMessage: "User created!",
});

mutation.mutate(formData);
```

---

## 📊 API Testing (Postman/Thunder Client)

### Collection Structure

```
Orchard Store API/
├── Auth/
│   ├── Login
│   ├── Refresh Token
│   ├── Logout
│   ├── Forgot Password
│   ├── Verify OTP
│   └── Reset Password
└── Admin/
    └── Users/
        ├── List Users
        ├── Get User Detail
        ├── Create User
        ├── Update User
        ├── Toggle Status
        ├── Reset Password
        └── Login History
```

### Environment Variables

```
API_URL: http://localhost:8080
ACCESS_TOKEN: (auto-filled from login)
REFRESH_TOKEN: (auto-filled from login)
```

---

## 🔗 Related Documentation

- [BE_ARCHITECTURE.md](./BE_ARCHITECTURE.md) - Backend architecture
- [BE_DATABASE_SCHEMA.md](./BE_DATABASE_SCHEMA.md) - Database schema
- [FE_CODING_RULES.md](../frontend/FE_CODING_RULES.md#api-calls) - Frontend API patterns

---

## ✨ Summary

**APIs Documented:**
- ✅ Auth Module (6 endpoints)
- ✅ User Module (7 endpoints)
- ✅ Role Module (1 endpoint)

**Features:**
- ✅ Complete request/response examples
- ✅ Error codes & messages
- ✅ Authorization rules
- ✅ cURL examples
- ✅ Frontend integration examples

**Total:** 14 endpoints fully documented

---

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Maintainer:** Backend Team

