-- Migration: Add unit column to attribute_types table
-- Version: V13
-- Description: Thêm cột unit (Đơn vị tính) vào bảng attribute_types để hỗ trợ hiển thị đơn vị cho các giá trị thuộc tính

-- Thêm cột unit vào bảng attribute_types (tên thực tế trong database)
ALTER TABLE attribute_types
ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

-- Thêm comment cho cột
COMMENT ON COLUMN attribute_types.unit IS 'Đơn vị tính của thuộc tính (ví dụ: ml, g, %, kg, cm). Dùng để hiển thị kèm với giá trị thuộc tính.';

-- Tạo index cho cột unit (nếu cần tìm kiếm theo unit)
CREATE INDEX IF NOT EXISTS idx_attributes_unit ON attribute_types(unit) WHERE unit IS NOT NULL;

