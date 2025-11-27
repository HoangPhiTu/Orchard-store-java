# 🗺️ Lộ Trình Refactoring Database - Orchard Store

**Ngày tạo:** 2025-01-XX  
**Mục tiêu:** Fix các rủi ro database đã phân tích  
**Thời gian ước tính:** 5-6 tuần  
**Schema hiện tại:** V3\_\_add_path_column_categories.sql  
**Version:** 2.0 (Integrated - All-in-One Roadmap)

**📌 Lưu ý:** File này đã tích hợp tất cả thông tin từ:

- ✅ **Risk Analysis** (xem chi tiết tại `docs/DATABASE_RISK_ANALYSIS.md`)
- ✅ **Refinements Guide** (đã tích hợp vào đây - Stock Reservations Performance, Product Stats Deadlock Prevention, Tax Breakdown JSON)
- ✅ **Technical Gotchas** (mới thêm - Distributed Lock với ShedLock, Trigger generate_refund_number fix, Transaction Management với FOR UPDATE)
- ✅ **Stock Flow Visualization** (mới thêm - sơ đồ luồng xử lý kho từ Add to Cart → Checkout → Payment → Scheduled Job)

---

## 📋 TỔNG QUAN

### **Các Phase Thực Hiện**

| Phase       | Tên                      | Thời Gian | Ưu Tiên       | Trạng Thái      |
| ----------- | ------------------------ | --------- | ------------- | --------------- |
| **Phase 1** | Critical Business Logic  | Tuần 1-2  | 🔴 CAO        | ⏳ Chưa bắt đầu |
| **Phase 2** | Performance Optimization | Tuần 3-4  | 🟡 TRUNG BÌNH | ⏳ Chưa bắt đầu |
| **Phase 3** | Security & Compliance    | Tuần 5    | 🟢 THẤP       | ⏳ Chưa bắt đầu |
| **Phase 4** | Documentation & Testing  | Tuần 6    | 🟢 THẤP       | ⏳ Chưa bắt đầu |

---

## 🔴 PHASE 1: CRITICAL BUSINESS LOGIC (Tuần 1-2)

**Mục tiêu:** Fix các lỗ hổng nghiệp vụ quan trọng ảnh hưởng đến tài chính và doanh thu.

---

### **📦 Task 1.1: Tax Snapshot cho Order Items**

**Ưu tiên:** 🔴 **CAO NHẤT**  
**Thời gian:** 2-3 ngày  
**Rủi ro nếu không làm:** Sai lệch kế toán, vi phạm compliance

#### **Bước 1.1.1: Tạo Migration Script**

**File:** `orchard-store-backend/src/main/resources/db/migration/V4__add_tax_snapshot_to_order_items.sql`

```sql
-- ============================================================================
-- V4: Add Tax Snapshot to Order Items
-- ============================================================================
-- Mục đích: Lưu tax rate và tax amount tại thời điểm mua để đảm bảo tính chính xác kế toán

-- Thêm các cột tax snapshot vào order_items
ALTER TABLE order_items
ADD COLUMN tax_rate DECIMAL(5,2),
ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN tax_class_id BIGINT,
ADD COLUMN tax_class_name VARCHAR(100);

-- ⭐ REFINEMENT: Thêm tax_breakdown JSON vào orders (header)
-- Mục đích: Lưu snapshot toàn bộ cấu trúc thuế phức tạp (VAT + Special Tax, etc.)
ALTER TABLE orders
ADD COLUMN tax_breakdown JSONB;

COMMENT ON COLUMN orders.tax_breakdown IS 'Complete tax structure snapshot at time of purchase (for complex tax scenarios)';

-- Index cho reporting
CREATE INDEX idx_order_items_tax_rate ON order_items(tax_rate);
CREATE INDEX idx_order_items_tax_class ON order_items(tax_class_id);

-- Comment
COMMENT ON COLUMN order_items.tax_rate IS 'Tax rate at time of purchase (snapshot)';
COMMENT ON COLUMN order_items.tax_amount IS 'Tax amount calculated at time of purchase';
COMMENT ON COLUMN order_items.tax_class_id IS 'Tax class ID at time of purchase';
COMMENT ON COLUMN order_items.tax_class_name IS 'Tax class name at time of purchase';

-- Backfill dữ liệu cũ (nếu có)
-- Lấy tax rate từ product_variants.tax_class_id
UPDATE order_items oi
SET
    tax_class_id = pv.tax_class_id,
    tax_rate = tc.rate,
    tax_class_name = tc.name,
    tax_amount = oi.subtotal * COALESCE(tc.rate, 0) / 100
FROM product_variants pv
LEFT JOIN tax_classes tc ON tc.id = pv.tax_class_id
WHERE oi.product_variant_id = pv.id
AND oi.tax_rate IS NULL;
```

**Checklist:**

- [ ] Tạo file migration
- [ ] Test migration trên database dev
- [ ] Verify backfill data chính xác
- [ ] Commit migration

#### **Bước 1.1.2: Update Backend Entity**

