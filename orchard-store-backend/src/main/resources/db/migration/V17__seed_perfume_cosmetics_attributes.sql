-- V17__seed_perfume_cosmetics_attributes.sql
-- Seed bộ thuộc tính chuẩn cho NƯỚC HOA (PERFUME) và MỸ PHẨM (COSMETICS)
-- Sử dụng bảng:
--   - attribute_types  (metadata thuộc tính, map với entity ProductAttribute)
--   - attribute_options (giá trị chọn cho từng thuộc tính, map với entity AttributeValue)
--
-- Lưu ý:
-- - Dùng ON CONFLICT DO NOTHING để tránh lỗi khi migration chạy nhiều lần.
-- - Dùng attribute_key làm mã duy nhất cho từng thuộc tính.

-- ============================================================================
-- 1. NƯỚC HOA (PERFUME)
-- ============================================================================

-- 1.1 Nồng độ (Concentration)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'nong_do',
    'Nồng độ',
    'SELECT',
    'STRING',
    'PERFUME',
    TRUE,   -- filterable: dùng cho bộ lọc
    TRUE,   -- searchable
    FALSE,  -- không phải variant-specific
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị cho Nồng độ
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'EDP', 'EDP', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nong_do'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'EDT', 'EDT', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nong_do'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'PARFUM', 'Parfum', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nong_do'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'COLOGNE', 'Cologne', 3, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nong_do'
ON CONFLICT DO NOTHING;


-- 1.2 Nhóm hương (Scent Family)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'nhom_huong',
    'Nhóm hương',
    'SELECT',
    'STRING',
    'PERFUME',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị cho Nhóm hương
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'FLORAL', 'Floral (Hương Hoa)', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nhom_huong'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'WOODY', 'Woody (Hương Gỗ)', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nhom_huong'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'ORIENTAL', 'Oriental (Phương Đông)', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nhom_huong'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'FRESH', 'Fresh (Tươi mát)', 3, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'nhom_huong'
ON CONFLICT DO NOTHING;


-- 1.3 Tầng hương (Scent Pyramid) – dùng MULTISELECT, không filter

-- Hương đầu (Top Notes)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'huong_dau',
    'Hương đầu',
    'MULTISELECT',
    'STRING',
    'PERFUME',
    FALSE,
    TRUE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Hương giữa (Middle Notes)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'huong_giua',
    'Hương giữa',
    'MULTISELECT',
    'STRING',
    'PERFUME',
    FALSE,
    TRUE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Hương cuối (Base Notes)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'huong_cuoi',
    'Hương cuối',
    'MULTISELECT',
    'STRING',
    'PERFUME',
    FALSE,
    TRUE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- (Không seed sẵn values cho các tầng hương, vì thường rất phong phú và thay đổi theo từng sản phẩm)


-- 1.4 Dung tích (Volume) – Variant Specific
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'dung_tich',
    'Dung tích',
    'SELECT',
    'NUMBER',
    'PERFUME',
    TRUE,
    FALSE,
    TRUE,
    'ml',
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị cho Dung tích (10, 30, 50, 100, 200 ml)
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, '10', '10 ml', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'dung_tich'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, '30', '30 ml', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'dung_tich'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, '50', '50 ml', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'dung_tich'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, '100', '100 ml', 3, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'dung_tich'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, '200', '200 ml', 4, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'dung_tich'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2. MỸ PHẨM (COSMETICS)
-- ============================================================================

-- 2.1 Màu sắc (Color) – Variant Specific + Swatch
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'mau_sac',
    'Màu sắc',
    'SELECT',
    'STRING',
    'COSMETICS',
    TRUE,
    TRUE,
    TRUE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị mẫu cho Màu sắc (Color Swatches)
INSERT INTO attribute_options (attribute_type_id, value, display_value, hex_color, display_order, is_default)
SELECT at.id, 'do_thuan', 'Đỏ Thuần', '#FF0000', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'mau_sac'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, hex_color, display_order, is_default)
SELECT at.id, 'cam_dat', 'Cam Đất', '#CC5500', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'mau_sac'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, hex_color, display_order, is_default)
SELECT at.id, 'hong_nude', 'Hồng Nude', '#FFC0CB', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'mau_sac'
ON CONFLICT DO NOTHING;


-- 2.2 Loại da (Skin Type) – MULTISELECT, filterable
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'loai_da',
    'Loại da',
    'MULTISELECT',
    'STRING',
    'COSMETICS',
    TRUE,
    FALSE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị cho Loại da
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'da_dau', 'Da dầu', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_da'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'da_kho', 'Da khô', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_da'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'da_hon_hop', 'Da hỗn hợp', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_da'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'da_nhay_cam', 'Da nhạy cảm', 3, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_da'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 3. THUỘC TÍNH CHUNG (COMMON)
-- ============================================================================

-- 3.1 Giới tính (Gender)
INSERT INTO attribute_types (
    attribute_key,
    attribute_name,
    attribute_type,
    data_type,
    domain,
    is_filterable,
    is_searchable,
    is_variant_specific,
    unit,
    status
)
VALUES (
    'gioi_tinh',
    'Giới tính',
    'SELECT',
    'STRING',
    'COMMON',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    'ACTIVE'
)
ON CONFLICT (attribute_key) DO UPDATE SET
    attribute_name        = EXCLUDED.attribute_name,
    attribute_type        = EXCLUDED.attribute_type,
    data_type             = EXCLUDED.data_type,
    domain                = EXCLUDED.domain,
    is_filterable         = EXCLUDED.is_filterable,
    is_searchable         = EXCLUDED.is_searchable,
    is_variant_specific   = EXCLUDED.is_variant_specific,
    unit                  = EXCLUDED.unit,
    status                = EXCLUDED.status;

-- Giá trị cho Giới tính
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'nam', 'Nam', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'gioi_tinh'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'nu', 'Nữ', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'gioi_tinh'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'unisex', 'Unisex', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'gioi_tinh'
ON CONFLICT DO NOTHING;

-- (Optional) Seed mẫu vài nốt hương phổ biến để test UI Multi-Select
-- Hương đầu
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'cam-bergamot', 'Cam Bergamot', 0, FALSE FROM attribute_types WHERE attribute_key = 'huong_dau'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'chanh-vang', 'Chanh vàng', 1, FALSE FROM attribute_types WHERE attribute_key = 'huong_dau'
ON CONFLICT DO NOTHING;

-- Hương giữa
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'hoa-hong', 'Hoa hồng (Rose)', 0, FALSE FROM attribute_types WHERE attribute_key = 'huong_giua'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'hoa-nhai', 'Hoa nhài (Jasmine)', 1, FALSE FROM attribute_types WHERE attribute_key = 'huong_giua'
ON CONFLICT DO NOTHING;

-- Hương cuối
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'xa-huong', 'Xạ hương (Musk)', 0, FALSE FROM attribute_types WHERE attribute_key = 'huong_cuoi'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT id, 'vani', 'Vani (Vanilla)', 1, FALSE FROM attribute_types WHERE attribute_key = 'huong_cuoi'
ON CONFLICT DO NOTHING;