# 🔍 Migration Scripts Review (V4-V8)

**Ngày review:** 2024  
**Reviewer:** AI Assistant  
**Status:** ⚠️ Cần sửa một số vấn đề

---

## 📋 Tổng quan

Đã review 5 migration scripts (V4-V8) theo roadmap. Tổng cộng có **8 vấn đề cần sửa** và **5 đề xuất cải thiện**.

---

## ✅ V4: Tax Snapshot - **OK với một số đề xuất**

### ✅ Đúng:
- Thêm đúng các cột vào `order_items` và `orders`
- Indexes hợp lý cho reporting
- Comments rõ ràng

### ⚠️ Đề xuất cải thiện:

#### 1. **Thêm CHECK constraint cho tax_rate**
```sql
-- Thêm vào V4
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100);
```

#### 2. **Thêm CHECK constraint cho tax_amount**
```sql
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_tax_amount CHECK (tax_amount >= 0);
```

#### 3. **Thêm index composite cho reporting**
```sql
-- Hỗ trợ query: "Tổng thuế theo tax_class trong khoảng thời gian"
CREATE INDEX idx_order_items_tax_class_date ON order_items(tax_class_id, created_at);
```

---

## ⚠️ V5: Refunds & Sequence - **CẦN SỬA**

### ❌ Vấn đề 1: Thiếu Sequence trong script
**Script hiện tại:** Có tạo `refund_number_seq` ✅  
**Nhưng:** Cần đảm bảo sequence được tạo TRƯỚC khi tạo bảng `refunds`

**Sửa:**
```sql
-- Di chuyển CREATE SEQUENCE lên đầu file (trước CREATE TABLE refunds)
CREATE SEQUENCE refund_number_seq START 1;
```

### ❌ Vấn đề 2: Thiếu index cho refund_number
**Script hiện tại:** Không có index cho `refund_number`  
**Impact:** Query tìm refund theo số sẽ chậm

**Sửa:**
```sql
-- Thêm vào V5
CREATE INDEX idx_refunds_refund_number ON refunds(refund_number);
```

### ❌ Vấn đề 3: Thiếu index cho status
**Script hiện tại:** Không có index cho `refunds.status`  
**Impact:** Filter refunds theo status sẽ chậm

**Sửa:**
```sql
-- Thêm vào V5
CREATE INDEX idx_refunds_status ON refunds(status);
```

### ❌ Vấn đề 4: Thiếu index cho payment_id
**Script hiện tại:** Không có index cho `refunds.payment_id`  
**Impact:** Join với payments sẽ chậm

**Sửa:**
```sql
-- Thêm vào V5
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
```

### ⚠️ Đề xuất cải thiện:

#### 1. **Thêm CHECK constraint cho quantity**
```sql
ALTER TABLE refund_items
ADD CONSTRAINT chk_refund_items_quantity CHECK (quantity > 0);
```

#### 2. **Thêm CHECK constraint cho refund_amount**
```sql
ALTER TABLE refund_items
ADD CONSTRAINT chk_refund_items_refund_amount CHECK (refund_amount >= 0);
```

#### 3. **Thêm index cho restocked (để tìm items chưa restock)**
```sql
CREATE INDEX idx_refund_items_restocked ON refund_items(restocked) WHERE restocked = false;
```

---

## ⚠️ V6: Stock Reservations - **CẦN SỬA**

### ❌ Vấn đề 1: Trigger sync_reserved_quantity thiếu xử lý DELETE
**Script hiện tại:** Trigger chỉ xử lý INSERT và UPDATE  
**Impact:** Nếu xóa reservation (dù ít khi xảy ra), `reserved_quantity` không được cập nhật

**Sửa:**
```sql
-- Thêm xử lý DELETE vào trigger
CREATE OR REPLACE FUNCTION sync_reserved_quantity_to_warehouse_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE warehouse_stock
        SET reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
        WHERE product_variant_id = NEW.product_variant_id 
          AND warehouse_id = NEW.warehouse_id;
    
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'ACTIVE' AND NEW.status IN ('EXPIRED', 'RELEASED', 'CONSUMED') THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
            WHERE product_variant_id = OLD.product_variant_id 
              AND warehouse_id = OLD.warehouse_id;
        ELSIF OLD.status = 'ACTIVE' AND NEW.status = 'ACTIVE' AND OLD.quantity != NEW.quantity THEN
            -- Xử lý trường hợp quantity thay đổi
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity + NEW.quantity, 0)
            WHERE product_variant_id = NEW.product_variant_id 
              AND warehouse_id = NEW.warehouse_id;
        END IF;
    
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        -- Xử lý DELETE (ít khi xảy ra nhưng cần có)
        UPDATE warehouse_stock
        SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
        WHERE product_variant_id = OLD.product_variant_id 
          AND warehouse_id = OLD.warehouse_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cập nhật trigger để hỗ trợ DELETE
DROP TRIGGER IF EXISTS trg_sync_reserved_quantity ON stock_reservations;
CREATE TRIGGER trg_sync_reserved_quantity
AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
FOR EACH ROW
EXECUTE FUNCTION sync_reserved_quantity_to_warehouse_stock();
```