**File:** `orchard-store-backend/.../order/entity/OrderItem.java`

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    // ... existing fields ...

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "tax_class_id")
    private Long taxClassId;

    @Column(name = "tax_class_name", length = 100)
    private String taxClassName;

    // Getters & Setters
}
```

**Checklist:**

- [ ] Thêm fields vào entity
- [ ] Update getters/setters
- [ ] Test entity mapping

#### **Bước 1.1.3: Update Service Logic**

**File:** `orchard-store-backend/.../order/service/OrderService.java`

```java
@Transactional
public Order createOrder(OrderCreateRequest request) {
    Order order = new Order();
    // ... existing order setup ...

    List<OrderItem> items = new ArrayList<>();
    for (OrderItemRequest itemRequest : request.getItems()) {
        ProductVariant variant = variantRepository.findById(itemRequest.getVariantId())
            .orElseThrow();

        OrderItem item = new OrderItem();
        item.setProductVariant(variant);
        item.setQuantity(itemRequest.getQuantity());
        item.setUnitPrice(variant.getPrice());

        // ⭐ SNAPSHOT TAX tại thời điểm mua
        if (variant.getTaxClass() != null) {
            TaxClass taxClass = variant.getTaxClass();
            item.setTaxRate(taxClass.getRate());
            item.setTaxClassId(taxClass.getId());
            item.setTaxClassName(taxClass.getName());

            BigDecimal subtotal = variant.getPrice()
                .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            BigDecimal taxAmount = subtotal
                .multiply(taxClass.getRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            item.setTaxAmount(taxAmount);
        }
    }

    // ⭐ REFINEMENT: Lưu tax_breakdown JSON vào order header
    Map<String, Object> taxBreakdown = new HashMap<>();
    taxBreakdown.put("currency", "VND");
    taxBreakdown.put("items", items.stream()
        .filter(item -> item.getTaxClassId() != null)
        .map(item -> {
            Map<String, Object> itemTax = new HashMap<>();
            itemTax.put("tax_class_id", item.getTaxClassId());
            itemTax.put("tax_class_name", item.getTaxClassName());
            itemTax.put("tax_rate", item.getTaxRate());
            itemTax.put("tax_amount", item.getTaxAmount());
            return itemTax;
        })
        .collect(Collectors.toList())
    );
    order.setTaxBreakdown(taxBreakdown); // Lưu JSON snapshot

        items.add(item);
    }

    order.setItems(items);
    return orderRepository.save(order);
}
```

**Checklist:**

- [ ] Update OrderService.createOrder()
- [ ] Test tạo order với tax snapshot
- [ ] Verify tax_amount tính đúng
- [ ] Test với variant không có tax_class

#### **Bước 1.1.4: Testing**

**Test Cases:**

- [ ] Tạo order với tax rate 10% → Verify tax_amount đúng
- [ ] Thay đổi tax rate sau khi tạo order → Verify order cũ không đổi
- [ ] In lại hóa đơn order cũ → Verify tax rate vẫn đúng
- [ ] Order với variant không có tax → Verify tax_amount = 0

**Checklist:**

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing trên staging

---

### **📦 Task 1.2: Refunds & Refund Items**

**Ưu tiên:** 🔴 **CAO**  
**Thời gian:** 3-4 ngày  
**Rủi ro nếu không làm:** Không track được item nào trả lại, báo cáo sai

#### **Bước 1.2.1: Tạo Migration Script**

**File:** `orchard-store-backend/src/main/resources/db/migration/V5__add_refunds_tables.sql`

```sql
-- ============================================================================
-- V5: Add Refunds & Refund Items Tables
-- ============================================================================
-- Mục đích: Track chi tiết hoàn tiền theo từng item

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
CREATE INDEX idx_refunds_refund_number ON refunds(refund_number);

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
ALTER TABLE refunds
ADD CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id),
ADD CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
ADD CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users(id);

ALTER TABLE refund_items
ADD CONSTRAINT fk_refund_items_refund FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_refund_items_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id),
ADD CONSTRAINT fk_refund_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
ADD CONSTRAINT fk_refund_items_warehouse FOREIGN KEY (restocked_warehouse_id) REFERENCES warehouses(id);

