# 🔐 RBAC Hierarchy Levels - Orchard Store

> **Role-Based Access Control với Hierarchy System**

---

## 📋 Tổng Quan

Hệ thống sử dụng **hierarchy_level** để xác định quyền hạn của từng role.

**Quy tắc:** Số càng lớn = Quyền càng cao

---

## 🎯 Hierarchy Levels

| Role Code     | Role Name           | Hierarchy Level | Mô tả                                      |
| ------------- | ------------------- | --------------- | ------------------------------------------ |
| `SUPER_ADMIN` | Super Administrator | 10              | Quyền cao nhất, toàn quyền hệ thống        |
| `ADMIN`       | Administrator       | 9               | Quản trị viên, quyền quản lý đầy đủ        |
| `MANAGER`     | Manager             | 7               | Quản lý, quyền quản lý sản phẩm & đơn hàng |
| `STAFF`       | Staff               | 5               | Nhân viên, quyền xem và cập nhật đơn hàng  |
| `VIEWER`      | Viewer              | 3               | Chỉ xem, quyền đọc dữ liệu                 |

---

## 🔒 Authorization Rules

### Basic Rules

1. **Higher level can manage lower level**

   ```
   Level 10 (SUPER_ADMIN) → Can manage all
   Level 9 (ADMIN) → Can manage level ≤ 8
   Level 7 (MANAGER) → Can manage level ≤ 6
   Level 5 (STAFF) → Can manage level ≤ 4
   ```

2. **Same level CANNOT manage each other**

   ```
   ADMIN (9) ❌ ADMIN (9)
   MANAGER (7) ❌ MANAGER (7)
   ```

3. **Self-edit exception (v0.2.0)**

   ```
   Users can edit themselves (limited fields):
   ✅ fullName
   ✅ phone
   ❌ roleIds (cannot change own roles)
   ❌ status (cannot lock themselves)
   ```

4. **Self-protection**
   ```
   ❌ Cannot delete self
   ❌ Cannot lock self (toggle status)
   ```

---

## 💻 Backend Implementation

### 1. Get Highest Hierarchy Level

```java
private Integer getHighestHierarchyLevel(User user) {
    if (user.getUserRoles() == null || user.getUserRoles().isEmpty()) {
        return 0; // No role = lowest level
    }

    return user.getUserRoles().stream()
        .filter(UserRole::getIsActive)
        .map(UserRole::getRole)
        .filter(role -> role != null && role.getHierarchyLevel() != null)
        .map(Role::getHierarchyLevel)
        .max(Integer::compareTo)  // Higher number = Higher permission
        .orElse(0);
}
```

### 2. Check Hierarchy Permission

```java
/**
 * Kiểm tra quyền phân cấp (Hierarchy Protection)
 *
 * Logic:
 * - Self-edit → Allow (limited fields)
 * - SUPER_ADMIN (level 10) → Allow
 * - currentUser.maxLevel > targetUser.maxLevel → Allow
 * - Else → Deny
 */
private void checkHierarchyPermission(User targetUser, User currentUser) {
    if (currentUser == null) {
        return;  // System call
    }

    // Self-edit exception
    if (currentUser.getId().equals(targetUser.getId())) {
        return;  // Allow (but check in updateUser for field restrictions)
    }

    Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);
    Integer targetUserMaxLevel = getHighestHierarchyLevel(targetUser);

    // SUPER_ADMIN always allowed
    if (currentUserMaxLevel >= 10) {
        return;
    }

    // Check: currentUser.maxLevel > targetUser.maxLevel
    if (currentUserMaxLevel > targetUserMaxLevel) {
        return;
    }

    // Deny
    throw new OperationNotPermittedException(
        "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình."
    );
}
```

### 3. Applied in Methods

**updateUser:**

```java
@Transactional
public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request) {
    User targetUser = userRepository.findById(id).orElseThrow();
    User currentUser = getCurrentUser();

    // 1. Check hierarchy permission
    checkHierarchyPermission(targetUser, currentUser);

    // 2. Check self-edit restrictions
    boolean isSelfEdit = currentUser.getId().equals(targetUser.getId());
    if (isSelfEdit) {
        // Block role change
        if (request.getRoleIds() != null && !currentRoleIds.equals(request.getRoleIds())) {
            throw new OperationNotPermittedException("Bạn không thể tự thay đổi chức vụ của chính mình.");
        }
        // Block status change
        // ... (only allow fullName, phone)
    }

    // 3. Update user
    // ...
}
```

**toggleUserStatus:**

```java
@Transactional
public UserResponseDTO toggleUserStatus(Long id) {
    User user = userRepository.findById(id).orElseThrow();

    // 1. Self-protection
    if (user.getEmail().equals(currentUserEmail)) {
        throw new OperationNotPermittedException("Bạn không thể tự khóa hoặc xóa tài khoản của chính mình");
    }

    // 2. Check hierarchy permission
    checkHierarchyPermission(user, getCurrentUser());

    // 3. Toggle
    // ...
}
```

**createUser:**

```java
@Transactional
public UserResponseDTO createUser(UserCreateRequestDTO request) {
    User currentUser = getCurrentUser();
    Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);

    // Check: Can't assign roles with level >= own level
    for (Role role : roles) {
        if (role.getHierarchyLevel() >= currentUserMaxLevel) {
            throw new OperationNotPermittedException(
                "Bạn không thể gán role có cấp bậc cao hơn hoặc ngang bằng mình."
            );
        }
    }

    // Create user
    // ...
}
```

