-- V11__optimize_user_search_indexes.sql
-- Tối ưu hiệu năng truy vấn cho trang Admin Users
-- - Hỗ trợ tìm kiếm theo email / full_name / phone (LOWER(... ) LIKE ...)
-- - Hỗ trợ sắp xếp theo created_at DESC

-- ⚠️ Lưu ý:
-- - Các index này an toàn để chạy nhiều lần (IF NOT EXISTS chỉ hỗ trợ từ PG 9.5+).
-- - Supabase/PostgreSQL 16 hỗ trợ cú pháp này.

-- Index cho tìm kiếm theo email (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email_lower
    ON users (LOWER(email));

-- Index cho tìm kiếm theo full_name (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_full_name_lower
    ON users (LOWER(full_name));

-- Index cho tìm kiếm theo phone (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_phone_lower
    ON users (LOWER(phone));

-- Index tổng hợp cho lọc theo status + sắp xếp created_at DESC
CREATE INDEX IF NOT EXISTS idx_users_status_created_at_desc
    ON users (status, created_at DESC);