-- ⚠️ TECHNICAL GOTCHA: Không dùng trigger generate_refund_number
-- Vấn đề: NEW.id chưa được sinh ra trong BEFORE INSERT → NULL
-- Giải pháp: Generate trong Java code (xem Technical Gotchas section)
--
-- Nếu muốn dùng trigger, phải dùng SEQUENCE:
-- CREATE SEQUENCE refund_number_seq START 1;
-- CREATE OR REPLACE FUNCTION generate_refund_number()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF NEW.refund_number IS NULL OR NEW.refund_number = '' THEN
--         NEW.refund_number := 'REF-' ||
--             TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' ||
--             LPAD(nextval('refund_number_seq')::TEXT, 6, '0');
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
```

**Checklist:**

- [ ] Tạo file migration
- [ ] Test migration trên database dev
- [ ] Verify constraints hoạt động
- [ ] Commit migration

#### **Bước 1.2.2: Tạo Entities**

**Files:**

- `orchard-store-backend/.../order/entity/Refund.java`
- `orchard-store-backend/.../order/entity/RefundItem.java`

**Checklist:**

- [ ] Tạo Refund entity
- [ ] Tạo RefundItem entity
- [ ] Setup relationships
- [ ] Test entity mapping

#### **Bước 1.2.3: Tạo Repositories**

**Files:**

- `orchard-store-backend/.../order/repository/RefundRepository.java`
- `orchard-store-backend/.../order/repository/RefundItemRepository.java`

**Checklist:**

- [ ] Tạo repositories
- [ ] Thêm custom queries nếu cần
- [ ] Test repositories

#### **Bước 1.2.4: Tạo Service & Controller**

**Files:**

- `orchard-store-backend/.../order/service/RefundService.java`
- `orchard-store-backend/.../order/controller/RefundController.java`

**Code Example:**

```java
@Service
@Transactional
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ⚠️ TECHNICAL GOTCHA: Generate refund number trong Java (không dùng trigger)
    @Transactional
    public Refund createRefund(RefundCreateRequest request) {
        Refund refund = new Refund();
        refund.setOrderId(request.getOrderId());
        refund.setRefundType(request.getRefundType());
        refund.setTotalRefundAmount(request.getTotalRefundAmount());
        refund.setRefundReason(request.getReason());

        // ⭐ Generate refund number trong Java
        refund.setRefundNumber(generateRefundNumber());

        Refund savedRefund = refundRepository.save(refund);

        // Create refund items
        for (RefundItemRequest itemRequest : request.getItems()) {
            RefundItem item = new RefundItem();
            item.setRefundId(savedRefund.getId());
            item.setOrderItemId(itemRequest.getOrderItemId());
            item.setProductVariantId(itemRequest.getVariantId());
            item.setQuantity(itemRequest.getQuantity());
            item.setRefundAmount(itemRequest.getRefundAmount());
            item.setReason(itemRequest.getReason());
            refundItemRepository.save(item);
        }

        return savedRefund;
    }

    private String generateRefundNumber() {
        String datePrefix = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Option 1: Dùng sequence trong DB
        Long sequence = jdbcTemplate.queryForObject(
            "SELECT nextval('refund_number_seq')",
            Long.class
        );

        // Option 2: Dùng Redis INCR (nếu có Redis)
        // Long sequence = redisTemplate.opsForValue()
        //     .increment("refund:sequence:" + datePrefix);

        return String.format("REF-%s-%06d", datePrefix, sequence);
    }
}
```

**Migration Script (Tạo sequence):**

```sql
-- Thêm vào V5__add_refunds_tables.sql
CREATE SEQUENCE refund_number_seq START 1;
```

**Checklist:**

- [ ] Tạo sequence refund_number_seq
- [ ] Implement createRefund() với generateRefundNumber()
- [ ] Implement processRefund()
- [ ] Implement restockItems()
- [ ] Test service logic
- [ ] Test generateRefundNumber() unique
- [ ] Create API endpoints
- [ ] Test API

#### **Bước 1.2.5: Testing**

**Test Cases:**

- [ ] Tạo refund cho 1 item → Verify refund_items có 1 record
- [ ] Tạo refund cho toàn bộ order → Verify refund_type = 'FULL'
- [ ] Restock item sau refund → Verify restocked = true
- [ ] Báo cáo doanh thu sau refund → Verify trừ đúng item

**Checklist:**

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

---

### **📦 Task 1.3: Stock Reservations**

**Ưu tiên:** 🔴 **CAO**  
**Thời gian:** 3-4 ngày  
**Rủi ro nếu không làm:** Mất doanh thu do "ghost stock"

#### **Bước 1.3.1: Tạo Migration Script**

**File:** `orchard-store-backend/src/main/resources/db/migration/V6__add_stock_reservations.sql`

```sql
-- ============================================================================
-- V6: Add Stock Reservations Table
-- ============================================================================
-- Mục đích: Quản lý reserve stock với expiration để tránh "ghost stock"

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
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);

-- Foreign keys
ALTER TABLE stock_reservations
ADD CONSTRAINT fk_stock_reservations_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
ADD CONSTRAINT fk_stock_reservations_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);

-- ⚠️ REFINEMENT: Không dùng function tính SUM() realtime (chậm khi traffic cao)
-- Thay vào đó, dùng trigger để sync reserved_quantity vào warehouse_stock
-- Xem trigger bên dưới

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

-- ⭐ REFINEMENT: Trigger sync reserved_quantity vào warehouse_stock
-- Mục đích: Tránh phải SUM() realtime, chỉ cần đọc (quantity - reserved_quantity)
CREATE OR REPLACE FUNCTION sync_reserved_quantity_to_warehouse_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        -- Tăng reserved_quantity khi tạo reservation mới
        UPDATE warehouse_stock
        SET reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
        WHERE product_variant_id = NEW.product_variant_id
        AND warehouse_id = NEW.warehouse_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Giảm reserved_quantity khi reservation expired/released
        IF OLD.status = 'ACTIVE' AND NEW.status IN ('EXPIRED', 'RELEASED', 'CONSUMED') THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
            WHERE product_variant_id = OLD.product_variant_id
            AND warehouse_id = OLD.warehouse_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        -- Giảm reserved_quantity khi xóa reservation
        UPDATE warehouse_stock
        SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
        WHERE product_variant_id = OLD.product_variant_id
        AND warehouse_id = OLD.warehouse_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_reserved_quantity
AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
FOR EACH ROW
EXECUTE FUNCTION sync_reserved_quantity_to_warehouse_stock();
```

**Checklist:**

- [ ] Tạo file migration
- [ ] Test functions
- [ ] Verify indexes
- [ ] Commit migration

#### **Bước 1.3.2: Tạo Entity & Repository**

**Files:**

- `orchard-store-backend/.../inventory/entity/StockReservation.java`
- `orchard-store-backend/.../inventory/repository/StockReservationRepository.java`

**Checklist:**

- [ ] Tạo entity
- [ ] Tạo repository
- [ ] Thêm query methods
- [ ] Test repository

#### **Bước 1.3.3: Update Cart Service**

**File:** `orchard-store-backend/.../cart/service/CartService.java`

```java
// ⚠️ THAY ĐỔI: KHÔNG reserve khi add to cart
public void addToCart(Long variantId, Integer quantity, String sessionId) {
    // Chỉ lưu vào carts, KHÔNG reserve stock
    Cart cart = new Cart();
    cart.setProductVariantId(variantId);
    cart.setQuantity(quantity);
    cart.setSessionId(sessionId);
    cart.setExpiresAt(LocalDateTime.now().plusDays(7));
    cartRepository.save(cart);
}