---

## 🔧 Database Migration

### SQL Script

```sql
-- File: update_role_hierarchy_levels.sql

-- SUPER_ADMIN: Level 10 (Highest)
UPDATE roles
SET hierarchy_level = 10,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'SUPER_ADMIN';

-- ADMIN: Level 9
UPDATE roles
SET hierarchy_level = 9,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'ADMIN';

-- MANAGER: Level 7
UPDATE roles
SET hierarchy_level = 7,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'MANAGER';

-- STAFF: Level 5
UPDATE roles
SET hierarchy_level = 5,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'STAFF';

-- VIEWER: Level 3
UPDATE roles
SET hierarchy_level = 3,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'VIEWER';

-- Verify
SELECT
    role_code,
    role_name,
    hierarchy_level,
    status,
    updated_at
FROM roles
ORDER BY hierarchy_level DESC;
```

---

## 📊 Permission Matrix

### Who Can Manage Who?

| Current User         | Can Manage                         |
| -------------------- | ---------------------------------- |
| **SUPER_ADMIN (10)** | All users (except delete self)     |
| **ADMIN (9)**        | Level ≤ 8 (MANAGER, STAFF, VIEWER) |
| **MANAGER (7)**      | Level ≤ 6 (STAFF, VIEWER)          |
| **STAFF (5)**        | Level ≤ 4 (VIEWER)                 |
| **VIEWER (3)**       | None (read-only)                   |
| **Any user**         | Self (fullName, phone only)        |

### Actions Matrix

| Action            | SUPER_ADMIN       | ADMIN          | MANAGER        | STAFF          | VIEWER         |
| ----------------- | ----------------- | -------------- | -------------- | -------------- | -------------- |
| **Create User**   | ✅ All roles      | ✅ Roles ≤ 8   | ✅ Roles ≤ 6   | ✅ Roles ≤ 4   | ❌             |
| **Update User**   | ✅ All            | ✅ Level ≤ 8   | ✅ Level ≤ 6   | ✅ Level ≤ 4   | ❌             |
| **Update Self**   | ✅ Name, Phone    | ✅ Name, Phone | ✅ Name, Phone | ✅ Name, Phone | ✅ Name, Phone |
| **Toggle Status** | ✅ All (not self) | ✅ Level ≤ 8   | ✅ Level ≤ 6   | ✅ Level ≤ 4   | ❌             |
| **Delete User**   | ✅ All (not self) | ✅ Level ≤ 8   | ✅ Level ≤ 6   | ✅ Level ≤ 4   | ❌             |
| **View Users**    | ✅                | ✅             | ✅             | ✅             | ✅             |

---

## 🎯 Use Cases

### Case 1: ADMIN tries to update another ADMIN

```
Current: ADMIN (level 9)
Target: ADMIN (level 9)

currentUserMaxLevel (9) <= targetUserMaxLevel (9)
→ ❌ DENIED: "Bạn không có quyền chỉnh sửa thành viên có cấp bậc ngang bằng mình."
```

### Case 2: ADMIN tries to update MANAGER

```
Current: ADMIN (level 9)
Target: MANAGER (level 7)

currentUserMaxLevel (9) > targetUserMaxLevel (7)
→ ✅ ALLOWED
```

### Case 3: MANAGER tries to update self

```
Current: MANAGER (level 7)
Target: MANAGER (self, level 7)

currentUser.getId().equals(targetUser.getId())
→ ✅ ALLOWED (but only fullName, phone)
```

### Case 4: MANAGER tries to change own role

```
Current: MANAGER (level 7)
Target: MANAGER (self, level 7)
Action: Change roleIds

isSelfEdit = true
request.getRoleIds() != currentRoleIds
→ ❌ DENIED: "Bạn không thể tự thay đổi chức vụ của chính mình."
```

---

## 🔍 Verification

### Test Scenarios

**1. Test Hierarchy Protection:**

```sql
-- Login as MANAGER (level 7)
-- Try to update ADMIN (level 9)
PUT /api/admin/users/1 (ADMIN user)
→ Expected: 400 "Bạn không có quyền..."
```

**2. Test Self-Edit:**

```sql
-- Login as MANAGER (level 7)
-- Update own fullName
PUT /api/admin/users/{self-id}
Body: { "fullName": "New Name" }
→ Expected: 200 OK

-- Try to change own roles
PUT /api/admin/users/{self-id}
Body: { "roleIds": [1, 2] }
→ Expected: 400 "Bạn không thể tự thay đổi chức vụ..."
```

**3. Test Self-Protection:**

```sql
-- Login as ADMIN
-- Try to toggle own status
PUT /api/admin/users/{self-id}/toggle-status
→ Expected: 400 "Bạn không thể tự khóa tài khoản..."
```

---

## 📝 Notes

1. **After updating hierarchy levels**, restart backend for new logic to take effect
2. **Check existing data**: Ensure all roles have correct hierarchy_level before deploy
3. **Backward Compatibility**: Migrate data if there are old roles with different levels

---

## 🔗 Related Documentation

- [API Reference](./API_REFERENCE.md) - User Management APIs
- [Database Schema](./DATABASE.md) - RBAC tables
- [Architecture](./ARCHITECTURE.md) - Security implementation

---

**Last Updated:** December 2024  
**Version:** 0.2.0 (Added self-edit exception)  
**Maintainer:** Backend Team
