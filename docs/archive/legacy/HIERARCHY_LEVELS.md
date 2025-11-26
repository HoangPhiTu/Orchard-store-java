# Cấu hình Hierarchy Levels cho Roles

## 📋 Tổng Quan

Hệ thống sử dụng **hierarchy_level** để xác định quyền hạn của từng role. Quy tắc:

- **Số càng lớn = Quyền càng cao**

## 🎯 Hierarchy Levels

| Role Code   | Role Name           | Hierarchy Level | Mô tả                                      |
| ----------- | ------------------- | --------------- | ------------------------------------------ |
| SUPER_ADMIN | Super Administrator | 10              | Quyền cao nhất, toàn quyền hệ thống        |
| ADMIN       | Administrator       | 8               | Quản trị viên, quyền quản lý đầy đủ        |
| MANAGER     | Manager             | 6               | Quản lý, quyền quản lý sản phẩm & đơn hàng |
| STAFF       | Staff               | 4               | Nhân viên, quyền xem và cập nhật đơn hàng  |
| VIEWER      | Viewer              | 2               | Chỉ xem, quyền đọc dữ liệu                 |

## 🔧 Cập Nhật Hierarchy Levels

### Cách 1: Chạy SQL Script (Khuyến nghị)

Chạy file SQL trong pgAdmin hoặc PostgreSQL console:

```sql
-- File: src/main/resources/db/migration/update_role_hierarchy_levels.sql

-- SUPER_ADMIN: Level 10
UPDATE roles
SET hierarchy_level = 10,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'SUPER_ADMIN';

-- ADMIN: Level 8
UPDATE roles
SET hierarchy_level = 8,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'ADMIN';

-- MANAGER: Level 6
UPDATE roles
SET hierarchy_level = 6,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'MANAGER';

-- STAFF: Level 4
UPDATE roles
SET hierarchy_level = 4,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'STAFF';

-- VIEWER: Level 2
UPDATE roles
SET hierarchy_level = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE role_code = 'VIEWER';
```

### Cách 2: Tự động qua DataInitializer

Khi backend khởi động, `DataInitializer.java` sẽ tự động tạo các roles với hierarchy levels đúng nếu chưa tồn tại.

## 🔍 Kiểm Tra Kết Quả

Sau khi cập nhật, chạy query sau để kiểm tra:

```sql
SELECT
    role_code,
    role_name,
    hierarchy_level,
    status,
    updated_at
FROM roles
ORDER BY hierarchy_level DESC;
```

Kết quả mong đợi:

```
role_code   | role_name          | hierarchy_level | status | updated_at
------------|--------------------|-----------------|--------|------------
SUPER_ADMIN | Super Administrator| 10              | ACTIVE | ...
ADMIN       | Administrator      | 8               | ACTIVE | ...
MANAGER     | Manager            | 6               | ACTIVE | ...
STAFF       | Staff              | 4               | ACTIVE | ...
VIEWER      | Viewer             | 2               | ACTIVE | ...
```

## ⚙️ Logic So Sánh trong Backend

### UserAdminServiceImpl.java

**1. Lấy hierarchy level cao nhất của user:**

```java
private Integer getHighestHierarchyLevel(User user) {
    // Trả về số lớn nhất (vì số lớn hơn = quyền cao hơn)
    return user.getUserRoles().stream()
        .filter(UserRole::getIsActive)
        .map(UserRole::getRole)
        .map(Role::getHierarchyLevel)
        .max(Integer::compareTo) // Số lớn hơn = quyền cao hơn
        .orElse(0);
}
```

**2. Helper Method "Gác cổng" - `checkHierarchyPermission(User targetUser)`:**

```java
/**
 * Kiểm tra quyền phân cấp (Hierarchy Protection) - "Gác cổng"
 *
 * Logic:
 * - SUPER_ADMIN (level 10) luôn được phép (trừ khi xóa chính mình)
 * - Nếu currentUser.maxLevel <= targetUser.maxLevel -> Không có quyền
 */
private void checkHierarchyPermission(User targetUser) {
    User currentUser = getCurrentUser();
    if (currentUser == null) return;

    Integer currentUserMaxLevel = getHighestHierarchyLevel(currentUser);
    Integer targetUserMaxLevel = getHighestHierarchyLevel(targetUser);

    // SUPER_ADMIN (level 10) luôn được phép
    if (currentUserMaxLevel >= 10) {
        return;
    }

    // Kiểm tra: Nếu currentUser.maxLevel <= targetUser.maxLevel -> Không có quyền
    if (currentUserMaxLevel <= targetUserMaxLevel) {
        throw new OperationNotPermittedException(
            "Bạn không có quyền chỉnh sửa thành viên có cấp bậc cao hơn hoặc ngang bằng mình."
        );
    }
}
```

**3. Áp dụng vào các method:**

- **`updateUser`**: Gọi `checkHierarchyPermission(targetUser)` ở dòng đầu tiên
- **`toggleUserStatus`**: Gọi `checkHierarchyPermission(user)` sau khi kiểm tra self-protection
- **`createUser`**: Kiểm tra nếu đang cố gán role có `level >= currentUser.maxLevel` → Chặn

**4. Kiểm tra gán role trong Update:**

```java
// Không cho phép gán role có quyền cao hơn (level lớn hơn) cho user
if (newRole.getHierarchyLevel() > targetUserCurrentLevel) {
    throw new OperationNotPermittedException(...);
}
```

## 📝 Lưu Ý

1. **Sau khi cập nhật hierarchy levels**, cần restart backend để logic mới có hiệu lực.
2. **Kiểm tra dữ liệu hiện tại**: Đảm bảo tất cả roles đã có hierarchy_level đúng trước khi deploy.
3. **Backward Compatibility**: Nếu có roles cũ với hierarchy_level khác, cần migrate dữ liệu trước.

## 🚀 Deployment Checklist

- [ ] Chạy SQL script để cập nhật hierarchy levels
- [ ] Kiểm tra kết quả bằng SELECT query
- [ ] Restart backend application
- [ ] Test logic phân quyền (update user, assign roles)
- [ ] Verify error messages hiển thị đúng