// ⭐ MỚI: Reserve khi bắt đầu checkout
// ⚠️ TECHNICAL GOTCHA: Phải dùng pessimistic lock để tránh race condition
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void reserveStockForCheckout(Long variantId, Long warehouseId, Integer quantity, Long cartId) {
    // Lock row trước khi đọc (SELECT FOR UPDATE)
    WarehouseStock stock = warehouseStockRepository
        .findByProductVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
        .orElseThrow(() -> new InsufficientStockException());

    // Check available (đã có reserved_quantity sync từ trigger)
    int available = stock.getQuantity() - stock.getReservedQuantity();
    if (available < quantity) {
        throw new InsufficientStockException();
    }

    StockReservation reservation = new StockReservation();
    reservation.setProductVariantId(variantId);
    reservation.setWarehouseId(warehouseId);
    reservation.setReservationType("CHECKOUT");
    reservation.setReferenceId(cartId);
    reservation.setQuantity(quantity);
    reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // TTL 15 phút
    reservation.setStatus("ACTIVE");
    stockReservationRepository.save(reservation);
    // ⭐ Trigger sẽ tự động sync reserved_quantity vào warehouse_stock
}

// ⭐ MỚI: Get available stock (dùng reserved_quantity đã sync)
public Integer getAvailableStock(Long variantId, Long warehouseId) {
    WarehouseStock stock = warehouseStockRepository
        .findByProductVariantIdAndWarehouseId(variantId, warehouseId)
        .orElseThrow();

    // ⚡ NHANH: Chỉ cần phép trừ đơn giản, không cần SUM()
    return stock.getQuantity() - stock.getReservedQuantity();
}
```

**Repository Method (FOR UPDATE):**

```java
@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {

    // ⚠️ TECHNICAL GOTCHA: Phải dùng FOR UPDATE để lock row
    @Query(value = "SELECT * FROM warehouse_stock " +
                   "WHERE product_variant_id = :variantId AND warehouse_id = :warehouseId " +
                   "FOR UPDATE", nativeQuery = true)
    Optional<WarehouseStock> findByProductVariantIdAndWarehouseIdForUpdate(
        @Param("variantId") Long variantId,
        @Param("warehouseId") Long warehouseId
    );
}
```

**Checklist:**

- [ ] Thêm repository method với FOR UPDATE
- [ ] Update CartService.addToCart() - Bỏ reserve
- [ ] Thêm reserveStockForCheckout() với pessimistic lock
- [ ] Thêm getAvailableStock() dùng reserved_quantity
- [ ] Update checkout flow
- [ ] Test logic
- [ ] Test concurrent requests (100 requests)
- [ ] Verify trigger sync hoạt động

#### **Bước 1.3.4: Setup ShedLock (Distributed Lock)**

**File:** `orchard-store-backend/.../config/SchedulerConfig.java`

```java
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class SchedulerConfig {

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(dataSource);
    }
}
```

**Dependency (pom.xml):**

```xml
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-spring</artifactId>
    <version>5.10.0</version>
</dependency>
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-provider-jdbc-template</artifactId>
    <version>5.10.0</version>
</dependency>
```

**Migration Script (Thêm vào V6):**

```sql
-- ShedLock table (tự động tạo hoặc tạo thủ công)
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL PRIMARY KEY,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL
);
```

**Checklist:**

- [ ] Add ShedLock dependencies
- [ ] Create SchedulerConfig
- [ ] Create shedlock table (hoặc để ShedLock tự tạo)
- [ ] Test ShedLock hoạt động

#### **Bước 1.3.5: Tạo Scheduled Job**

**File:** `orchard-store-backend/.../inventory/scheduler/StockReservationScheduler.java`

```java
@Component
@Slf4j
public class StockReservationScheduler {

    @Autowired
    private StockReservationRepository reservationRepository;

    // ⚠️ TECHNICAL GOTCHA: Phải dùng @SchedulerLock để tránh double execution khi deploy multi-server
    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    @SchedulerLock(name = "releaseExpiredReservations",
                   lockAtMostFor = "5m",
                   lockAtLeastFor = "1m")
    public void releaseExpiredReservations() {
        log.info("Releasing expired stock reservations...");

        int released = reservationRepository.releaseExpired();

        if (released > 0) {
            log.info("Released {} expired reservations", released);
        }
    }
}
```

**Checklist:**

- [ ] Tạo scheduler class với @SchedulerLock
- [ ] Test scheduler với 1 server
- [ ] Test scheduler với 2 servers (verify chỉ 1 chạy)
- [ ] Monitor logs
- [ ] Verify shedlock table được update

#### **Bước 1.3.6: Testing**

**Test Cases:**

- [ ] Add to cart → Verify KHÔNG reserve stock
- [ ] Start checkout → Verify reserve stock với TTL 15 phút
- [ ] Expire reservation → Verify tự động release sau 15 phút
- [ ] Complete order → Verify reservation status = 'CONSUMED'

**Checklist:**

- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing (100 concurrent checkouts)

---

## 🟡 PHASE 2: PERFORMANCE OPTIMIZATION (Tuần 3-4)

**Mục tiêu:** Tối ưu performance cho các query thường xuyên.

---

### **📦 Task 2.1: Product Stats Cache**

**Ưu tiên:** 🟡 **TRUNG BÌNH**  
**Thời gian:** 2-3 ngày

#### **Bước 2.1.1: Tạo Migration Script**

**File:** `V7__add_product_stats.sql`

**Checklist:**

- [ ] Tạo bảng product_stats
- [ ] Tạo triggers tự động update
- [ ] Test triggers
- [ ] Commit migration

#### **Bước 2.1.2: Tạo Scheduled Job cho total_sold**

**File:** `orchard-store-backend/.../product/scheduler/ProductStatsScheduler.java`

```java
@Component
@Slf4j
public class ProductStatsScheduler {