### ❌ Vấn đề 2: Thiếu index cho reference_id
**Script hiện tại:** Không có index cho `stock_reservations.reference_id`  
**Impact:** Query tìm reservations theo cart_id/order_id sẽ chậm

**Sửa:**
```sql
-- Thêm vào V6
CREATE INDEX idx_stock_reservations_reference ON stock_reservations(reference_id, reservation_type);
```

### ❌ Vấn đề 3: Thiếu index cho status
**Script hiện tại:** Không có index cho `stock_reservations.status`  
**Impact:** Filter reservations theo status sẽ chậm

**Sửa:**
```sql
-- Thêm vào V6
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);
```

### ⚠️ Đề xuất cải thiện:

#### 1. **Thêm CHECK constraint cho quantity**
```sql
ALTER TABLE stock_reservations
ADD CONSTRAINT chk_stock_reservations_quantity CHECK (quantity > 0);
```

#### 2. **Thêm CHECK constraint cho expires_at**
```sql
-- Đảm bảo expires_at phải trong tương lai khi tạo
-- (Không thể thêm CHECK constraint vì expires_at có thể là quá khứ khi status = 'EXPIRED')
-- → Xử lý trong Java code
```

---

## ✅ V7: Product Stats - **OK với một số đề xuất**

### ✅ Đúng:
- Trigger logic hợp lý
- Sử dụng `ON CONFLICT` đúng cách
- Indexes đầy đủ

### ⚠️ Đề xuất cải thiện:

#### 1. **Thêm CHECK constraint cho average_rating**
```sql
ALTER TABLE product_stats
ADD CONSTRAINT chk_product_stats_rating CHECK (average_rating >= 0 AND average_rating <= 5);
```

#### 2. **Thêm CHECK constraint cho counts**
```sql
ALTER TABLE product_stats
ADD CONSTRAINT chk_product_stats_counts CHECK (
    total_reviews >= 0 AND
    total_verified_reviews >= 0 AND
    total_sold >= 0 AND
    total_views >= 0 AND
    total_verified_reviews <= total_reviews
);
```

#### 3. **Cải thiện trigger để xử lý DELETE**
**Script hiện tại:** Trigger chỉ xử lý INSERT/UPDATE  
**Impact:** Khi xóa review, stats không được cập nhật

**Sửa:**
```sql
-- Trigger đã có AFTER DELETE, nhưng cần đảm bảo logic đúng
-- Logic hiện tại: Trigger sẽ chạy khi DELETE, nhưng SELECT sẽ không có NEW
-- → Cần sửa để xử lý DELETE riêng

CREATE OR REPLACE FUNCTION update_product_stats_on_review()
RETURNS TRIGGER AS $$
DECLARE
    affected_product_id BIGINT;
BEGIN
    -- Xác định product_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_product_id := OLD.product_id;
    ELSE
        affected_product_id := NEW.product_id;
    END IF;

    -- Update stats
    INSERT INTO product_stats (product_id, average_rating, total_reviews, total_verified_reviews)
    SELECT
        affected_product_id,
        COALESCE(AVG(rating)::DECIMAL(3,2), 0),
        COUNT(*),
        COUNT(*) FILTER (WHERE is_verified_purchase = true)
    FROM reviews
    WHERE product_id = affected_product_id AND status = 'APPROVED'
    ON CONFLICT (product_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        total_verified_reviews = EXCLUDED.total_verified_reviews,
        last_calculated_at = CURRENT_TIMESTAMP;

    -- Nếu không còn review nào, set về 0
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = affected_product_id AND status = 'APPROVED') THEN
        UPDATE product_stats
        SET average_rating = 0,
            total_reviews = 0,
            total_verified_reviews = 0,
            last_calculated_at = CURRENT_TIMESTAMP
        WHERE product_id = affected_product_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Đảm bảo trigger hỗ trợ DELETE
DROP TRIGGER IF EXISTS trg_update_product_stats_review ON reviews;
CREATE TRIGGER trg_update_product_stats_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_on_review();
```

---

## ⚠️ V8: Promotion Refactor - **CẦN SỬA**

### ❌ Vấn đề 1: Thiếu migration script cho dữ liệu cũ
**Script hiện tại:** Chỉ tạo bảng mới, không migrate dữ liệu từ JSONB  
**Impact:** Dữ liệu cũ trong `promotions.applicable_products` và `promotions.applicable_categories` sẽ bị mất

