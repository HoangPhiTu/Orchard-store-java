-- 1. Tạo Sequence (QUAN TRỌNG: Phải tạo trước bảng)
CREATE SEQUENCE refund_number_seq START 1;

-- 2. Bảng Refunds
CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_id BIGINT,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('FULL', 'PARTIAL', 'ITEM')),
    total_refund_amount DECIMAL(15,2) NOT NULL,
    refund_reason VARCHAR(100),
    refund_notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),
    processed_by BIGINT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- 3. Bảng Refund Items
CREATE TABLE refund_items (
    id BIGSERIAL PRIMARY KEY,
    refund_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    refund_amount DECIMAL(15,2) NOT NULL,
    restocked BOOLEAN DEFAULT FALSE,
    restocked_at TIMESTAMP,
    restocked_warehouse_id BIGINT,
    reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (restocked_warehouse_id) REFERENCES warehouses(id)
);

-- 4. Indexes & Constraints (Đã bổ sung từ Review)
CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_refund_number ON refunds(refund_number);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refund_items_refund ON refund_items(refund_id);
CREATE INDEX idx_refund_items_restocked ON refund_items(restocked) WHERE restocked = false;

ALTER TABLE refund_items
ADD CONSTRAINT chk_refund_items_quantity CHECK (quantity > 0),
ADD CONSTRAINT chk_refund_items_refund_amount CHECK (refund_amount >= 0);

