-- ====================================================
-- Script: Cập nhật Hierarchy Levels cho các Roles
-- Mục đích: Chuẩn hóa hierarchy_level theo quy tắc:
--   Số càng lớn = Quyền càng cao
-- ====================================================

-- SUPER_ADMIN: Level 10 (Cao nhất)
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

-- ====================================================
-- Kiểm tra kết quả
-- ====================================================
SELECT 
    role_code,
    role_name,
    hierarchy_level,
    status,
    updated_at
FROM roles
ORDER BY hierarchy_level DESC;


