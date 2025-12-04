-- V19__seed_perfume_package_type_attribute.sql
-- Seed Attribute 'loai_hang' (Quy cách: Fullbox, Tester, Chiết) cho domain PERFUME
-- - Dùng cho Variant (is_variant_specific = TRUE)
-- - Dùng được trong bộ lọc Sidebar (is_filterable = TRUE)
-- - Mapping với entity ProductAttribute (bảng attribute_types) và AttributeValue (bảng attribute_options)

-- ============================================================================
-- 1. Thuộc tính 'loai_hang' (Quy cách)
-- ============================================================================

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
    'loai_hang',
    'Loại hàng',
    'SELECT',
    'STRING',
    'PERFUME',
    TRUE,   -- filterable trên Sidebar
    FALSE,  -- không cần full-text search riêng
    TRUE,   -- variant-specific: dùng để sinh biến thể
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


-- ============================================================================
-- 2. Giá trị chuẩn cho 'loai_hang'
-- ============================================================================

-- Fullbox
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'fullbox', 'Fullbox', 0, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_hang'
ON CONFLICT DO NOTHING;

-- Tester
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'tester', 'Tester', 1, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_hang'
ON CONFLICT DO NOTHING;

-- Chiết
INSERT INTO attribute_options (attribute_type_id, value, display_value, display_order, is_default)
SELECT at.id, 'chiet', 'Chiết', 2, FALSE
FROM attribute_types at
WHERE at.attribute_key = 'loai_hang'
ON CONFLICT DO NOTHING;


