# Phân Tích Rủi Ro Database - Orchard Store

**Ngày phân tích:** 2025-01-XX  
**Schema Version:** V1\_\_init_schema.sql

---

## 📋 TÓM TẮT ĐÁNH GIÁ

| Rủi Ro                             | Mức Độ            | Trạng Thái           | Khuyến Nghị                  |
| ---------------------------------- | ----------------- | -------------------- | ---------------------------- |
| **A. Concurrency khi trừ kho**     | ⚠️ **CAO**        | ❌ **CHƯA XỬ LÝ**    | Cần bổ sung ngay             |
| **B. Soft Delete**                 | ⚠️ **CAO**        | ❌ **THIẾU**         | Nên thêm cho bảng quan trọng |
| **C. Full-text Search Tiếng Việt** | ⚠️ **TRUNG BÌNH** | ⚠️ **CHƯA TỐI ƯU**   | Có thể cải thiện             |
| **D. Currency trong đơn hàng**     | ✅ **THẤP**       | ✅ **ĐÃ CÓ**         | Đủ cho VND, có thể mở rộng   |
| **E. Tối ưu bảng cart**            | ⚠️ **CAO**        | ❌ **CHƯA CÓ**       | Cần cleanup job              |
| **F. Logic Function/Trigger**      | ⚠️ **TRUNG BÌNH** | ⚠️ **CẦN CẢI THIỆN** | OK cho insert thủ công       |

---

## 🔴 A. VẤN ĐỀ CONCURRENCY KHI TRỪ KHO

### Hiện Trạng

**Bảng liên quan:**

- `warehouse_stock` (dòng 458-474)
- `product_variants.stock_quantity` (dòng 192)
- Function `sync_variant_stock_from_warehouses()` (dòng 1332-1343)
- Trigger `trg_sync_variant_stock` (dòng 1346-1349)

**Vấn đề phát hiện:**

1. **Không có locking mechanism:**

   - Khi 100 người cùng đặt 1 sản phẩm, các transaction sẽ đọc `warehouse_stock.quantity` cùng lúc
   - Cả 100 transaction đều thấy `quantity = 10` (ví dụ)
   - Cả 100 đều trừ `quantity - 1 = 9`
   - Kết quả: Chỉ trừ được 1, nhưng 99 đơn hàng khác vẫn được tạo → **Sai lệch số liệu nghiêm trọng**

2. **Trigger tự động sync:**
   - Trigger `trg_sync_variant_stock` chạy sau mỗi UPDATE/INSERT/DELETE trên `warehouse_stock`
   - Trong môi trường high concurrency, trigger này có thể gây **deadlock** hoặc **lock contention**

### Rủi Ro Cụ Thể

```sql
-- Scenario: Flash sale 100 người cùng đặt sản phẩm ID=1, quantity=10

-- Transaction 1-100: Cùng lúc chạy
UPDATE warehouse_stock
SET quantity = quantity - 1
WHERE product_variant_id = 1 AND warehouse_id = 1;

-- Kết quả: Có thể chỉ 1 transaction thành công, 99 còn lại vẫn pass validation
-- → 99 đơn hàng được tạo với stock = -89 (âm!)
```

### Giải Pháp Khuyến Nghị

#### **Option 1: Pessimistic Locking (SELECT FOR UPDATE)** ⭐ **KHUYẾN NGHỊ**

```sql
-- Trong Backend Service (Java/Spring)
@Transactional
public void reserveStock(Long variantId, Long warehouseId, Integer quantity) {
    // Lock row trước khi đọc
    WarehouseStock stock = warehouseStockRepository
        .findByProductVariantIdAndWarehouseId(variantId, warehouseId)
        .orElseThrow();

    // Sử dụng native query với FOR UPDATE
    @Query(value = "SELECT * FROM warehouse_stock " +
                   "WHERE product_variant_id = :variantId AND warehouse_id = :warehouseId " +
                   "FOR UPDATE", nativeQuery = true)
    WarehouseStock lockStock(@Param("variantId") Long variantId,
                            @Param("warehouseId") Long warehouseId);

    if (stock.getAvailableQuantity() < quantity) {
        throw new InsufficientStockException();
    }

    stock.setReservedQuantity(stock.getReservedQuantity() + quantity);
    warehouseStockRepository.save(stock);
}
```

#### **Option 2: Optimistic Locking (Version Field)**

```sql
-- Thêm cột version vào warehouse_stock
ALTER TABLE warehouse_stock ADD COLUMN version INTEGER DEFAULT 0;

-- Trong Entity (Java)
@Version
private Integer version;

-- Backend sẽ tự động check version khi update
-- Nếu version khác → throw OptimisticLockException
```

#### **Option 3: Database-level Constraint**

```sql
-- Thêm CHECK constraint để ngăn quantity âm
ALTER TABLE warehouse_stock
ADD CONSTRAINT chk_warehouse_stock_quantity
CHECK (quantity >= 0);

ALTER TABLE warehouse_stock
ADD CONSTRAINT chk_warehouse_stock_reserved
CHECK (reserved_quantity <= quantity);
```

**Kết hợp:** Option 1 + Option 3 là tốt nhất.

---

## 🔴 B. THIẾU CƠ CHẾ SOFT DELETE

### Hiện Trạng

**Các bảng quan trọng:**

- `products` (dòng 156-167): Có `status` nhưng **KHÔNG có `deleted_at`**
- `orders` (dòng 750-800): Có `status` nhưng **KHÔNG có `deleted_at`**
- `users` (dòng 40-60): Có `status` nhưng **KHÔNG có `deleted_at`**
- `customers` (dòng 663-688): Có `status` nhưng **KHÔNG có `deleted_at`**

