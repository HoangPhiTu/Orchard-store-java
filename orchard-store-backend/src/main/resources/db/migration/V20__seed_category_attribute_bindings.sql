-- V20__seed_category_attribute_bindings.sql
-- Bind the canonical Perfume / Cosmetics attribute sets to their categories
-- so that Product Form has meaningful defaults (fixing the "cold start" issue).

DO $$
BEGIN
    -- =========================================================================
    -- PERFUME CATEGORY BINDINGS (slug starts with 'nuoc-hoa')
    -- =========================================================================
    WITH perfume_categories AS (
        SELECT id FROM categories WHERE slug ILIKE 'nuoc-hoa%'
    ),
    perfume_attribute_config AS (
        SELECT *
        FROM (VALUES
            -- Display attributes
            ('nong_do',   FALSE, 10, 'Thông tin sản phẩm'),
            ('nhom_huong',FALSE, 20, 'Thông tin mùi hương'),
            ('huong_dau', FALSE, 30, 'Tầng hương'),
            ('huong_giua',FALSE, 40, 'Tầng hương'),
            ('huong_cuoi',FALSE, 50, 'Tầng hương'),
            ('gioi_tinh', FALSE, 60, 'Thông tin sản phẩm'),
            -- Variant-specific attributes
            ('dung_tich', TRUE,  100, 'Cấu hình biến thể'),
            ('loai_hang', FALSE, 110, 'Cấu hình biến thể')
        ) AS cfg(attribute_key, is_required, display_order, group_name)
    ),
    perfume_attributes AS (
        SELECT pa.id AS attribute_id,
               cfg.is_required,
               cfg.display_order,
               cfg.group_name
        FROM product_attributes pa
        JOIN perfume_attribute_config cfg ON cfg.attribute_key = pa.attribute_key
    )
    INSERT INTO category_attributes (category_id, attribute_id, is_required, display_order, group_name)
    SELECT c.id,
           a.attribute_id,
           a.is_required,
           a.display_order,
           a.group_name
    FROM perfume_categories c
    CROSS JOIN perfume_attributes a
    ON CONFLICT (category_id, attribute_id) DO UPDATE
        SET is_required = EXCLUDED.is_required,
            display_order = EXCLUDED.display_order,
            group_name = EXCLUDED.group_name;

    RAISE NOTICE 'Perfume attribute bindings applied to % categories', (SELECT COUNT(*) FROM perfume_categories);

    -- =========================================================================
    -- COSMETICS CATEGORY BINDINGS (slug starts with 'my-pham')
    -- =========================================================================
    WITH cosmetics_categories AS (
        SELECT id FROM categories WHERE slug ILIKE 'my-pham%'
    ),
    cosmetics_attribute_config AS (
        SELECT *
        FROM (VALUES
            -- Display attributes
            ('gioi_tinh', FALSE, 10, 'Thông tin sản phẩm'),
            ('loai_da',   FALSE, 20, 'Thông tin làn da'),
            -- Variant-specific attributes
            ('mau_sac',   TRUE,  100, 'Cấu hình biến thể')
        ) AS cfg(attribute_key, is_required, display_order, group_name)
    ),
    cosmetics_attributes AS (
        SELECT pa.id AS attribute_id,
               cfg.is_required,
               cfg.display_order,
               cfg.group_name
        FROM product_attributes pa
        JOIN cosmetics_attribute_config cfg ON cfg.attribute_key = pa.attribute_key
    )
    INSERT INTO category_attributes (category_id, attribute_id, is_required, display_order, group_name)
    SELECT c.id,
           a.attribute_id,
           a.is_required,
           a.display_order,
           a.group_name
    FROM cosmetics_categories c
    CROSS JOIN cosmetics_attributes a
    ON CONFLICT (category_id, attribute_id) DO UPDATE
        SET is_required = EXCLUDED.is_required,
            display_order = EXCLUDED.display_order,
            group_name = EXCLUDED.group_name;

    RAISE NOTICE 'Cosmetics attribute bindings applied to % categories', (SELECT COUNT(*) FROM cosmetics_categories);
END $$;

