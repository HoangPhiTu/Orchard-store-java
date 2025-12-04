-- V18__prepare_migrate_concentration_to_attribute.sql
-- Mục tiêu:
-- 1) Chuẩn hóa dữ liệu Nồng độ (Concentration) về Attribute 'nong_do' (PERFUME).
-- 2) Hỗ trợ giai đoạn chuyển đổi trước khi xoá hẳn module concentrations.
--
-- Lưu ý:
-- - Script này ĐANG để ở trạng thái chuẩn bị (có thể giữ comment / chỉ chạy một phần tuỳ môi trường).
-- - Cần review dữ liệu thực tế (bảng concentrations, product_variants) trước khi bật migrate cứng.

-- =====================================================================
-- 1. Map bảng concentrations -> attribute_options của attribute 'nong_do'
-- =====================================================================

-- Ví dụ gợi ý (COMMENT LẠI nếu chưa muốn chạy tự động):
-- Chỉ map các concentration đang ACTIVE, tránh trùng key với các value đã seed sẵn (EDP/EDT/Parfum/Cologne).
-- Có thể cần logic map riêng theo slug/name thực tế.

-- INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
-- SELECT
--     at.id AS attribute_type_id,
--     LOWER(REPLACE(c.slug, '-', '_')) AS value,
--     c.name AS display_value,
--     COALESCE(c.display_order, 0) AS display_order,
--     FALSE AS is_default
-- FROM concentrations c
-- CROSS JOIN attribute_types at
-- WHERE at.attribute_key = 'nong_do'
--   AND c.status = 'ACTIVE'
--   AND NOT EXISTS (
--       SELECT 1
--       FROM attribute_options ao
--       WHERE ao.attribute_type_id = at.id
--         AND ao.value = LOWER(REPLACE(c.slug, '-', '_'))
--   );


-- =====================================================================
-- 2. Gợi ý migrate product_variants.concentration_code -> product_attribute_values
-- =====================================================================

-- Cấu trúc bảng gốc (xem V1__init_schema.sql):
-- - product_variants.concentration_code (VARCHAR)
-- - product_attribute_values(product_id, product_variant_id, attribute_value_id, is_primary, ...)
-- - attribute_types(attribute_key = 'nong_do')
-- - attribute_options(value = 'EDP' / 'EDT' / ...)

-- Ví dụ gợi ý migrate (CẦN REVIEW TRƯỚC KHI BẬT):

-- INSERT INTO product_attribute_values (
--     product_id,
--     product_variant_id,
--     attribute_value_id,
--     is_primary,
--     created_at
-- )
-- SELECT
--     v.product_id,
--     v.id AS product_variant_id,
--     ao.id AS attribute_value_id,
--     TRUE AS is_primary,
--     NOW() AS created_at
-- FROM product_variants v
-- JOIN attribute_types at
--     ON at.attribute_key = 'nong_do'
-- JOIN attribute_options ao
--     ON ao.attribute_type_id = at.id
--    AND UPPER(ao.value) = UPPER(v.concentration_code)
-- WHERE v.concentration_code IS NOT NULL
--   AND NOT EXISTS (
--       SELECT 1
--       FROM product_attribute_values pav
--       WHERE pav.product_variant_id = v.id
--         AND pav.attribute_value_id = ao.id
--   );


-- =====================================================================
-- 3. (Tương lai) Dọn schema Concentration (CHƯA CHẠY BÂY GIỜ)
-- =====================================================================

-- Sau khi:
-- - FE/BE KHÔNG dùng concentration_id & concentration_code nữa
-- - Dữ liệu nồng độ đã migrate xong sang Attribute System
-- => Có thể bật các lệnh dưới đây (hiện đang comment):

-- ALTER TABLE product_variants
--     DROP CONSTRAINT IF EXISTS fk_variants_concentration;
--
-- ALTER TABLE product_variants
--     DROP COLUMN IF EXISTS concentration_id,
--     DROP COLUMN IF EXISTS concentration_code;
--
-- DROP TABLE IF EXISTS concentrations;


