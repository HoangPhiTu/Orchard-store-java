-- 1. Bảng ShedLock
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL PRIMARY KEY,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL
);

-- 2. Constraints cho Warehouse Stock
ALTER TABLE warehouse_stock
ADD CONSTRAINT chk_warehouse_stock_quantity CHECK (quantity >= 0),
ADD CONSTRAINT chk_warehouse_stock_reserved CHECK (reserved_quantity <= quantity);

-- 3. Bảng Stock Reservations
CREATE TABLE stock_reservations (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN ('CART', 'CHECKOUT', 'ORDER')),
    reference_id BIGINT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONSUMED', 'RELEASED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, warehouse_id, reference_id, reservation_type),
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_stock_reservations_variant ON stock_reservations(product_variant_id, warehouse_id);
CREATE INDEX idx_stock_reservations_expires ON stock_reservations(expires_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_stock_reservations_reference ON stock_reservations(reference_id, reservation_type);
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);

-- 4. Trigger Sync (Phiên bản hoàn thiện nhất)
CREATE OR REPLACE FUNCTION sync_reserved_quantity_to_warehouse_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Trường hợp 1: Tạo mới Reservation
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE warehouse_stock
        SET reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
        WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;
    
    -- Trường hợp 2: Update trạng thái hoặc số lượng
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reservation hết hạn hoặc được giải phóng -> Trừ reserved_quantity
        IF OLD.status = 'ACTIVE' AND NEW.status IN ('EXPIRED', 'RELEASED', 'CONSUMED') THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
            WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;
        
        -- Thay đổi số lượng reservation khi đang ACTIVE (hiếm gặp nhưng cần xử lý)
        ELSIF OLD.status = 'ACTIVE' AND NEW.status = 'ACTIVE' AND OLD.quantity != NEW.quantity THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity + NEW.quantity, 0)
            WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;
        END IF;
    -- Trường hợp 3: Xóa Reservation (DELETE) -> Trừ reserved_quantity
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        UPDATE warehouse_stock
        SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
        WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_reserved_quantity
AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
FOR EACH ROW
EXECUTE FUNCTION sync_reserved_quantity_to_warehouse_stock();


