-- V16__update_schema_for_perfume_cosmetics.sql
-- Mục tiêu:
-- 1. Thêm support cho ảnh riêng trên từng Product Variant (phục vụ Mỹ phẩm / Swatch màu).
-- 2. Đảm bảo có cột is_filterable trên attribute_types để đánh dấu các thuộc tính dùng cho bộ lọc.
-- 3. Đảm bảo GIN index cho cached_attributes (nếu môi trường cũ chưa có).

-- ============================================================================
-- 1. PRODUCT_VARIANTS: Thêm cột image_url
-- ============================================================================

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMENT ON COLUMN product_variants.image_url IS
'Ảnh riêng cho từng biến thể (ví dụ: màu son, texture phấn). Nếu NULL, FE có thể fallback về ảnh chính của Product.';

-- Đảm bảo GIN index cho cached_attributes (trong trường hợp một số môi trường chưa có)
CREATE INDEX IF NOT EXISTS idx_variants_cached_attributes_gin
ON product_variants USING GIN (cached_attributes);


-- ============================================================================
-- 2. ATTRIBUTE_TYPES: Thêm cột is_filterable (Facet Filters)
-- ============================================================================

-- Lưu ý:
-- - Bảng metadata thuộc tính hiện tại là attribute_types (được map với entity ProductAttribute).
-- - V1__init_schema.sql tạo product_attributes với is_filterable.
-- - Các migration sau đã chuyển sang dùng attribute_types.
-- - Ở đây ta đảm bảo attribute_types có cột is_filterable để dùng cho Filter Sidebar.

ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS is_filterable BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN attribute_types.is_filterable IS
'Đánh dấu thuộc tính được dùng cho bộ lọc (Facet Filter) ở Sidebar. TRUE = hiển thị trong bộ lọc, FALSE = chỉ dùng để hiển thị mô tả sản phẩm.';


-- ============================================================================
-- 3. ATTRIBUTE_VALUES: Đảm bảo schema hỗ trợ Swatch màu
-- ============================================================================

-- Bảng attribute_values trong V1 đã có:
-- - hex_color VARCHAR(7)
-- - image_url VARCHAR(500)
-- nên không cần thêm cột mới. Phần này chỉ ghi chú để tham chiếu từ tài liệu.

-- Ví dụ (chỉ là comment, KHÔNG thực thi):
-- ALTER TABLE attribute_values
-- ADD COLUMN IF NOT EXISTS hex_color VARCHAR(7);
-- ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);


-- ============================================================================
-- 4. PRODUCTS: GIN index cho attributes (KHÔNG ÁP DỤNG HIỆN TẠI)
-- ============================================================================

-- Hiện tại bảng products KHÔNG lưu JSONB attributes riêng (chỉ product_variants.cached_attributes).
-- Do đó, chưa cần tạo GIN index trên products.
-- Nếu sau này thêm cột products.attributes (JSONB), có thể bổ sung:
--
-- ALTER TABLE products
-- ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;
--
-- CREATE INDEX IF NOT EXISTS idx_products_attributes_gin
-- ON products USING GIN (attributes);