    @Autowired
    private ProductStatsRepository productStatsRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ⚠️ TECHNICAL GOTCHA: Phải dùng @SchedulerLock để tránh double execution khi deploy multi-server
    // Chạy mỗi 10-30 phút để update total_sold
    @Scheduled(fixedRate = 600000) // 10 phút
    @SchedulerLock(name = "updateProductSoldCount",
                   lockAtMostFor = "15m",
                   lockAtLeastFor = "5m")
    public void updateProductSoldCount() {
        log.info("Updating product sold counts...");

        // Tính total_sold cho các sản phẩm có đơn hàng mới trong 30 phút qua
        List<ProductStats> stats = orderRepository.calculateProductSoldCounts(
            LocalDateTime.now().minusMinutes(30)
        );

        for (ProductStats stat : stats) {
            productStatsRepository.updateSoldCount(
                stat.getProductId(),
                stat.getTotalSold()
            );
        }

        log.info("Updated {} products", stats.size());
    }
}
```

**Checklist:**

- [ ] Tạo scheduler class
- [ ] Implement calculateProductSoldCounts() query
- [ ] Test scheduler
- [ ] Monitor performance

#### **Bước 2.1.3: Update Product Listing Query**

**File:** `ProductService.getProducts()`

**Checklist:**

- [ ] Thay đổi query JOIN với product_stats
- [ ] Verify performance improvement
- [ ] Test pagination

---

### **📦 Task 2.2: Promotion Refactor**

**Ưu tiên:** 🟡 **TRUNG BÌNH**  
**Thời gian:** 3-4 ngày

#### **Bước 2.2.1: Tạo Migration Script**

**File:** `V8__refactor_promotion_applicable.sql`

**Checklist:**

- [ ] Tạo bảng promotion_applicable_products
- [ ] Tạo bảng promotion_applicable_categories
- [ ] Tạo bảng promotion_applicable_brands
- [ ] Migrate data từ JSONB
- [ ] Test migration

#### **Bước 2.2.2: Update Promotion Service**

**File:** `PromotionService.findApplicablePromotions()`

**Checklist:**

- [ ] Refactor query dùng bảng mới
- [ ] Test performance
- [ ] Verify kết quả đúng

---

## 🟢 PHASE 3: SECURITY & COMPLIANCE (Tuần 5)

**Mục tiêu:** Đảm bảo tuân thủ quy định bảo vệ dữ liệu.

---

### **📦 Task 3.1: Data Masking Policy**

**Ưu tiên:** 🟢 **THẤP**  
**Thời gian:** 1-2 ngày

#### **Bước 3.1.1: Tạo Policy Document**

**File:** `docs/DATA_PROTECTION_POLICY.md`

**Checklist:**

- [ ] Viết policy
- [ ] Review với team
- [ ] Publish policy

#### **Bước 3.1.2: Code Review**

**Checklist:**

- [ ] Review tất cả chỗ lưu notes/description
- [ ] Remove PII nếu có
- [ ] Add validation nếu cần

---

## 🟢 PHASE 4: DOCUMENTATION & TESTING (Tuần 6)

**Mục tiêu:** Hoàn thiện documentation và testing.

---

### **📦 Task 4.1: Update Documentation**

**Checklist:**

- [ ] Update API documentation
- [ ] Update database schema docs
- [ ] Create migration guide
- [ ] Update README

### **📦 Task 4.2: Comprehensive Testing**

**Checklist:**

- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing

---

## 📊 TRACKING PROGRESS

### **Progress Tracker**

| Task               | Phase | Status         | Assigned To | Due Date | Notes |
| ------------------ | ----- | -------------- | ----------- | -------- | ----- |
| Tax Snapshot       | 1     | ⏳ Not Started | -           | -        | -     |
| Refunds            | 1     | ⏳ Not Started | -           | -        | -     |
| Stock Reservations | 1     | ⏳ Not Started | -           | -        | -     |
| Product Stats      | 2     | ⏳ Not Started | -           | -        | -     |
| Promotion Refactor | 2     | ⏳ Not Started | -           | -        | -     |
| Data Masking       | 3     | ⏳ Not Started | -           | -        | -     |

**Legend:**

- ⏳ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked
- 🔄 In Review

---

## 🚨 ROLLBACK PLAN

### **Nếu Migration Fail**

1. **Stop application**
2. **Rollback migration:**
   ```sql
   -- Example: Rollback V4
   ALTER TABLE order_items
   DROP COLUMN tax_rate,
   DROP COLUMN tax_amount,
   DROP COLUMN tax_class_id,
   DROP COLUMN tax_class_name;
   ```
3. **Restore backup** (nếu cần)
4. **Investigate issue**
5. **Fix migration script**
6. **Retry migration**

### **Backup Strategy**

- [ ] Backup database trước mỗi migration
- [ ] Test restore process
- [ ] Document backup location

---

## 📝 NOTES & DECISIONS

### **Decisions Made**

- **Tax Snapshot:** Quyết định lưu snapshot thay vì join real-time
- **Stock Reservations:** Quyết định dùng bảng riêng thay vì Redis
- **Promotion Refactor:** Quyết định migrate từ JSONB sang bảng

### **Refinements Applied** ⭐

#### **A. Stock Reservations Performance**

**Vấn đề:** Function `calculate_available_stock()` dùng SUM() realtime → Chậm khi traffic cao

**Giải pháp:**

- ✅ Giữ lại `reserved_quantity` trong `warehouse_stock`
- ✅ Dùng trigger sync từ `stock_reservations` → `warehouse_stock.reserved_quantity`
- ✅ Query: `available = quantity - reserved_quantity` (phép trừ đơn giản, cực nhanh)

**Lợi ích:**

- ⚡ Performance: Không cần SUM() mỗi lần query
- 📊 Scalability: Hoạt động tốt với hàng triệu reservations

#### **B. Product Stats Deadlock Prevention**

**Vấn đề:** 100 transaction cùng UPDATE `product_stats.total_sold` → Deadlock

**Giải pháp:**

- ✅ `total_reviews/rating`: Dùng trigger (OK vì review ít khi dồn dập)
- ✅ `total_sold`: Dùng scheduled job (10-30 phút/lần)
- ✅ User thấy "Đã bán 1.2k" là đủ, không cần chính xác từng giây

**Lợi ích:**

- 🔒 Tránh deadlock
- ⚡ Giảm lock contention
- 📈 Better scalability

#### **C. Tax Breakdown JSON**

**Vấn đề:** Tax có thể phức tạp (VAT + Special Tax), cần snapshot toàn bộ cấu trúc

**Giải pháp:**

- ✅ Thêm `tax_breakdown JSONB` vào bảng `orders`
- ✅ Lưu snapshot toàn bộ object tax tại thời điểm mua
- ✅ Hỗ trợ truy vết khi luật thuế thay đổi

**Lợi ích:**

- 📋 Audit trail đầy đủ
- 🌍 Hỗ trợ tax phức tạp (multi-tier tax)
- 🔍 Dễ truy vết khi có thay đổi

### **Open Questions**

- [ ] Có cần support multi-currency ngay không?
- [ ] Có cần audit log cho refunds không?
- [ ] TTL cho stock reservations nên là bao nhiêu?

---

## ✅ COMPLETION CHECKLIST

### **Pre-Migration**

- [ ] Review tất cả migration scripts
- [ ] Test trên database dev
- [ ] Backup production database
- [ ] Schedule maintenance window
- [ ] Notify team

### **Post-Migration**

- [ ] Verify data integrity
- [ ] Run smoke tests
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Deploy backend code

---

## ⚠️ TECHNICAL GOTCHAS - Các Vấn Đề Kỹ Thuật Khi Code

**Lưu ý:** Các vấn đề này chỉ phát hiện khi code thực tế, cần lưu ý ngay từ đầu.

---

### **🔴 A. Distributed Lock cho Scheduler (Multi-Server Deployment)**

**Vấn đề:**

Khi deploy Backend lên **2+ server** (load balancing), mỗi server sẽ chạy `@Scheduled` job riêng → **Double execution**.

**Kịch bản:**

```java
// Server 1 và Server 2 cùng chạy job này
@Scheduled(fixedRate = 60000)
public void releaseExpiredReservations() {
    // → Cả 2 server cùng release → Double counting
    // → Cả 2 server cùng update product_stats → Deadlock
}
```

**Rủi ro:**

- ❌ **Double counting:** Update dữ liệu 2 lần
- ❌ **Deadlock:** 2 server cùng update 1 row
- ❌ **Email spam:** Gửi email 2 lần

**Giải pháp: ShedLock** ⭐

```xml
<!-- pom.xml -->
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-spring</artifactId>
    <version>5.10.0</version>
