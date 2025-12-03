-- V14__add_domain_to_attribute_types.sql
-- Thêm cột domain để phân loại Thuộc tính theo domain (PERFUME / COSMETICS / COMMON ...)

ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS domain VARCHAR(50);

COMMENT ON COLUMN attribute_types.domain IS 'Phạm vi sử dụng của thuộc tính (ví dụ: PERFUME, COSMETICS, COMMON). Dùng để tách Thuộc tính Nước hoa và Mỹ phẩm trong Admin.';