**Foreign Key Constraints:**

- Hầu hết dùng `ON DELETE CASCADE` → Xóa dây chuyền nguy hiểm
- Ví dụ: Xóa 1 `product` → Tự động xóa tất cả `product_variants`, `order_items`, `reviews`...

### Rủi Ro Cụ Thể

```sql
-- Scenario: Admin lỡ tay xóa Product ID=100

DELETE FROM products WHERE id = 100;

-- Hậu quả:
-- 1. Tất cả product_variants của product này bị xóa (CASCADE)
-- 2. Tất cả order_items liên quan mất product_id
-- 3. Tất cả reviews bị xóa
-- 4. Không thể khôi phục được!
```

### Giải Pháp Khuyến Nghị

#### **1. Thêm cột `deleted_at` cho các bảng quan trọng:**

```sql
-- Migration: V4__add_soft_delete.sql

-- Products
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Orders (quan trọng nhất - không bao giờ được xóa cứng)
ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;

-- Users
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Customers
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NULL;

-- Product Variants
ALTER TABLE product_variants ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_variants_deleted_at ON product_variants(deleted_at) WHERE deleted_at IS NULL;
```

#### **2. Đổi ON DELETE CASCADE → ON DELETE RESTRICT:**

```sql
-- Thay đổi các FK quan trọng
ALTER TABLE product_variants
DROP CONSTRAINT fk_variants_product,
ADD CONSTRAINT fk_variants_product
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

ALTER TABLE order_items
DROP CONSTRAINT fk_order_items_product,
ADD CONSTRAINT fk_order_items_product
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

-- Tương tự cho các bảng khác
```

#### **3. Tạo Function Soft Delete:**

```sql
CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET deleted_at = CURRENT_TIMESTAMP,
        status = 'ARCHIVED'
    WHERE id = p_product_id;

    -- Soft delete variants
    UPDATE product_variants
    SET deleted_at = CURRENT_TIMESTAMP,
        status = 'INACTIVE'
    WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;
```

#### **4. Update Repository Queries:**

```sql
-- Tất cả SELECT phải filter deleted_at IS NULL
SELECT * FROM products
WHERE deleted_at IS NULL
AND status = 'ACTIVE';
```

---

## ⚠️ C. FULL-TEXT SEARCH TIẾNG VIỆT

### Hiện Trạng

**Các index search hiện có:**

- `attribute_values`: Dùng `to_tsvector('english', search_keywords)` (dòng 299) → **KHÔNG hỗ trợ tiếng Việt**
- `product_variants`: Chỉ có index trên `slug`, `sku` → **Không có full-text search**
- `products`: Không có index search

**Vấn đề:**

- Tìm kiếm "Nước hoa" vs "nuoc hoa" → Không match
- Tìm kiếm "Đồng hồ" vs "dong ho" → Không match
- Performance chậm khi dùng `LIKE '%keyword%'`

### Giải Pháp Khuyến Nghị

#### **Option 1: Sử dụng `unaccent` Extension + `tsvector`** ⭐ **KHUYẾN NGHỊ**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For trigram similarity

-- Thêm cột search_vector vào products
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Tạo function để generate search vector (bỏ dấu tiếng Việt)
CREATE OR REPLACE FUNCTION generate_vietnamese_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.name, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.description, ''))), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động update search_vector
CREATE TRIGGER trg_product_search_vector
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION generate_vietnamese_search_vector();

-- Tạo GIN index
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);

-- Query example
SELECT * FROM products
WHERE search_vector @@ to_tsquery('simple', unaccent('nuoc hoa'));
```

#### **Option 2: Sử dụng PGroonga (Nếu cần tìm kiếm phức tạp hơn)**

```sql
-- Install PGroonga extension (cần compile từ source)
CREATE EXTENSION IF NOT EXISTS pgroonga;

-- Tạo index
CREATE INDEX idx_products_name_pgroonga
ON products USING pgroonga (name pgroonga_text_full_text_search_ops_v2);

-- Query
SELECT * FROM products
WHERE name &@ 'nước hoa';
```

**Khuyến nghị:** Dùng Option 1 (unaccent + tsvector) vì đơn giản và đủ dùng.

---

## ✅ D. VẤN ĐỀ VỀ TIỀN TỆ (CURRENCY)

### Hiện Trạng

**Đã có:**

- `product_variants.currency_code` (dòng 190): Default 'VND'
- `orders.total_amount`, `order_items.unit_price` (dòng 776, 831): Lưu số tiền
- Bảng `currency_rates` (dòng 568-582): Lưu tỷ giá

**Đánh giá:**

- ✅ **Đủ dùng cho hệ thống chỉ bán ở VN (VND)**
- ⚠️ Nếu sau này mở rộng đa tiền tệ, cần bổ sung `exchange_rate` vào `orders`

### Khuyến Nghị (Nếu mở rộng đa tiền tệ)

```sql
-- Thêm exchange_rate vào orders
ALTER TABLE orders ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;
ALTER TABLE orders ADD COLUMN base_currency VARCHAR(3) DEFAULT 'VND';
ALTER TABLE orders ADD COLUMN order_currency VARCHAR(3) DEFAULT 'VND';