</dependency>
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-provider-jdbc-template</artifactId>
    <version>5.10.0</version>
</dependency>
```

```java
// Configuration
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class SchedulerConfig {

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(dataSource);
    }
}

// Scheduler với ShedLock
@Component
@Slf4j
public class StockReservationScheduler {

    @Scheduled(fixedRate = 60000)
    @SchedulerLock(name = "releaseExpiredReservations",
                   lockAtMostFor = "5m",
                   lockAtLeastFor = "1m")
    public void releaseExpiredReservations() {
        // Chỉ 1 server được chạy job này tại 1 thời điểm
        log.info("Releasing expired stock reservations...");
        // ...
    }
}
```

**Migration Script:**

```sql
-- ShedLock tự động tạo bảng này khi chạy lần đầu
-- Hoặc tạo thủ công:
CREATE TABLE shedlock (
    name VARCHAR(64) NOT NULL PRIMARY KEY,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL
);
```

**Checklist:**

- [ ] Add ShedLock dependency
- [ ] Create SchedulerConfig
- [ ] Add @SchedulerLock annotation
- [ ] Test với 2 server instances
- [ ] Verify chỉ 1 server chạy job

---

### **🔴 B. Lỗi Logic trong Trigger generate_refund_number**

**Vấn đề:**

```sql
-- Trigger hiện tại (SAI)
CREATE FUNCTION generate_refund_number() AS $$
BEGIN
    -- ❌ NEW.id chưa được sinh ra trong BEFORE INSERT
    NEW.refund_number := 'REF-' || ... || LPAD(NEW.id::TEXT, 6, '0');
    -- → NEW.id = NULL → Kết quả: REF-20250115-000000