**Sửa:**
```sql
-- Thêm vào V8 sau khi tạo bảng

-- Migrate dữ liệu từ JSONB sang bảng quan hệ
-- 1. Migrate applicable_products
INSERT INTO promotion_applicable_products (promotion_id, product_id)
SELECT 
    p.id AS promotion_id,
    (jsonb_array_elements_text(p.applicable_products)::BIGINT) AS product_id
FROM promotions p
WHERE p.applicable_products IS NOT NULL 
  AND jsonb_array_length(p.applicable_products) > 0
ON CONFLICT (promotion_id, product_id) DO NOTHING;

-- 2. Migrate applicable_categories
INSERT INTO promotion_applicable_categories (promotion_id, category_id)
SELECT 
    p.id AS promotion_id,
    (jsonb_array_elements_text(p.applicable_categories)::BIGINT) AS category_id
FROM promotions p
WHERE p.applicable_categories IS NOT NULL 
  AND jsonb_array_length(p.applicable_categories) > 0
ON CONFLICT (promotion_id, category_id) DO NOTHING;

-- 3. (Optional) Xóa cột JSONB sau khi migrate (nếu chắc chắn không cần)
-- ALTER TABLE promotions DROP COLUMN applicable_products;
-- ALTER TABLE promotions DROP COLUMN applicable_categories;
-- ALTER TABLE promotions DROP COLUMN applicable_brands;
```

### ❌ Vấn đề 2: Thiếu index cho promotion_id
**Script hiện tại:** Không có index cho `promotion_id` trong bảng mới  
**Impact:** Join với promotions sẽ chậm

**Sửa:**
```sql
-- Thêm vào V8
CREATE INDEX idx_promo_app_prod_promo ON promotion_applicable_products(promotion_id);
CREATE INDEX idx_promo_app_cat_promo ON promotion_applicable_categories(promotion_id);
```

### ⚠️ Đề xuất cải thiện:

#### 1. **Thêm CHECK constraint để đảm bảo data integrity**
```sql
-- Không cần CHECK constraint vì UNIQUE đã đảm bảo
```

#### 2. **Thêm comment giải thích**
```sql
COMMENT ON TABLE promotion_applicable_products IS 'Many-to-Many relationship: Promotions to Products (replaces JSONB)';
COMMENT ON TABLE promotion_applicable_categories IS 'Many-to-Many relationship: Promotions to Categories (replaces JSONB)';
```

---

## 📊 Tổng kết vấn đề

| Migration | Vấn đề nghiêm trọng | Đề xuất cải thiện | Status |
|-----------|---------------------|-------------------|--------|
| **V4** | 0 | 3 | ✅ OK |
| **V5** | 4 | 3 | ⚠️ Cần sửa |
| **V6** | 3 | 2 | ⚠️ Cần sửa |
| **V7** | 0 | 3 | ✅ OK |
| **V8** | 2 | 2 | ⚠️ Cần sửa |

**Tổng cộng:**
- ❌ **9 vấn đề nghiêm trọng** cần sửa ngay
- ⚠️ **13 đề xuất cải thiện** (có thể làm sau)

---

## 🎯 Action Items

### 🔴 Ưu tiên cao (Phải sửa trước khi deploy):

1. **V5:** Thêm indexes cho `refund_number`, `status`, `payment_id`
2. **V6:** Sửa trigger để xử lý DELETE và UPDATE quantity
3. **V6:** Thêm indexes cho `reference_id` và `status`
4. **V8:** Thêm migration script cho dữ liệu cũ từ JSONB
5. **V8:** Thêm indexes cho `promotion_id`

### 🟡 Ưu tiên trung bình (Nên làm):

6. **V4:** Thêm CHECK constraints cho `tax_rate` và `tax_amount`
7. **V5:** Thêm CHECK constraints cho `quantity` và `refund_amount`
8. **V6:** Thêm CHECK constraint cho `quantity`
9. **V7:** Sửa trigger để xử lý DELETE review
10. **V7:** Thêm CHECK constraints cho `average_rating` và counts

### 🟢 Ưu tiên thấp (Có thể làm sau):

11. **V4:** Thêm composite index cho reporting
12. **V5:** Thêm index cho `restocked`
13. **Tất cả:** Thêm comments giải thích

---

## 📝 Scripts đã sửa

Tất cả các sửa chữa đã được tích hợp vào roadmap tại:
- `docs/DATABASE_REFACTORING_ROADMAP.md`

Bạn có thể tạo các migration scripts V4-V8 mới dựa trên review này.

---

## ✅ Checklist trước khi deploy

- [ ] Review lại tất cả foreign keys
- [ ] Test migration trên database dev
- [ ] Verify indexes được tạo đúng
- [ ] Test trigger logic với dữ liệu thực
- [ ] Verify migration script cho dữ liệu cũ (V8)
- [ ] Backup database trước khi chạy migration
- [ ] Test rollback plan

---

**Kết luận:** Các migration scripts cơ bản đã đúng, nhưng cần bổ sung indexes, constraints, và xử lý edge cases (DELETE, migration data) trước khi deploy production.