-- Lưu giá gốc và giá đã quy đổi
ALTER TABLE order_items ADD COLUMN base_unit_price DECIMAL(15,2);
ALTER TABLE order_items ADD COLUMN order_unit_price DECIMAL(15,2);
```

**Hiện tại:** Không cần thay đổi gì nếu chỉ bán VND.

---

## 🔴 E. TỐI ƯU BẢNG CART

### Hiện Trạng

**Bảng `carts` (dòng 848-867):**

- Lưu giỏ hàng của cả user đăng nhập (`customer_id`) và session ẩn danh (`session_id`)
- Có `expires_at` nhưng **KHÔNG có cleanup job**
- Sau 1 năm: Có thể có hàng triệu record rác từ session ẩn danh

### Rủi Ro

```sql
-- Scenario: 10.000 visitor/ngày, mỗi người tạo 5 cart items
-- Sau 1 năm: 10.000 * 5 * 365 = 18.250.000 records
-- → Database chậm, index lớn, backup lâu
```

### Giải Pháp Khuyến Nghị

#### **1. Cleanup Job (Scheduled Task)**

```sql
-- Function xóa cart cũ
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Xóa cart của session ẩn danh > 30 ngày
    DELETE FROM carts
    WHERE session_id IS NOT NULL
    AND customer_id IS NULL
    AND (expires_at < CURRENT_TIMESTAMP OR updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Chạy định kỳ (có thể dùng pg_cron hoặc Spring Scheduler)
-- SELECT cleanup_expired_carts(); -- Chạy mỗi ngày
```

#### **2. Partition Table (Nếu dữ liệu rất lớn)**

```sql
-- Partition theo tháng
CREATE TABLE carts_2025_01 PARTITION OF carts
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Tự động drop partition cũ sau 3 tháng
```

#### **3. Index Optimization**

```sql
-- Index để cleanup nhanh
CREATE INDEX idx_carts_cleanup
ON carts(updated_at, session_id)
WHERE customer_id IS NULL AND session_id IS NOT NULL;
```

**Khuyến nghị:** Implement cleanup job ngay, partition chỉ cần khi scale lớn.

---

## ⚠️ F. LOGIC TRONG FUNCTION/TRIGGER

### Hiện Trạng

**Function `generate_variant_slug()` (dòng 1368-1399):**

```sql
WHILE EXISTS (SELECT 1 FROM product_variants WHERE slug = final_slug ...) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
END LOOP;
```

**Vấn đề:**

- Vòng lặp `WHILE` chạy SELECT liên tục → Chậm khi bulk insert
- Nếu import 10.000 sản phẩm → 10.000 lần SELECT → Rất chậm

### Đánh Giá

- ✅ **OK cho insert thủ công từng cái** (1-10 sản phẩm/lần)
- ❌ **KHÔNG phù hợp cho bulk import** (hàng nghìn sản phẩm)

### Giải Pháp Khuyến Nghị

#### **Option 1: Xử lý slug ở Application Layer** ⭐ **KHUYẾN NGHỊ**

```java
// Trong Backend Service
public String generateUniqueSlug(String baseSlug) {
    String slug = baseSlug;
    int counter = 1;

    while (productVariantRepository.existsBySlug(slug)) {
        slug = baseSlug + "-" + counter;
        counter++;
    }

    return slug;
}

// Khi bulk import: Generate slug trước, validate batch
List<String> slugs = variants.stream()
    .map(v -> generateUniqueSlug(v.getBaseSlug()))
    .collect(Collectors.toList());

// Insert batch với slug đã unique
```

#### **Option 2: Dùng Sequence thay vì counter**

```sql
-- Tạo sequence cho slug suffix
CREATE SEQUENCE variant_slug_suffix_seq;

-- Function dùng sequence
CREATE OR REPLACE FUNCTION generate_variant_slug_v2()
RETURNS TRIGGER AS $$
DECLARE
    base_slug VARCHAR;
    final_slug VARCHAR;
BEGIN
    -- Generate base slug
    base_slug := ...;

    -- Dùng sequence để tránh conflict
    final_slug := base_slug || '-' || nextval('variant_slug_suffix_seq');

    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Khuyến nghị:** Option 1 (Application layer) linh hoạt hơn, dễ test và maintain.

---

## 📊 TỔNG KẾT VÀ ƯU TIÊN

### **Ưu Tiên CAO (Làm ngay):**

1. **A. Concurrency Locking** → Thêm `SELECT FOR UPDATE` + CHECK constraint
2. **B. Soft Delete** → Thêm `deleted_at` cho bảng quan trọng
3. **E. Cart Cleanup** → Tạo cleanup job

### **Ưu Tiên TRUNG BÌNH (Có thể làm sau):**

4. **C. Full-text Search** → Thêm `unaccent` + `tsvector`
5. **F. Function Logic** → Chuyển slug generation sang Application layer

### **Ưu Tiên THẤP (Chỉ khi cần):**

6. **D. Currency** → Chỉ cần khi mở rộng đa tiền tệ

---

## 🔧 MIGRATION PLAN

### **Phase 1: Critical Fixes (Tuần 1-2)**

```sql
-- V4__add_concurrency_locking.sql
-- V5__add_soft_delete.sql
-- V6__add_cart_cleanup.sql
```

### **Phase 2: Performance (Tuần 3-4)**

```sql
-- V7__add_fulltext_search.sql
-- V8__optimize_slug_generation.sql
```

---

---

## 🔬 PHẦN 2: PHÂN TÍCH CHUYÊN SÂU (DEEP DIVE ANALYSIS)

**Ngày cập nhật:** 2025-01-XX  
**Phạm vi:** Các rủi ro logic nghiệp vụ và kiến trúc

---

## 🩸 1. THE "JSONB TRAP" - BẪY DỮ LIỆU PHI CẤU TRÚC

### Hiện Trạng

**Các bảng sử dụng JSONB:**

- `product_variants.cached_attributes` (dòng 215): Cache thuộc tính sản phẩm
- `roles.permissions` (dòng 11): Quyền RBAC
- `promotions.applicable_products`, `applicable_categories`, `applicable_brands` (dòng 1124-1126)

**Mục đích thiết kế:**

- `cached_attributes`: Tăng tốc đọc (Read Performance) - không cần JOIN nhiều bảng
- `applicable_products`: Lưu danh sách sản phẩm áp dụng khuyến mãi

### Vấn Đề: Data Desynchronization (Lệch Dữ Liệu)

**Kịch bản thực tế:**

```sql
-- Bước 1: Có 1.000 sản phẩm với màu "Xanh Dương"
-- cached_attributes = {"Color": "Xanh Dương", "Size": "100ml"}

-- Bước 2: Admin sửa tên thuộc tính
UPDATE attribute_values
SET display_value = 'Xanh Navy'
WHERE value = 'xanh-duong' AND attribute_id = (SELECT id FROM product_attributes WHERE attribute_key = 'Color');

-- Bước 3: Kiểm tra
SELECT COUNT(*) FROM product_variants
WHERE cached_attributes->>'Color' = 'Xanh Dương';
-- → Vẫn còn 1.000 sản phẩm với JSON cũ!

-- Bước 4: Khách hàng filter "Xanh Navy"
SELECT * FROM product_variants
WHERE cached_attributes->>'Color' = 'Xanh Navy';
-- → Không ra kết quả nào! (Mất 1.000 sản phẩm)
```

**Rủi ro:**

- ❌ **Filter/Search sai**: Khách không tìm thấy sản phẩm
- ❌ **Write Amplification**: Update 1 attribute → Phải update hàng nghìn variants
- ❌ **Data Integrity**: Dữ liệu không đồng bộ giữa source và cache

### Giải Pháp Khuyến Nghị

#### **Option 1: Chỉ dùng JSONB cho Display, Filter qua JOIN** ⭐ **KHUYẾN NGHỊ**

```sql
-- ✅ ĐÚNG: Filter qua bảng gốc
SELECT pv.*
FROM product_variants pv
JOIN product_attribute_values pav ON pav.product_variant_id = pv.id
JOIN attribute_values av ON av.id = pav.attribute_value_id
WHERE av.display_value = 'Xanh Navy'
AND av.attribute_id = (SELECT id FROM product_attributes WHERE attribute_key = 'Color');

-- ❌ SAI: Filter trực tiếp trên JSONB cache
SELECT * FROM product_variants
WHERE cached_attributes->>'Color' = 'Xanh Navy';
```

**Quy tắc:**

- ✅ `cached_attributes` chỉ dùng để **hiển thị** (Display) nhanh
- ✅ **Filter/Search** bắt buộc JOIN qua `product_attribute_values`
- ✅ **Không bao giờ** filter trực tiếp trên JSONB nếu dữ liệu gốc hay thay đổi

#### **Option 2: Background Job Sync (Nếu bắt buộc dùng JSONB để filter)**

```sql
-- Function tự động sync khi attribute_values thay đổi
CREATE OR REPLACE FUNCTION sync_cached_attributes_on_attribute_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tất cả variants có dùng attribute này
    UPDATE product_variants pv
    SET cached_attributes = jsonb_set(
        cached_attributes,
        ARRAY[(SELECT attribute_key FROM product_attributes WHERE id = NEW.attribute_id)],
        to_jsonb(NEW.display_value)
    )
    WHERE EXISTS (
        SELECT 1 FROM product_attribute_values pav
        WHERE pav.product_variant_id = pv.id
        AND pav.attribute_value_id = NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_cached_attributes
AFTER UPDATE OF display_value ON attribute_values
FOR EACH ROW
EXECUTE FUNCTION sync_cached_attributes_on_attribute_change();
```

**Nhược điểm:** Chậm khi có hàng nghìn variants, có thể gây lock contention.

**Khuyến nghị:** Dùng Option 1 (Filter qua JOIN) - Đơn giản, chính xác, dễ maintain.

---

## 💸 2. FINANCIAL INTEGRITY - LỖ HỔNG TÀI CHÍNH & THUẾ

### Vấn Đề 1: Tax Rate Snapshot (Lưu Vết Thuế Suất)

**Hiện trạng:**

- `order_items` (dòng 822-837): **KHÔNG có** `tax_rate`, `tax_amount`
- `product_variants.tax_class_id` (dòng 191): Link tới `tax_classes`
- `tax_classes.rate` (dòng 557): Có thể thay đổi theo thời gian

**Kịch bản rủi ro:**

```sql
-- Ngày 01/01/2025: Thuế VAT = 10%
INSERT INTO tax_classes (name, rate) VALUES ('VAT Standard', 10.00);

-- Khách mua hàng: 1.000.000 VND
-- Hệ thống tính: 1.000.000 * 10% = 100.000 VND thuế
-- Total: 1.100.000 VND
INSERT INTO orders (total_amount, ...) VALUES (1100000, ...);

-- Ngày 15/01/2025: Chính phủ giảm thuế xuống 8%
UPDATE tax_classes SET rate = 8.00 WHERE name = 'VAT Standard';

-- Admin in lại hóa đơn đơn hàng cũ
SELECT
    oi.subtotal,
    tc.rate as current_tax_rate,  -- ❌ Lấy rate mới = 8%
    oi.subtotal * tc.rate / 100 as calculated_tax
FROM order_items oi
JOIN product_variants pv ON pv.id = oi.product_variant_id
JOIN tax_classes tc ON tc.id = pv.tax_class_id
WHERE oi.order_id = 123;

-- Kết quả: Tính lại với 8% → Sai lệch kế toán!
-- Đơn hàng cũ: 100.000 VND thuế
-- Tính lại: 80.000 VND thuế
-- → Chênh lệch 20.000 VND
```

**Rủi ro:**

- ❌ **Sai lệch kế toán**: Hóa đơn cũ không khớp với thuế suất tại thời điểm mua
- ❌ **Audit trail**: Không thể truy vết chính xác thuế suất đã áp dụng
- ❌ **Compliance**: Vi phạm quy định kế toán (phải lưu snapshot)

### Giải Pháp: Thêm Tax Snapshot vào order_items

```sql
-- Migration: V7__add_tax_snapshot_to_order_items.sql

ALTER TABLE order_items
ADD COLUMN tax_rate DECIMAL(5,2),
ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN tax_class_id BIGINT,
ADD COLUMN tax_class_name VARCHAR(100);

-- Index cho reporting
CREATE INDEX idx_order_items_tax_rate ON order_items(tax_rate);
CREATE INDEX idx_order_items_tax_class ON order_items(tax_class_id);

-- Comment
COMMENT ON COLUMN order_items.tax_rate IS 'Tax rate at time of purchase (snapshot)';
COMMENT ON COLUMN order_items.tax_amount IS 'Tax amount calculated at time of purchase';
```

**Backend Logic:**

```java
// Khi tạo order_items, snapshot tax rate
OrderItem item = new OrderItem();
item.setProductVariant(variant);
item.setQuantity(quantity);
item.setUnitPrice(price);

// Snapshot tax tại thời điểm mua
TaxClass taxClass = variant.getTaxClass();
item.setTaxRate(taxClass.getRate());  // Lưu cứng
item.setTaxAmount(price * quantity * taxClass.getRate() / 100);
item.setTaxClassId(taxClass.getId());
item.setTaxClassName(taxClass.getName());

orderItemRepository.save(item);
```

### Vấn Đề 2: Partial Refund (Hoàn Tiền Một Phần)

**Hiện trạng:**

- `payments.refund_amount` (dòng 914): Chỉ biết tổng số tiền hoàn
- **KHÔNG có** bảng `refunds` và `refund_items` để track item nào được trả lại

**Kịch bản rủi ro:**

```sql
-- Đơn hàng: 2 chai nước hoa
-- Item A: 1.000.000 VND
-- Item B: 2.000.000 VND
-- Total: 3.000.000 VND

-- Khách trả lại chai A (lỗi sản phẩm)
-- Hệ thống chỉ update:
UPDATE payments SET refund_amount = 1000000 WHERE order_id = 123;

-- ❌ Vấn đề:
-- 1. Không biết item nào được trả lại
-- 2. Không biết lý do trả lại
-- 3. Không biết có nhập lại kho không
-- 4. Báo cáo doanh thu theo sản phẩm SAI
```

**Rủi ro:**

- ❌ **Báo cáo sai**: Không biết sản phẩm nào bị trả lại nhiều
- ❌ **Inventory**: Không track được hàng trả lại có nhập kho không
- ❌ **Analytics**: Không phân tích được lý do trả hàng theo sản phẩm

### Giải Pháp: Tạo bảng Refunds & Refund Items

```sql
-- Migration: V8__add_refunds_tables.sql

-- Bảng refunds (Tổng quan hoàn tiền)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Bảng refund_items (Chi tiết item được trả lại)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refund_items_refund ON refund_items(refund_id);
CREATE INDEX idx_refund_items_order_item ON refund_items(order_item_id);
CREATE INDEX idx_refund_items_variant ON refund_items(product_variant_id);
CREATE INDEX idx_refund_items_restocked ON refund_items(restocked) WHERE restocked = false;

-- Foreign keys
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id);
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users(id);

ALTER TABLE refund_items ADD CONSTRAINT fk_refund_items_refund FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE;
ALTER TABLE refund_items ADD CONSTRAINT fk_refund_items_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id);
ALTER TABLE refund_items ADD CONSTRAINT fk_refund_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
ALTER TABLE refund_items ADD CONSTRAINT fk_refund_items_warehouse FOREIGN KEY (restocked_warehouse_id) REFERENCES warehouses(id);
```

**Lợi ích:**

- ✅ Track chính xác item nào được trả lại
- ✅ Báo cáo doanh thu chính xác theo sản phẩm
- ✅ Quản lý nhập lại kho (Restock)
- ✅ Phân tích lý do trả hàng

---

## 📦 3. INVENTORY RESERVATION - LỖ HỔNG GIỮ HÀNG (CART HOARDING)

### Hiện Trạng

**Bảng `warehouse_stock` (dòng 458-474):**

- Có `reserved_quantity` (dòng 464)
- Có `available_quantity` = `quantity - reserved_quantity` (dòng 465)
- **KHÔNG có** `reservation_expires_at` hoặc bảng riêng `stock_reservations`

**Bảng `carts` (dòng 848-867):**

- Có `expires_at` (dòng 855)
- Nhưng **KHÔNG tự động** release reserved stock khi hết hạn

### Vấn Đề: "Ghost Stock" (Tồn Kho Ma)

**Kịch bản:**

```sql
-- Khách A thêm 5 chai vào giỏ (10:00 AM)
-- Backend: UPDATE warehouse_stock SET reserved_quantity = reserved_quantity + 5 WHERE ...
-- reserved_quantity = 5, available_quantity = 10 - 5 = 5

-- Khách A tắt trình duyệt, bỏ đi (10:05 AM)
-- ❌ reserved_quantity vẫn = 5 (không được release)

-- Khách B vào mua (10:10 AM)
-- available_quantity = 10 - 5 = 5
-- Khách B muốn mua 8 chai → Hết hàng!
-- → Mất khách dù trong kho vẫn còn 10 chai
```

**Rủi ro:**

- ❌ **Mất doanh thu**: Hàng bị "giữ chết" không bán được
- ❌ **Trải nghiệm khách hàng**: Thấy hết hàng dù thực tế còn
- ❌ **Inventory accuracy**: Số liệu tồn kho không chính xác

### Giải Pháp Khuyến Nghị

#### **Option 1: Bảng stock_reservations riêng** ⭐ **KHUYẾN NGHỊ**

```sql
-- Migration: V9__add_stock_reservations.sql

CREATE TABLE stock_reservations (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN ('CART', 'CHECKOUT', 'ORDER')),
    reference_id BIGINT,  -- cart_id, order_id, etc.
    quantity INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONSUMED', 'RELEASED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, warehouse_id, reference_id, reservation_type)
);

CREATE INDEX idx_stock_reservations_variant ON stock_reservations(product_variant_id, warehouse_id);
CREATE INDEX idx_stock_reservations_expires ON stock_reservations(expires_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_stock_reservations_reference ON stock_reservations(reference_id, reservation_type);

-- Function tính available_quantity từ reservations
CREATE OR REPLACE FUNCTION calculate_available_stock(
    p_variant_id BIGINT,
    p_warehouse_id BIGINT
) RETURNS INTEGER AS $$
DECLARE
    total_quantity INTEGER;
    reserved_quantity INTEGER;
BEGIN
    -- Lấy tổng quantity
    SELECT quantity INTO total_quantity
    FROM warehouse_stock
    WHERE product_variant_id = p_variant_id AND warehouse_id = p_warehouse_id;

    -- Tính reserved từ bảng reservations (chỉ ACTIVE và chưa hết hạn)
    SELECT COALESCE(SUM(quantity), 0) INTO reserved_quantity
    FROM stock_reservations
    WHERE product_variant_id = p_variant_id
    AND warehouse_id = p_warehouse_id
    AND status = 'ACTIVE'
    AND expires_at > CURRENT_TIMESTAMP;

    RETURN COALESCE(total_quantity, 0) - reserved_quantity;
END;
$$ LANGUAGE plpgsql;

-- Function tự động release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    released_count INTEGER;
BEGIN
    UPDATE stock_reservations
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE'
    AND expires_at < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS released_count = ROW_COUNT;
    RETURN released_count;
END;
$$ LANGUAGE plpgsql;
```

**Backend Logic:**

```java
// Khi thêm vào giỏ: KHÔNG reserve (chỉ khi checkout)
public void addToCart(Long variantId, Integer quantity) {
    // Chỉ lưu vào carts, KHÔNG reserve stock
    Cart cart = new Cart();
    cart.setProductVariantId(variantId);
    cart.setQuantity(quantity);
    cart.setExpiresAt(LocalDateTime.now().plusDays(7));
    cartRepository.save(cart);
}

// Khi bắt đầu checkout: MỚI reserve
@Transactional
public void reserveStockForCheckout(Long variantId, Long warehouseId, Integer quantity, Long cartId) {
    // Tạo reservation với TTL 15 phút
    StockReservation reservation = new StockReservation();
    reservation.setProductVariantId(variantId);
    reservation.setWarehouseId(warehouseId);
    reservation.setReservationType("CHECKOUT");
    reservation.setReferenceId(cartId);
    reservation.setQuantity(quantity);
    reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15));
    reservation.setStatus("ACTIVE");
    stockReservationRepository.save(reservation);
}

// Cron job chạy mỗi phút để release expired
@Scheduled(fixedRate = 60000) // 1 phút
public void releaseExpiredReservations() {
    stockReservationRepository.releaseExpired();
}
```

#### **Option 2: Dùng Redis với TTL (Nếu có Redis)**

```java
// Reserve với TTL 15 phút
redisTemplate.opsForValue().set(
    "reservation:variant:1:warehouse:1",
    "5",
    Duration.ofMinutes(15)
);

// Check available
Integer total = warehouseStock.getQuantity();
Integer reserved = getReservedFromRedis(variantId, warehouseId);
Integer available = total - reserved;
```

**Khuyến nghị:** Option 1 (Bảng riêng) - Dễ audit, không phụ thuộc Redis.

---

## 🚀 4. SCALABILITY - ĐIỂM NGHẼN HIỆU NĂNG

### Vấn Đề 1: Review Aggregation (Tính Điểm Đánh Giá)

**Hiện trạng:**

- Bảng `reviews` (dòng 1052-1068): Lưu từng review
- **KHÔNG có** bảng `product_stats` để cache rating, sold count

**Kịch bản rủi ro:**

```sql
-- Trang danh sách sản phẩm: 20 sản phẩm
-- Mỗi sản phẩm cần hiện: "4.5 sao (120 đánh giá)"

-- Query hiện tại (CHẬM):
SELECT
    p.id,
    p.name,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as total_reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'APPROVED'
WHERE p.status = 'ACTIVE'
GROUP BY p.id
LIMIT 20;

-- Nếu bảng reviews có 1 triệu dòng:
-- → Full table scan + GROUP BY → Database sập!
-- → Response time: 5-10 giây
```

**Rủi ro:**

- ❌ **Performance**: Mỗi lần load trang = Tính toán lại từ đầu
- ❌ **Database load**: Full table scan trên bảng lớn
- ❌ **User experience**: Trang chậm, timeout

### Giải Pháp: Bảng product_stats Cache

```sql
-- Migration: V10__add_product_stats.sql

CREATE TABLE product_stats (
    product_id BIGINT PRIMARY KEY,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_verified_reviews INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_stats_rating ON product_stats(average_rating DESC);
CREATE INDEX idx_product_stats_sold ON product_stats(total_sold DESC);
CREATE INDEX idx_product_stats_calculated ON product_stats(last_calculated_at);

-- Function tự động update stats khi có review mới
CREATE OR REPLACE FUNCTION update_product_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO product_stats (product_id, average_rating, total_reviews, total_verified_reviews)
    SELECT
        NEW.product_id,
        AVG(rating)::DECIMAL(3,2),
        COUNT(*),
        COUNT(*) FILTER (WHERE is_verified_purchase = true)
    FROM reviews
    WHERE product_id = NEW.product_id AND status = 'APPROVED'
    ON CONFLICT (product_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        total_verified_reviews = EXCLUDED.total_verified_reviews,
        last_calculated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_stats_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_on_review();

-- Function update sold count khi order được thanh toán
CREATE OR REPLACE FUNCTION update_product_stats_on_order_paid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'PAID' AND OLD.payment_status != 'PAID' THEN
        UPDATE product_stats ps
        SET total_sold = (
            SELECT COALESCE(SUM(oi.quantity), 0)
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.product_id = ps.product_id
            AND o.payment_status = 'PAID'
        ),
        last_calculated_at = CURRENT_TIMESTAMP
        WHERE ps.product_id IN (
            SELECT DISTINCT product_id FROM order_items WHERE order_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_stats_order
AFTER UPDATE OF payment_status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_on_order_paid();
```

**Query tối ưu:**

```sql
-- ✅ NHANH: Join với bảng cache
SELECT
    p.id,
    p.name,
    COALESCE(ps.average_rating, 0) as avg_rating,
    COALESCE(ps.total_reviews, 0) as total_reviews
FROM products p
LEFT JOIN product_stats ps ON ps.product_id = p.id
WHERE p.status = 'ACTIVE'
ORDER BY ps.total_sold DESC
LIMIT 20;
-- → Response time: < 50ms (nhanh hơn 100 lần!)
```

### Vấn Đề 2: Promotion Lookup (Tra Cứu Khuyến Mãi)

**Hiện trạng:**

- `promotions.applicable_products` (dòng 1124): JSONB array `[1, 2, 3, ...]`
- `promotions.applicable_categories` (dòng 1125): JSONB array
- GIN index trên JSONB (dòng 1141)

**Kịch bản rủi ro:**

```sql
-- Checkout: Giỏ hàng có 10 sản phẩm
-- Cần tìm: "Có khuyến mãi nào áp dụng cho 10 sản phẩm này không?"

-- Query hiện tại (CHẬM):
SELECT p.*
FROM promotions p
WHERE p.status = 'ACTIVE'
AND p.start_date <= CURRENT_TIMESTAMP
AND p.end_date >= CURRENT_TIMESTAMP
AND (
    -- Phải parse JSONB cho mỗi promotion
    EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(p.applicable_products) AS product_id
        WHERE product_id::BIGINT IN (1, 2, 3, ..., 10)
    )
    OR p.applicable_to = 'ALL'
);

-- Nếu có 1.000 promotions:
-- → Full table scan + JSON parsing cho mỗi dòng
-- → Response time: 2-5 giây
```

**Rủi ro:**

- ❌ **Performance**: JSON parsing chậm, không tận dụng index tốt
- ❌ **Scalability**: Càng nhiều promotions → Càng chậm
- ❌ **User experience**: Checkout chậm

### Giải Pháp: Bảng promotion_applicable_products

```sql
-- Migration: V11__refactor_promotion_applicable.sql

-- Bảng promotion_applicable_products (One-to-Many)
CREATE TABLE promotion_applicable_products (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, product_id)
);

CREATE INDEX idx_promo_applicable_promo ON promotion_applicable_products(promotion_id);
CREATE INDEX idx_promo_applicable_product ON promotion_applicable_products(product_id);  -- ⭐ Index này giúp tìm nhanh

-- Bảng promotion_applicable_categories
CREATE TABLE promotion_applicable_categories (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, category_id)
);

CREATE INDEX idx_promo_applicable_cat_promo ON promotion_applicable_categories(promotion_id);
CREATE INDEX idx_promo_applicable_cat_category ON promotion_applicable_categories(category_id);

-- Bảng promotion_applicable_brands
CREATE TABLE promotion_applicable_brands (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    brand_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, brand_id)
);

CREATE INDEX idx_promo_applicable_brand_promo ON promotion_applicable_brands(promotion_id);
CREATE INDEX idx_promo_applicable_brand_brand ON promotion_applicable_brands(brand_id);

-- Foreign keys
ALTER TABLE promotion_applicable_products
ADD CONSTRAINT fk_promo_applicable_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_promo_applicable_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE promotion_applicable_categories
ADD CONSTRAINT fk_promo_applicable_cat_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_promo_applicable_cat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE promotion_applicable_brands
ADD CONSTRAINT fk_promo_applicable_brand_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_promo_applicable_brand_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
```

**Query tối ưu:**

```sql
-- ✅ NHANH: Join với bảng có index
SELECT DISTINCT p.*
FROM promotions p
WHERE p.status = 'ACTIVE'
AND p.start_date <= CURRENT_TIMESTAMP
AND p.end_date >= CURRENT_TIMESTAMP
AND (
    p.applicable_to = 'ALL'
    OR EXISTS (
        SELECT 1 FROM promotion_applicable_products pap
        WHERE pap.promotion_id = p.id
        AND pap.product_id IN (1, 2, 3, ..., 10)  -- ⭐ Index scan nhanh
    )
    OR EXISTS (
        SELECT 1 FROM promotion_applicable_categories pac
        JOIN product_variants pv ON pv.category_id = pac.category_id
        WHERE pac.promotion_id = p.id
        AND pv.id IN (SELECT product_variant_id FROM cart_items WHERE ...)
    )
);
-- → Response time: < 100ms (nhanh hơn 20-50 lần!)
```

**Migration script để chuyển dữ liệu từ JSONB:**

```sql
-- Script chuyển dữ liệu từ JSONB sang bảng mới
INSERT INTO promotion_applicable_products (promotion_id, product_id)
SELECT
    p.id as promotion_id,
    (value::text)::BIGINT as product_id
FROM promotions p,
LATERAL jsonb_array_elements_text(p.applicable_products) AS value
WHERE p.applicable_products IS NOT NULL
ON CONFLICT DO NOTHING;

-- Sau khi migrate xong, có thể xóa cột JSONB (hoặc giữ để backward compatibility)
-- ALTER TABLE promotions DROP COLUMN applicable_products;
```

---

## 🛡️ 5. SECURITY & COMPLIANCE - BẢO MẬT

### Vấn Đề: Lộ Thông Tin Nhạy Cảm Trong Log/History

**Hiện trạng:**

- `inventory_transactions.notes` (dòng 489): Text tự do
- `orders.notes` (dòng 790): Text tự do
- Các bảng khác có trường `notes`, `description` tự do

**Kịch bản rủi ro:**

```sql
-- Nhân viên kho ghi chú
INSERT INTO inventory_transactions (..., notes)
VALUES (..., 'Khách VIP [SĐT: 0901234567] trả hàng vì lỗi. Email: customer@example.com');

-- Database bị dump/leak
-- → Lộ thông tin: SĐT, Email khách hàng
-- → Vi phạm GDPR/PDPA (Bảo vệ dữ liệu cá nhân)
```

**Rủi ro:**

- ❌ **PII Leak**: Thông tin cá nhân rải rác trong database
- ❌ **Compliance**: Vi phạm quy định bảo vệ dữ liệu
- ❌ **Security**: Khó kiểm soát và mã hóa

### Giải Pháp

#### **1. Quy Tắc Nghiêm Ngặt (Policy)**

```sql
-- Document: KHÔNG BAO GIỜ lưu thông tin sau vào notes/description:
-- - Số điện thoại
-- - Email
-- - Địa chỉ cụ thể
-- - Số CMND/CCCD
-- - Thông tin tài chính (số thẻ, tài khoản)
```

#### **2. Data Masking Function (Nếu bắt buộc lưu)**

```sql
-- Function tự động mask thông tin nhạy cảm
CREATE OR REPLACE FUNCTION mask_sensitive_data(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Mask phone: 0901234567 -> 090****567
    input_text := regexp_replace(input_text,
        '(\d{3})\d{4}(\d{3})',
        '\1****\2',
        'g'
    );

    -- Mask email: user@example.com -> u***@example.com
    input_text := regexp_replace(input_text,
        '([a-zA-Z0-9])[a-zA-Z0-9]*@',
        '\1***@',
        'g'
    );

    RETURN input_text;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động mask trước khi lưu
CREATE TRIGGER trg_mask_inventory_notes
BEFORE INSERT OR UPDATE ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION mask_sensitive_data(NEW.notes);
```

#### **3. Encryption at Rest (Cho cột nhạy cảm)**

```sql
-- Sử dụng pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Lưu encrypted
INSERT INTO inventory_transactions (notes)
VALUES (pgp_sym_encrypt('Sensitive note', 'encryption_key'));

-- Đọc decrypted (chỉ user có quyền)
SELECT pgp_sym_decrypt(notes, 'encryption_key') FROM inventory_transactions;
```

**Khuyến nghị:** Option 1 (Policy) - Đơn giản nhất, hiệu quả nhất.

---

## 📋 TỔNG HỢP REFACTORING LIST

### **Phase 1: Critical Business Logic (Tuần 1-2)**

1. ✅ **Tax Snapshot** → `V7__add_tax_snapshot_to_order_items.sql`
2. ✅ **Refunds** → `V8__add_refunds_tables.sql`
3. ✅ **Stock Reservations** → `V9__add_stock_reservations.sql`

### **Phase 2: Performance Optimization (Tuần 3-4)**

4. ✅ **Product Stats** → `V10__add_product_stats.sql`
5. ✅ **Promotion Refactor** → `V11__refactor_promotion_applicable.sql`

### **Phase 3: Security & Compliance (Tuần 5)**

6. ✅ **Data Masking** → Policy + Function (nếu cần)

### **Phase 4: Documentation (Ongoing)**

7. ✅ **JSONB Usage Guide** → Document quy tắc sử dụng `cached_attributes`

---

## 🎯 KẾT LUẬN

Các rủi ro chuyên sâu này **quan trọng hơn** các rủi ro kỹ thuật ban đầu vì:

- **Ảnh hưởng trực tiếp đến nghiệp vụ**: Sai lệch tài chính, mất doanh thu
- **Khó phát hiện**: Chỉ lộ ra khi scale lớn hoặc có sự cố
- **Khó sửa**: Phải refactor schema và migrate dữ liệu

**Ưu tiên thực hiện:**

1. **Tax Snapshot** (Tuần 1) - Quan trọng nhất cho compliance
2. **Stock Reservations** (Tuần 1-2) - Ảnh hưởng doanh thu
3. **Product Stats** (Tuần 3) - Ảnh hưởng performance
4. **Promotion Refactor** (Tuần 4) - Ảnh hưởng checkout speed

---

**Tác giả:** AI Assistant  
**Review Date:** 2025-01-XX  
**Version:** 2.0 (Deep Dive Analysis)