END;
$$;
```

**Rủi ro:**

- ❌ Mã refund bị lỗi: `REF-20250115-000000`
- ❌ Không unique (nhiều refund cùng mã)
- ❌ Khó debug

**Giải pháp: Dùng SEQUENCE hoặc Java Code** ⭐

#### **Option 1: Dùng SEQUENCE (Database)**

```sql
-- Tạo sequence riêng
CREATE SEQUENCE refund_number_seq START 1;

-- Function dùng sequence
CREATE OR REPLACE FUNCTION generate_refund_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.refund_number IS NULL OR NEW.refund_number = '' THEN
        NEW.refund_number := 'REF-' ||
            TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' ||
            LPAD(nextval('refund_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### **Option 2: Java Code (Khuyến nghị)** ⭐

```java
@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    @Transactional
    public Refund createRefund(RefundCreateRequest request) {
        Refund refund = new Refund();
        refund.setOrderId(request.getOrderId());
        // ... setup refund ...

        // ⭐ Generate refund number trong Java (có thể control tốt hơn)
        refund.setRefundNumber(generateRefundNumber());

        return refundRepository.save(refund);
    }

    private String generateRefundNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long sequence = getNextRefundSequence(); // Query từ DB hoặc Redis
        return String.format("REF-%s-%06d", datePrefix, sequence);
    }

    private Long getNextRefundSequence() {
        // Option 1: Dùng sequence trong DB
        return jdbcTemplate.queryForObject("SELECT nextval('refund_number_seq')", Long.class);

        // Option 2: Dùng Redis INCR
        // return redisTemplate.opsForValue().increment("refund:sequence:" + today);
    }
}
```

**Khuyến nghị:** Option 2 (Java Code) - Dễ test, dễ maintain, linh hoạt hơn.

**Checklist:**

- [ ] Xóa trigger generate_refund_number (hoặc để empty)
- [ ] Implement generateRefundNumber() trong Java
- [ ] Test tạo refund → Verify số unique
- [ ] Test concurrent requests → Verify không duplicate

---

### **🔴 C. Transaction Management cho Stock Reservation**

**Vấn đề:**

```java
// Code hiện tại (CÓ THỂ có race condition)
@Transactional
public void reserveStockForCheckout(Long variantId, Long warehouseId, Integer quantity) {
    StockReservation reservation = new StockReservation();
    reservation.setQuantity(quantity);
    stockReservationRepository.save(reservation);
    // → Trigger sẽ sync reserved_quantity
    // → Nhưng nếu 2 request cùng lúc → Có thể double reserve
}
```

**Rủi ro:**

- ❌ Race condition: 2 request cùng reserve → Over-reserve
- ❌ Available stock âm (nếu không có CHECK constraint)

**Giải pháp: Database Lock + CHECK Constraint** ⭐

```java
@Service
@Transactional
public class CartService {

    @Autowired
    private WarehouseStockRepository warehouseStockRepository;

    @Autowired
    private StockReservationRepository reservationRepository;

    // ⭐ Option 1: Pessimistic Lock (SELECT FOR UPDATE)
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void reserveStockForCheckout(Long variantId, Long warehouseId, Integer quantity, Long cartId) {
        // Lock row trước khi đọc
        WarehouseStock stock = warehouseStockRepository
            .findByProductVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
            .orElseThrow(() -> new InsufficientStockException());

        // Check available (đã có reserved_quantity sync từ trigger)
        int available = stock.getQuantity() - stock.getReservedQuantity();
        if (available < quantity) {
            throw new InsufficientStockException();
        }

        // Tạo reservation (trigger sẽ tự động sync reserved_quantity)
        StockReservation reservation = new StockReservation();
        reservation.setProductVariantId(variantId);
        reservation.setWarehouseId(warehouseId);
        reservation.setReservationType("CHECKOUT");
        reservation.setReferenceId(cartId);
        reservation.setQuantity(quantity);
        reservation.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        reservation.setStatus("ACTIVE");
        reservationRepository.save(reservation);
    }
}

// Repository method với FOR UPDATE
@Query(value = "SELECT * FROM warehouse_stock " +
               "WHERE product_variant_id = :variantId AND warehouse_id = :warehouseId " +
               "FOR UPDATE", nativeQuery = true)
WarehouseStock findByProductVariantIdAndWarehouseIdForUpdate(
    @Param("variantId") Long variantId,
    @Param("warehouseId") Long warehouseId
);
```

**CHECK Constraint (Bảo vệ cuối cùng):**

```sql
-- Migration: V6__add_stock_reservations.sql (Updated)

-- Đảm bảo reserved_quantity không vượt quá quantity
ALTER TABLE warehouse_stock
ADD CONSTRAINT chk_warehouse_stock_reserved
CHECK (reserved_quantity <= quantity);

-- Đảm bảo quantity không âm
ALTER TABLE warehouse_stock
ADD CONSTRAINT chk_warehouse_stock_quantity
CHECK (quantity >= 0);
```

**Checklist:**

- [ ] Thêm `FOR UPDATE` query method
- [ ] Update reserveStockForCheckout() với pessimistic lock
- [ ] Thêm CHECK constraints
- [ ] Test concurrent requests (100 requests cùng lúc)
- [ ] Verify không có over-reserve

---

## 📊 STOCK FLOW VISUALIZATION

**Sơ đồ luồng xử lý kho (Stock Flow) trong Phase 1.3:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK RESERVATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. USER ADDS TO CART
   ┌─────────────┐
   │  Frontend   │
   └──────┬──────┘
          │ POST /api/cart/add
          ▼
   ┌─────────────────────┐
   │  CartService         │
   │  addToCart()         │
   └──────┬───────────────┘
          │
          │ ❌ KHÔNG reserve stock
          ▼
   ┌─────────────────────┐
   │  carts table        │
   │  (session_id, ...)  │
   └─────────────────────┘

2. USER STARTS CHECKOUT
   ┌─────────────┐
   │  Frontend   │
   └──────┬──────┘
          │ POST /api/checkout/start
          ▼
   ┌─────────────────────────────────┐
   │  CartService                     │
   │  reserveStockForCheckout()       │
   │  @Transactional                 │
   │  SELECT ... FOR UPDATE           │
   └──────┬───────────────────────────┘
          │
          │ 1. Lock warehouse_stock row
          │ 2. Check available = quantity - reserved_quantity
          │ 3. If available >= quantity:
          │
          ▼
   ┌─────────────────────────────────┐
   │  stock_reservations table       │
   │  INSERT (status='ACTIVE',        │
   │          expires_at=+15min)     │
   └──────┬───────────────────────────┘
          │
          │ ⚡ TRIGGER: sync_reserved_quantity_to_warehouse_stock()
          │
          ▼
   ┌─────────────────────────────────┐
   │  warehouse_stock table          │
   │  UPDATE reserved_quantity      │
   │  SET reserved_quantity =       │
   │      reserved_quantity + NEW.quantity
   └─────────────────────────────────┘

3. USER COMPLETES PAYMENT
   ┌─────────────┐
   │  Frontend   │
   └──────┬──────┘
          │ POST /api/payment/confirm
          ▼
   ┌─────────────────────────────────┐
   │  OrderService                    │
   │  confirmPayment()                │
   └──────┬───────────────────────────┘
          │
          │ 1. Create order
          │ 2. Update stock_reservations:
          │    status = 'CONSUMED'
          │
          ▼
   ┌─────────────────────────────────┐
   │  stock_reservations table       │
   │  UPDATE status = 'CONSUMED'    │
   └──────┬───────────────────────────┘
          │
          │ ⚡ TRIGGER: sync_reserved_quantity_to_warehouse_stock()
          │
          ▼
   ┌─────────────────────────────────┐
   │  warehouse_stock table          │
   │  UPDATE reserved_quantity      │
   │  SET reserved_quantity =       │
   │      reserved_quantity - OLD.quantity
   │                                │
   │  UPDATE quantity               │
   │  SET quantity = quantity - OLD.quantity
   └─────────────────────────────────┘

4. SCHEDULED JOB (Every 1 minute)
   ┌─────────────────────────────────┐
   │  StockReservationScheduler       │
   │  @Scheduled(fixedRate=60000)     │
   │  @SchedulerLock                  │
   └──────┬───────────────────────────┘
          │
          │ SELECT * FROM stock_reservations
          │ WHERE status = 'ACTIVE'
          │ AND expires_at < NOW()
          │
          ▼
   ┌─────────────────────────────────┐
   │  stock_reservations table       │
   │  UPDATE status = 'EXPIRED'     │
   └──────┬───────────────────────────┘
          │
          │ ⚡ TRIGGER: sync_reserved_quantity_to_warehouse_stock()
          │
          ▼
   ┌─────────────────────────────────┐
   │  warehouse_stock table          │
   │  UPDATE reserved_quantity      │
   │  SET reserved_quantity =       │
   │      reserved_quantity - OLD.quantity
   └─────────────────────────────────┘

5. QUERY AVAILABLE STOCK (Fast!)
   ┌─────────────┐
   │  Frontend   │
   └──────┬──────┘
          │ GET /api/products/{id}/stock
          ▼
   ┌─────────────────────────────────┐
   │  ProductService                  │
   │  getAvailableStock()             │
   └──────┬───────────────────────────┘
          │
          │ ⚡ NHANH: Chỉ cần SELECT đơn giản
          │
          ▼
   ┌─────────────────────────────────┐
   │  warehouse_stock table          │
   │  SELECT                         │
   │    quantity - reserved_quantity │
   │  AS available                   │
   │  FROM warehouse_stock            │
   │  WHERE product_variant_id = ?  │
   └─────────────────────────────────┘
   │
   │ ✅ Không cần SUM() trên stock_reservations
   │ ✅ Response time < 1ms
```

**Key Points:**

- ✅ **Add to Cart:** KHÔNG reserve → Fast, no lock
- ✅ **Start Checkout:** Reserve với TTL 15 phút → Trigger sync reserved_quantity
- ✅ **Complete Payment:** Consume reservation → Trigger giảm reserved_quantity
- ✅ **Scheduled Job:** Release expired → Trigger giảm reserved_quantity
- ✅ **Query Stock:** Chỉ cần `quantity - reserved_quantity` → Cực nhanh

---

## 📚 TÀI LIỆU THAM KHẢO

### **Related Documents**

- **Risk Analysis:** Xem `docs/DATABASE_RISK_ANALYSIS.md` để hiểu chi tiết các rủi ro
- **Refinements Guide:** Các tối ưu hóa đã được tích hợp vào roadmap này

### **External Resources**

- [ShedLock Documentation](https://github.com/lukas-krecan/ShedLock)
- [PostgreSQL Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Spring Transaction Management](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Sau mỗi phase  
**Version:** 2.0 (Integrated with Technical Gotchas & Flow Visualization)
