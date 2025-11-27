-- 1. Thêm cột snapshot thuế vào order_items
ALTER TABLE order_items
ADD COLUMN tax_rate DECIMAL(5,2),
ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN tax_class_id BIGINT,
ADD COLUMN tax_class_name VARCHAR(100);

-- 2. Thêm cột JSONB để lưu cấu trúc thuế phức tạp vào orders
ALTER TABLE orders
ADD COLUMN tax_breakdown JSONB;

-- 3. Tạo Index & Constraints
CREATE INDEX idx_order_items_tax_rate ON order_items(tax_rate);
CREATE INDEX idx_order_items_tax_class ON order_items(tax_class_id);

-- Check constraints để đảm bảo data sạch
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
ADD CONSTRAINT chk_order_items_tax_amount CHECK (tax_amount >= 0);

-- 4. Comment
COMMENT ON COLUMN order_items.tax_rate IS 'Thuế suất tại thời điểm mua (Snapshot)';
COMMENT ON COLUMN orders.tax_breakdown IS 'Cấu trúc thuế chi tiết (JSON) tại thời điểm mua';

