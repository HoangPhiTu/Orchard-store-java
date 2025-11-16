# Database Schema Enhanced - Orchard Store E-Commerce Platform

## 🎯 Mục Tiêu: Tối Ưu Hóa Database Schema Đạt 95% Tính Năng So Với Orchard.vn

---

## 📊 ERD Overview (Enhanced - Simplified Authentication)

```
User (Admin/Staff) ──> Order Management (Admin only)

Customer (Email/Phone) ──┐
                         ├──> Order ──┬──> OrderItem ──> ProductVariant ──> Product
                         │            └──> VerificationCode (Email Verification)
                         ├──> CustomerLifetimeValue
                         └──> CustomerVipHistory

Customer ──> MemberPricingTier (VIP Tiers)

Product ──> Brand
Product ──> Category (hierarchical)
Product ──> ProductImage
Product ──> ProductVariant
Product ──> ProductAttributeValue (Dynamic Attributes System)
Product ──> ProductBundle (Bundling)
Product ──> ProductGift
Product ──> RelatedProduct
Product ──> ProductPriceHistory (Pricing Strategy)
Product ──> ProductView (Analytics)
Product ──> SEOUrl (SEO Optimization)

ProductAttribute ──> AttributeValue
Category ──> CategoryAttribute (Attribute assignment)
```

**Lưu ý:**
- Khách hàng KHÔNG cần đăng ký/đăng nhập
- Xác thực đơn hàng qua email với mã xác thực (verification_code)
- Tra cứu đơn hàng bằng verification_code + email
- User table chỉ dành cho Admin/Staff

---

## 🗄️ Database Tables (Enhanced)

### =============================================================================
### PHẦN 1: CORE ENTITIES (Cơ Bản)
### =============================================================================

### 1. **users** - Người dùng (Chỉ dành cho Admin/Staff)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'ADMIN', -- ADMIN, STAFF (Không có CUSTOMER)
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BANNED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**Lưu ý:** 
- Bảng `users` chỉ dành cho Admin/Staff quản lý hệ thống
- Khách hàng KHÔNG cần đăng ký tài khoản
- Thông tin khách hàng được lưu trong bảng `customers` khi đặt hàng

---

### 2. **brands** - Thương hiệu

```sql
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    country VARCHAR(100), -- Xuất xứ
    website_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_display_order ON brands(display_order);
```

---

### 3. **categories** - Danh mục (Hierarchical)

```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0, -- 0: root, 1: child, 2: grandchild
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_level ON categories(level);
```

---

### 4. **products** - Sản phẩm chính

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    brand_id BIGINT NOT NULL REFERENCES brands(id),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Giá (giá gốc, giá bán sẽ ở ProductVariant)
    base_price DECIMAL(15,2),
    base_sale_price DECIMAL(15,2),
    
    -- Thông tin hiển thị
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0, -- Số lượt xem
    
    -- Trạng thái
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED
    stock_status VARCHAR(20) DEFAULT 'IN_STOCK', -- IN_STOCK, OUT_OF_STOCK, LOW_STOCK
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    canonical_url VARCHAR(500), -- Canonical URL cho SEO
    
    -- Thông tin khác
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_hot BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    conversion_rate DECIMAL(5,2) DEFAULT 0.00, -- Tỷ lệ chuyển đổi
    last_viewed_at TIMESTAMP, -- Lần xem cuối cùng
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_sold_count ON products(sold_count DESC);
CREATE INDEX idx_products_view_count ON products(view_count DESC);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

---

### =============================================================================
### PHẦN 2: DYNAMIC ATTRIBUTES SYSTEM (Hệ Thống Thuộc Tính Động)
### =============================================================================

### 5. **product_attributes** - Định nghĩa thuộc tính sản phẩm

```sql
CREATE TABLE product_attributes (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core identification
    attribute_key VARCHAR(100) NOT NULL UNIQUE, -- "fragrance_group", "concentration", "gender"
    attribute_name VARCHAR(255) NOT NULL, -- "Nhóm hương", "Nồng độ", "Giới tính"
    attribute_name_en VARCHAR(255), -- English version for localization
    
    -- Attribute configuration
    attribute_type VARCHAR(50) NOT NULL, -- SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT
    data_type VARCHAR(50) DEFAULT 'STRING', -- STRING, NUMBER, DECIMAL, DATE, BOOLEAN
    is_filterable BOOLEAN DEFAULT TRUE, -- Hiển thị trong bộ lọc
    is_searchable BOOLEAN DEFAULT FALSE, -- Cho phép tìm kiếm
    is_required BOOLEAN DEFAULT FALSE, -- Bắt buộc khi tạo sản phẩm
    is_variant_specific BOOLEAN DEFAULT FALSE, -- Áp dụng cho variant (true) hay product (false)
    
    -- Display & UI
    display_order INTEGER DEFAULT 0,
    icon_class VARCHAR(100), -- CSS class for icons
    color_code VARCHAR(7), -- Hex color for visual representation
    
    -- Validation rules
    validation_rules JSONB, -- {min: 1, max: 5, pattern: null, options: [...]}
    
    -- Metadata
    description TEXT,
    help_text TEXT, -- Hướng dẫn cho người dùng
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
    
    -- Audit
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (attribute_type IN ('SELECT', 'MULTISELECT', 'RANGE', 'BOOLEAN', 'TEXT'))
);

CREATE INDEX idx_attributes_key ON product_attributes(attribute_key);
CREATE INDEX idx_attributes_type ON product_attributes(attribute_type);
CREATE INDEX idx_attributes_filterable ON product_attributes(is_filterable) WHERE is_filterable = true;
CREATE INDEX idx_attributes_status ON product_attributes(status);
CREATE INDEX idx_attributes_display_order ON product_attributes(display_order);
```

**Ví dụ Attributes:**
- `fragrance_group` (Nhóm hương): SELECT - Floral, Woody, Citrus, Oriental, Fresh
- `concentration` (Nồng độ): SELECT - EDP, EDT, Parfum, Cologne
- `gender` (Giới tính): SELECT - MALE, FEMALE, UNISEX
- `suitable_seasons` (Mùa sử dụng): MULTISELECT - Đông, Xuân, Hè, Thu
- `suitable_time` (Thời gian): MULTISELECT - Ngày, Đêm
- `longevity` (Độ lưu hương): RANGE - 1-12 giờ
- `sillage` (Độ tỏa hương): RANGE - 0.5-3 mét
- `top_notes`, `middle_notes`, `base_notes`: TEXT hoặc MULTISELECT

---

### 6. **attribute_values** - Giá trị của thuộc tính

```sql
CREATE TABLE attribute_values (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    
    -- Value definition
    value VARCHAR(255) NOT NULL, -- "floral", "edp", "female"
    display_value VARCHAR(255) NOT NULL, -- "Hoa", "Eau de Parfum", "Nữ"
    display_value_en VARCHAR(255), -- English display value
    
    -- Visual representation
    color_code VARCHAR(7), -- Màu hiển thị
    image_url VARCHAR(500), -- Ảnh đại diện (cho màu sắc, etc.)
    hex_color VARCHAR(7), -- Mã màu HEX
    
    -- Metadata
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE, -- Giá trị mặc định
    
    -- Search optimization
    search_keywords TEXT, -- Từ khóa tìm kiếm liên quan
    
    -- Audit
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(attribute_id, value)
);

CREATE INDEX idx_attribute_values_attribute ON attribute_values(attribute_id);
CREATE INDEX idx_attribute_values_display_order ON attribute_values(attribute_id, display_order);
CREATE INDEX idx_attribute_values_search ON attribute_values USING gin(to_tsvector('english', search_keywords));
CREATE INDEX idx_attribute_values_value ON attribute_values(value);
```

---

### 7. **product_attribute_values** - Gán thuộc tính cho sản phẩm

```sql
CREATE TABLE product_attribute_values (
    id BIGSERIAL PRIMARY KEY,
    
    -- Relationships
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_value_id BIGINT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
    
    -- Variant-specific attributes (optional)
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Custom value for text attributes
    custom_value TEXT, -- Cho attributes kiểu TEXT
    
    -- Display configuration
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE, -- Attribute chính để hiển thị
    
    -- Audit
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(product_id, attribute_value_id, product_variant_id),
    
    -- Check constraint: either product_id or product_variant_id must be set
    CHECK (
        (product_id IS NOT NULL AND product_variant_id IS NULL) OR 
        (product_variant_id IS NOT NULL)
    )
);

CREATE INDEX idx_prod_attr_values_product ON product_attribute_values(product_id);
CREATE INDEX idx_prod_attr_values_attr_value ON product_attribute_values(attribute_value_id);
CREATE INDEX idx_prod_attr_values_variant ON product_attribute_values(product_variant_id);
CREATE INDEX idx_prod_attr_values_primary ON product_attribute_values(is_primary) WHERE is_primary = true;

-- Composite index for fast filtering
CREATE INDEX idx_prod_attr_values_composite ON product_attribute_values(product_id, attribute_value_id);
```

---

### 8. **category_attributes** - Gán thuộc tính cho danh mục

```sql
CREATE TABLE category_attributes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, attribute_id)
);

CREATE INDEX idx_category_attributes_category ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_attribute ON category_attributes(attribute_id);
```

---

### =============================================================================
### PHẦN 3: PRODUCT VARIANTS & INVENTORY (Biến Thể & Kho Hàng)
### =============================================================================

### 9. **product_variants** - Biến thể sản phẩm

```sql
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL, -- "100 ml", "50 ml", "30 ml", "Mini"
    variant_type VARCHAR(50), -- SIZE, VOLUME, EDITION, COLOR
    sku VARCHAR(100) UNIQUE,
    
    -- Giá
    price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    member_price DECIMAL(15,2), -- Giá cho khách hàng thân thiết
    
    -- Kho hàng
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- Số lượng đã reserve (trong cart, pre-order)
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    stock_status VARCHAR(20) DEFAULT 'IN_STOCK', -- IN_STOCK, OUT_OF_STOCK, LOW_STOCK, PRE_ORDER
    low_stock_threshold INTEGER DEFAULT 10, -- Ngưỡng cảnh báo hết hàng
    
    -- Thông tin bổ sung
    volume_ml INTEGER,
    price_per_ml DECIMAL(10,2),
    sprays_count INTEGER,
    duration_months INTEGER,
    weight_grams DECIMAL(10,2), -- Trọng lượng (cho shipping)
    
    -- Trạng thái
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_status ON product_variants(status);
CREATE INDEX idx_variants_stock_status ON product_variants(stock_status);
CREATE INDEX idx_variants_available_qty ON product_variants(available_quantity) WHERE available_quantity > 0;
```

---

### 10. **inventory_transactions** - Lịch sử nhập/xuất kho

```sql
CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL, -- IN, OUT, ADJUSTMENT, RETURN, DAMAGED
    quantity INTEGER NOT NULL, -- Số lượng (dương cho IN, âm cho OUT)
    reference_type VARCHAR(50), -- ORDER, PURCHASE, ADJUSTMENT, RETURN
    reference_id BIGINT, -- ID của order, purchase order, etc.
    
    -- Stock before and after
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    
    -- Notes
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_trans_variant ON inventory_transactions(product_variant_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_created ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inv_trans_reference ON inventory_transactions(reference_type, reference_id);
```

---

### 11. **pre_orders** - Đặt hàng trước

```sql
CREATE TABLE pre_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Contact info
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Pre-order details
    expected_restock_date DATE, -- Ngày dự kiến có hàng
    notification_sent BOOLEAN DEFAULT FALSE, -- Đã gửi thông báo
    notification_sent_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, NOTIFIED, CONVERTED, CANCELLED
    converted_to_order_id BIGINT REFERENCES orders(id), -- Chuyển thành đơn hàng
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pre_orders_user ON pre_orders(user_id);
CREATE INDEX idx_pre_orders_variant ON pre_orders(product_variant_id);
CREATE INDEX idx_pre_orders_status ON pre_orders(status);
CREATE INDEX idx_pre_orders_restock_date ON pre_orders(expected_restock_date) WHERE status = 'PENDING';
```

---

### 12. **stock_alerts** - Cảnh báo tồn kho

```sql
CREATE TABLE stock_alerts (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    alert_type VARCHAR(20) NOT NULL, -- LOW_STOCK, OUT_OF_STOCK, RESTOCKED
    threshold_quantity INTEGER,
    current_quantity INTEGER,
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_alerts_variant ON stock_alerts(product_variant_id);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_notified ON stock_alerts(notified) WHERE notified = false;
```

---

### =============================================================================
### PHẦN 4: PRODUCT BUNDLING (Gói Sản Phẩm)
### =============================================================================

### 13. **product_bundles** - Gói sản phẩm

```sql
CREATE TABLE product_bundles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Bundle pricing
    bundle_price DECIMAL(15,2) NOT NULL, -- Giá gói
    original_total_price DECIMAL(15,2), -- Tổng giá gốc nếu mua lẻ
    discount_amount DECIMAL(15,2), -- Số tiền giảm
    discount_percentage DECIMAL(5,2), -- % giảm giá
    
    -- Bundle type
    bundle_type VARCHAR(50) NOT NULL, -- CURATED_SET, GIFT_PACKAGE, COMBO_DEAL, SEASONAL_SET
    is_customizable BOOLEAN DEFAULT FALSE, -- Cho phép tùy chỉnh
    
    -- Display
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    
    -- Validity
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bundles_slug ON product_bundles(slug);
CREATE INDEX idx_bundles_type ON product_bundles(bundle_type);
CREATE INDEX idx_bundles_status ON product_bundles(status);
CREATE INDEX idx_bundles_dates ON product_bundles(start_date, end_date);
```

---

### 14. **bundle_items** - Sản phẩm trong gói

```sql
CREATE TABLE bundle_items (
    id BIGSERIAL PRIMARY KEY,
    bundle_id BIGINT NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_variant_id BIGINT REFERENCES product_variants(id),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE, -- Bắt buộc hay optional
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bundle_id, product_id, product_variant_id)
);

CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON bundle_items(product_id);
```

---

### =============================================================================
### PHẦN 5: PRICING STRATEGY (Chiến Lược Giá)
### =============================================================================

### 15. **product_price_history** - Lịch sử giá

```sql
CREATE TABLE product_price_history (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    
    -- Price details
    price DECIMAL(15,2) NOT NULL, -- Giá gốc
    sale_price DECIMAL(15,2), -- Giá khuyến mãi
    member_price DECIMAL(15,2), -- Giá thành viên
    
    -- Change tracking
    price_change_type VARCHAR(20), -- INCREASE, DECREASE, PROMOTION, REGULAR
    previous_price DECIMAL(15,2), -- Giá trước đó
    change_amount DECIMAL(15,2), -- Số tiền thay đổi
    change_percentage DECIMAL(5,2), -- % thay đổi
    
    -- Promotion info
    promotion_id BIGINT REFERENCES promotions(id),
    promotion_name VARCHAR(255),
    
    -- Validity
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    
    -- Audit
    changed_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_variant ON product_price_history(product_variant_id);
CREATE INDEX idx_price_history_effective ON product_price_history(effective_from, effective_to);
CREATE INDEX idx_price_history_promotion ON product_price_history(promotion_id);
CREATE INDEX idx_price_history_created ON product_price_history(created_at DESC);
```

---

### 16. **member_pricing_tiers** - Bậc giá thành viên (VIP Tiers)

```sql
CREATE TABLE member_pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL UNIQUE, -- "STANDARD", "SILVER", "GOLD", "PLATINUM", "DIAMOND"
    tier_display_name VARCHAR(255), -- "Standard", "Silver", "Gold", "Platinum", "Diamond"
    tier_level INTEGER NOT NULL, -- 1, 2, 3, 4, 5 (càng cao càng ưu đãi)
    
    -- Tier requirements
    min_purchase_amount DECIMAL(15,2) DEFAULT 0, -- Tổng tiền đã mua tối thiểu để đạt tier (VND)
    min_points_required INTEGER DEFAULT 0, -- Điểm tối thiểu (nếu dùng điểm)
    
    -- Discount benefits
    discount_percentage DECIMAL(5,2) DEFAULT 0, -- % giảm giá mặc định cho tier này
    
    -- Visual & Display
    card_color_code VARCHAR(7), -- Mã màu thẻ VIP (hex)
    card_image_url VARCHAR(500), -- Hình ảnh thẻ VIP
    icon_class VARCHAR(100), -- CSS class cho icon
    
    -- Benefits
    benefits_description TEXT, -- Mô tả quyền lợi
    benefits_json JSONB, -- Chi tiết quyền lợi dạng JSON
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (tier_level >= 1 AND tier_level <= 10), -- Hỗ trợ tối đa 10 tiers
    CHECK (min_purchase_amount >= 0),
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

CREATE INDEX idx_pricing_tiers_level ON member_pricing_tiers(tier_level);
CREATE INDEX idx_pricing_tiers_status ON member_pricing_tiers(status);
CREATE INDEX idx_pricing_tiers_min_purchase ON member_pricing_tiers(min_purchase_amount);
```

**VIP Tiers (theo Orchard.vn):**
- **STANDARD** (Level 1): min_purchase_amount = 100,000 VND, discount = 2%
- **SILVER** (Level 2): min_purchase_amount = 5,000,000 VND, discount = 3%
- **GOLD** (Level 3): min_purchase_amount = 10,000,000 VND, discount = 5%
- **PLATINUM** (Level 4): min_purchase_amount = 20,000,000 VND, discount = 7%
- **DIAMOND** (Level 5): min_purchase_amount = 50,000,000 VND, discount = 10%

**Lưu ý:** 
- Khách hàng chưa mua hàng (< 100,000 đ) sẽ không có tier (NULL)
- Khi đạt mốc chi tiêu, tự động upgrade lên tier tương ứng

---

### 17. **product_member_prices** - Giá riêng cho từng tier

```sql
CREATE TABLE product_member_prices (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    pricing_tier_id BIGINT NOT NULL REFERENCES member_pricing_tiers(id) ON DELETE CASCADE,
    member_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2), -- % giảm so với giá gốc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, pricing_tier_id)
);

CREATE INDEX idx_member_prices_variant ON product_member_prices(product_variant_id);
CREATE INDEX idx_member_prices_tier ON product_member_prices(pricing_tier_id);
```

---

### =============================================================================
### PHẦN 6: ANALYTICS & INSIGHTS (Phân Tích & Thống Kê)
### =============================================================================

### 18. **product_views** - Lượt xem sản phẩm

```sql
CREATE TABLE product_views (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255), -- Cho guest users
    
    -- View details
    view_duration_seconds INTEGER, -- Thời gian xem (giây)
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Source tracking
    referrer_url VARCHAR(500), -- URL nguồn
    utm_source VARCHAR(100), -- UTM parameters
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Device info
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Conversion tracking
    added_to_cart BOOLEAN DEFAULT FALSE,
    added_to_cart_at TIMESTAMP,
    purchased BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP,
    order_id BIGINT REFERENCES orders(id)
);

CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_session ON product_views(session_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at DESC);
CREATE INDEX idx_product_views_conversion ON product_views(purchased) WHERE purchased = true;
```

---

### 19. **product_conversion_tracking** - Theo dõi chuyển đổi

```sql
CREATE TABLE product_conversion_tracking (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Metrics (calculated daily)
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    add_to_carts INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Conversion rates
    view_to_cart_rate DECIMAL(5,2) DEFAULT 0, -- % views -> cart
    cart_to_purchase_rate DECIMAL(5,2) DEFAULT 0, -- % cart -> purchase
    view_to_purchase_rate DECIMAL(5,2) DEFAULT 0, -- % views -> purchase
    
    -- Average values
    avg_view_duration INTEGER DEFAULT 0, -- Giây
    avg_order_value DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, date)
);

CREATE INDEX idx_conversion_product ON product_conversion_tracking(product_id);
CREATE INDEX idx_conversion_date ON product_conversion_tracking(date DESC);
CREATE INDEX idx_conversion_rates ON product_conversion_tracking(view_to_purchase_rate DESC);
```

---

### 20. **search_queries** - Lịch sử tìm kiếm

```sql
CREATE TABLE search_queries (
    id BIGSERIAL PRIMARY KEY,
    query_text VARCHAR(500) NOT NULL,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(255),
    
    -- Results
    results_count INTEGER DEFAULT 0,
    clicked_product_id BIGINT REFERENCES products(id),
    clicked_at TIMESTAMP,
    
    -- Filters applied
    filters_applied JSONB, -- {brand: [1,2], price_range: {min: 1000000, max: 5000000}}
    
    -- Device & source
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_queries_text ON search_queries(query_text);
CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_created ON search_queries(created_at DESC);
CREATE INDEX idx_search_queries_clicked ON search_queries(clicked_product_id) WHERE clicked_product_id IS NOT NULL;
```

---

### =============================================================================
### PHẦN 7: SEO OPTIMIZATION (Tối Ưu SEO)
### =============================================================================

### 21. **seo_urls** - URL Redirects & Canonical

```sql
CREATE TABLE seo_urls (
    id BIGSERIAL PRIMARY KEY,
    
    -- URL mapping
    old_url VARCHAR(500) NOT NULL, -- URL cũ (cần redirect)
    new_url VARCHAR(500) NOT NULL, -- URL mới
    canonical_url VARCHAR(500), -- Canonical URL
    
    -- Redirect type
    redirect_type VARCHAR(20) DEFAULT '301', -- 301 (Permanent), 302 (Temporary)
    
    -- Entity reference
    entity_type VARCHAR(50), -- PRODUCT, CATEGORY, BRAND, PAGE
    entity_id BIGINT, -- ID của product, category, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    redirect_count INTEGER DEFAULT 0, -- Số lần redirect
    
    -- Metadata
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(old_url)
);

CREATE INDEX idx_seo_urls_old ON seo_urls(old_url);
CREATE INDEX idx_seo_urls_new ON seo_urls(new_url);
CREATE INDEX idx_seo_urls_entity ON seo_urls(entity_type, entity_id);
CREATE INDEX idx_seo_urls_status ON seo_urls(status);
```

---

### 22. **url_slugs_history** - Lịch sử slug (cho redirect)

```sql
CREATE TABLE url_slugs_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- PRODUCT, CATEGORY, BRAND
    entity_id BIGINT NOT NULL,
    old_slug VARCHAR(255) NOT NULL,
    new_slug VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_slugs_history_entity ON url_slugs_history(entity_type, entity_id);
CREATE INDEX idx_slugs_history_old_slug ON url_slugs_history(old_slug);
```

---

### =============================================================================
### PHẦN 8: PRODUCT MEDIA & SPECIFICATIONS (Media & Thông Số)
### =============================================================================

### 23. **product_images** - Hình ảnh sản phẩm

```sql
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    image_type VARCHAR(50), -- PRODUCT, LIFESTYLE, DETAIL, PACKAGING
    file_size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_images_primary ON product_images(is_primary) WHERE is_primary = true;
CREATE INDEX idx_images_display_order ON product_images(product_id, display_order);
```

---

### 24. **product_specifications** - Thông số kỹ thuật (Legacy - có thể dùng attributes thay thế)

```sql
CREATE TABLE product_specifications (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    specification_key VARCHAR(100) NOT NULL,
    specification_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specs_product ON product_specifications(product_id);
```

---

### =============================================================================
### PHẦN 9: PRODUCT RELATIONSHIPS (Quan Hệ Sản Phẩm)
### =============================================================================

### 25. **product_gifts** - Quà tặng kèm

```sql
CREATE TABLE product_gifts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    gift_product_id BIGINT REFERENCES products(id),
    gift_name VARCHAR(255) NOT NULL,
    gift_value DECIMAL(15,2),
    quantity INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gifts_product ON product_gifts(product_id);
CREATE INDEX idx_gifts_status ON product_gifts(status);
```

---

### 26. **related_products** - Sản phẩm liên quan

```sql
CREATE TABLE related_products (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    related_product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    relation_type VARCHAR(50), -- SAME_BRAND, SAME_FRAGRANCE, SIMILAR, FREQUENTLY_BOUGHT_TOGETHER
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, related_product_id)
);

CREATE INDEX idx_related_product ON related_products(product_id);
CREATE INDEX idx_related_related ON related_products(related_product_id);
CREATE INDEX idx_related_type ON related_products(relation_type);
```

---

### 27. **product_comparisons** - So sánh sản phẩm

```sql
CREATE TABLE product_comparisons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(255),
    product_ids BIGINT[] NOT NULL, -- Array of product IDs
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_ids),
    UNIQUE(session_id, product_ids)
);

CREATE INDEX idx_comparisons_user ON product_comparisons(user_id);
CREATE INDEX idx_comparisons_session ON product_comparisons(session_id);
CREATE INDEX idx_comparisons_compared_at ON product_comparisons(compared_at DESC);
```

---

### =============================================================================
### PHẦN 10: SHOPPING & ORDERS (Mua Sắm & Đơn Hàng)
### =============================================================================

### 28. **carts** - Giỏ hàng

```sql
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Cart expiration
    UNIQUE(user_id, product_variant_id),
    UNIQUE(session_id, product_variant_id)
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_expires ON carts(expires_at) WHERE expires_at IS NOT NULL;
```

---

### 29. **customers** - Khách hàng (Tracking theo Email/Phone)

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    
    -- Customer identification (unique by email OR phone)
    email VARCHAR(255), -- Email (optional, có thể null)
    phone VARCHAR(20) NOT NULL, -- Số điện thoại (required, unique)
    
    -- Customer info
    full_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20), -- MALE, FEMALE, OTHER
    
    -- Note: Không cần link với users table vì khách hàng không cần đăng ký
    
    -- VIP Tier
    current_vip_tier_id BIGINT REFERENCES member_pricing_tiers(id),
    current_vip_tier_name VARCHAR(100), -- Cache tier name for quick access
    
    -- Lifetime Value
    total_purchase_amount DECIMAL(15,2) DEFAULT 0, -- Tổng tiền đã mua (chỉ tính đơn đã thanh toán)
    total_orders_count INTEGER DEFAULT 0, -- Tổng số đơn hàng
    total_orders_paid_count INTEGER DEFAULT 0, -- Số đơn đã thanh toán
    
    -- Points & Rewards
    membership_points INTEGER DEFAULT 0, -- Điểm tích lũy
    available_points INTEGER DEFAULT 0, -- Điểm có thể sử dụng
    
    -- Statistics
    first_order_date TIMESTAMP, -- Ngày đặt hàng đầu tiên
    last_order_date TIMESTAMP, -- Ngày đặt hàng gần nhất
    last_order_amount DECIMAL(15,2), -- Giá trị đơn hàng gần nhất
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BLOCKED
    
    -- Metadata
    notes TEXT, -- Ghi chú nội bộ
    tags JSONB, -- Tags để phân loại khách hàng
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(phone),
    UNIQUE(email) WHERE email IS NOT NULL,
    CHECK (total_purchase_amount >= 0),
    CHECK (total_orders_count >= 0)
);

CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_vip_tier ON customers(current_vip_tier_id);
CREATE INDEX idx_customers_total_purchase ON customers(total_purchase_amount DESC);
CREATE INDEX idx_customers_status ON customers(status);
```

---

### 30. **customer_lifetime_value** - Lịch sử giá trị khách hàng

```sql
CREATE TABLE customer_lifetime_value (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Value tracking
    total_purchase_amount DECIMAL(15,2) NOT NULL, -- Tổng tiền tại thời điểm này
    total_orders_count INTEGER NOT NULL,
    total_orders_paid_count INTEGER NOT NULL,
    
    -- Tier information
    vip_tier_id BIGINT REFERENCES member_pricing_tiers(id),
    vip_tier_name VARCHAR(100),
    
    -- Period
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tính toán
    period_type VARCHAR(20) DEFAULT 'SNAPSHOT', -- SNAPSHOT, DAILY, MONTHLY, YEARLY
    
    -- Metadata
    notes TEXT
);

CREATE INDEX idx_customer_ltv_customer ON customer_lifetime_value(customer_id);
CREATE INDEX idx_customer_ltv_calculated ON customer_lifetime_value(calculated_at DESC);
CREATE INDEX idx_customer_ltv_tier ON customer_lifetime_value(vip_tier_id);
```

---

### 31. **customer_vip_history** - Lịch sử thay đổi VIP Tier

```sql
CREATE TABLE customer_vip_history (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Tier change
    old_tier_id BIGINT REFERENCES member_pricing_tiers(id),
    old_tier_name VARCHAR(100),
    new_tier_id BIGINT NOT NULL REFERENCES member_pricing_tiers(id),
    new_tier_name VARCHAR(100) NOT NULL,
    
    -- Trigger information
    trigger_type VARCHAR(50) NOT NULL, -- PURCHASE_AMOUNT, MANUAL, PROMOTION, POINTS
    trigger_value DECIMAL(15,2), -- Giá trị trigger (tổng tiền, điểm, etc.)
    
    -- Order that triggered upgrade (if applicable)
    order_id BIGINT REFERENCES orders(id),
    
    -- Change details
    changed_by BIGINT REFERENCES users(id), -- Admin who manually changed (if manual)
    change_reason TEXT, -- Lý do thay đổi
    
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vip_history_customer ON customer_vip_history(customer_id);
CREATE INDEX idx_vip_history_changed_at ON customer_vip_history(changed_at DESC);
CREATE INDEX idx_vip_history_order ON customer_vip_history(order_id) WHERE order_id IS NOT NULL;
```

---

### 32. **orders** - Đơn hàng (Enhanced)

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer link (link to customers table)
    customer_id BIGINT REFERENCES customers(id), -- Link đến customer record
    
    -- Customer info (kept for historical data)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Email Verification (NEW - Không cần JWT)
    verification_code VARCHAR(10) UNIQUE NOT NULL, -- Mã xác thực 6-10 ký tự
    email_verified BOOLEAN DEFAULT FALSE, -- Đã xác nhận qua email chưa
    email_verified_at TIMESTAMP, -- Thời điểm xác nhận
    verification_code_expires_at TIMESTAMP, -- Mã xác thực hết hạn sau 24h
    verification_attempts INTEGER DEFAULT 0, -- Số lần nhập sai mã
    
    -- Shipping address
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_district VARCHAR(100),
    shipping_ward VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    
    -- Pricing
    subtotal DECIMAL(15,2) NOT NULL,
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    vip_discount_amount DECIMAL(15,2) DEFAULT 0, -- Giảm giá từ VIP tier
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- VIP Tier at time of order
    customer_vip_tier_id BIGINT REFERENCES member_pricing_tiers(id),
    customer_vip_tier_name VARCHAR(100),
    vip_discount_percentage DECIMAL(5,2) DEFAULT 0, -- % giảm giá VIP đã áp dụng
    
    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    
    -- Shipping
    shipping_method VARCHAR(100),
    shipping_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Order status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    notes TEXT,
    
    -- Promotion
    promotion_code VARCHAR(50),
    promotion_id BIGINT REFERENCES promotions(id),
    
    -- Lifetime value impact
    counted_towards_lifetime_value BOOLEAN DEFAULT FALSE, -- Đã tính vào lifetime value chưa
    counted_at TIMESTAMP, -- Thời điểm tính vào lifetime value
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_verification_code ON orders(verification_code);
CREATE INDEX idx_orders_email_verified ON orders(email_verified) WHERE email_verified = false;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_promotion ON orders(promotion_id);
CREATE INDEX idx_orders_counted_ltv ON orders(counted_towards_lifetime_value) WHERE counted_towards_lifetime_value = false;
```

---

### 33. **order_items** - Chi tiết đơn hàng

```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_variant_id BIGINT REFERENCES product_variants(id),
    
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    subtotal DECIMAL(15,2) NOT NULL,
    
    -- Gift
    gift_product_id BIGINT REFERENCES products(id),
    gift_name VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

### =============================================================================
### PHẦN 11: REVIEWS & RATINGS (Đánh Giá)
### =============================================================================

### 34. **reviews** - Đánh giá sản phẩm

```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    moderated_by BIGINT REFERENCES users(id),
    moderated_at TIMESTAMP,
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0, -- Số lần báo cáo
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified_purchase) WHERE is_verified_purchase = true;
```

---

### 35. **review_images** - Hình ảnh đánh giá

```sql
CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);
```

---

### 36. **review_helpful** - Đánh giá hữu ích

```sql
CREATE TABLE review_helpful (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_helpful_review ON review_helpful(review_id);
CREATE INDEX idx_review_helpful_user ON review_helpful(user_id);
```

---

### =============================================================================
### PHẦN 12: PROMOTIONS & DISCOUNTS (Khuyến Mãi)
### =============================================================================

### 37. **promotions** - Khuyến mãi

```sql
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Discount type
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y
    discount_value DECIMAL(15,2),
    
    -- Conditions
    min_purchase_amount DECIMAL(15,2) DEFAULT 0,
    max_discount_amount DECIMAL(15,2),
    applicable_to VARCHAR(50), -- ALL, SPECIFIC_PRODUCTS, SPECIFIC_CATEGORIES, SPECIFIC_BRANDS
    applicable_products JSONB, -- Array of product IDs
    applicable_categories JSONB, -- Array of category IDs
    applicable_brands JSONB, -- Array of brand IDs
    
    -- Time
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Usage
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_applicable ON promotions(applicable_to);
```

---

### 38. **promotion_usage** - Lịch sử sử dụng khuyến mãi

```sql
CREATE TABLE promotion_usage (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id),
    user_id BIGINT REFERENCES users(id),
    order_id BIGINT REFERENCES orders(id),
    discount_amount DECIMAL(15,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotion_usage_promo ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_user ON promotion_usage(user_id);
CREATE INDEX idx_promotion_usage_order ON promotion_usage(order_id);
```

---

### =============================================================================
### PHẦN 13: USER FEATURES (Tính Năng Người Dùng)
### =============================================================================

### 36. **wishlists** - Danh sách yêu thích

```sql
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);
```

---

### 37. **addresses** - Địa chỉ người dùng

```sql
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    address_type VARCHAR(50), -- HOME, OFFICE, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true;
```

---

### =============================================================================
### PHẦN 14: PAYMENT (Thanh Toán)
### =============================================================================

### 38. **payments** - Thanh toán

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- COD, VNPAY, MOMO, PAYPAL, BANK_TRANSFER
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED
    transaction_id VARCHAR(255) UNIQUE,
    gateway_response JSONB, -- Response từ payment gateway
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(15,2),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_method ON payments(payment_method);
```

---

## 📊 Enhanced ERD Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                            │
├─────────────────────────────────────────────────────────────┤
│  User (Admin/Staff) ──> Order Management (Admin APIs)               │
│                                                                      │
│  Customer (Email/Phone) ──┬──> Order ──┬──> OrderItem ──> ProductVariant│
│                           │            └──> VerificationCode         │
│                           ├──> CustomerLifetimeValue                 │
│                           └──> CustomerVipHistory                    │
│                                                                      │
│  Customer ──> MemberPricingTier (VIP Tiers)                         │
│                                                                      │
│  Product ──┬──> Brand                                                │
│            ├──> Category ──> CategoryAttribute               │
│            ├──> ProductImage                                 │
│            ├──> ProductVariant ──┬──> InventoryTransaction   │
│            │                      ├──> ProductPriceHistory    │
│            │                      └──> ProductMemberPrice     │
│            ├──> ProductAttributeValue ──> AttributeValue ──> │
│            │                                    ProductAttribute│
│            ├──> ProductBundle ──> BundleItem                 │
│            ├──> ProductGift                                   │
│            ├──> RelatedProduct                                │
│            ├──> ProductView (Analytics)                       │
│            ├──> ProductConversionTracking                     │
│            └──> ProductComparison                             │
│                                                              │
│  Promotion ──> PromotionUsage                                │
│  SEOUrl ──> URL Redirects                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Features Implementation

### 1. **Dynamic Attributes System**
- ✅ Flexible attribute types (SELECT, MULTISELECT, RANGE, BOOLEAN, TEXT)
- ✅ Category-specific attributes
- ✅ Variant-specific attributes
- ✅ Fast filtering với composite indexes
- ✅ Multi-language support

### 2. **Inventory Intelligence**
- ✅ Real-time stock tracking với `available_quantity = stock_quantity - reserved_quantity`
- ✅ Inventory transaction history
- ✅ Pre-orders với restock notifications
- ✅ Stock alerts (low stock, out of stock)
- ✅ Reserved quantity tracking (cart, pre-order)

### 3. **Product Bundling**
- ✅ Curated sets, gift packages, combo deals
- ✅ Customizable bundles
- ✅ Bundle pricing với discount tracking

### 4. **Analytics & Insights**
- ✅ Product views tracking với session/user tracking
- ✅ Conversion tracking (view → cart → purchase)
- ✅ Search query analytics
- ✅ Product comparison tracking
- ✅ Daily aggregated metrics

### 5. **Pricing Strategy**
- ✅ Complete price history
- ✅ Member pricing tiers
- ✅ Price change tracking
- ✅ Promotion price tracking

### 6. **SEO Optimization**
- ✅ URL redirects (301/302)
- ✅ Canonical URLs
- ✅ Slug history tracking
- ✅ Entity-based URL management

---

## 📈 Performance Optimizations

### Indexes Strategy

1. **Filtering Indexes:**
   - Composite indexes cho product_attribute_values
   - Indexes cho filterable attributes
   - Partial indexes cho active records

2. **Search Indexes:**
   - Full-text search trên attribute values
   - GIN indexes cho JSONB columns
   - Search keywords indexing

3. **Analytics Indexes:**
   - Date-based indexes cho time-series queries
   - Product-based indexes cho aggregation
   - User-based indexes cho personalization

---

## 🔄 Database Functions & Triggers

### 1. **Function: update_product_rating**
Tự động tính lại rating khi có review mới

### 2. **Function: update_stock_quantity**
Cập nhật stock khi có transaction

### 3. **Function: calculate_conversion_rates**
Tính toán conversion rates hàng ngày

### 4. **Trigger: update_product_view_count**
Tự động tăng view_count khi có view mới

### 5. **Trigger: update_available_quantity**
Tự động tính available_quantity từ stock và reserved

### 6. **Function: find_or_create_customer**
Tìm hoặc tạo customer record dựa trên email/phone

```sql
CREATE OR REPLACE FUNCTION find_or_create_customer(
    p_email VARCHAR(255),
    p_phone VARCHAR(20),
    p_name VARCHAR(255) DEFAULT NULL,
    p_user_id BIGINT DEFAULT NULL  -- Không sử dụng, giữ lại để tương thích
) RETURNS BIGINT AS $$
DECLARE
    v_customer_id BIGINT;
BEGIN
    -- Tìm customer theo phone (ưu tiên) hoặc email
    SELECT id INTO v_customer_id
    FROM customers
    WHERE phone = p_phone
       OR (p_email IS NOT NULL AND email = p_email)
    LIMIT 1;
    
    -- Nếu không tìm thấy, tạo mới
    IF v_customer_id IS NULL THEN
        INSERT INTO customers (email, phone, full_name, status)
        VALUES (p_email, p_phone, p_name, 'ACTIVE')
        RETURNING id INTO v_customer_id;
    ELSE
        -- Cập nhật thông tin nếu có
        UPDATE customers
        SET email = COALESCE(p_email, email),
            full_name = COALESCE(p_name, full_name),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_customer_id;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
```

### 7. **Function: update_customer_lifetime_value**
Cập nhật tổng tiền đã mua của customer khi order được thanh toán

```sql
CREATE OR REPLACE FUNCTION update_customer_lifetime_value(
    p_order_id BIGINT
) RETURNS VOID AS $$
DECLARE
    v_customer_id BIGINT;
    v_order_amount DECIMAL(15,2);
    v_new_total DECIMAL(15,2);
    v_new_tier_id BIGINT;
BEGIN
    -- Lấy thông tin order
    SELECT customer_id, total_amount
    INTO v_customer_id, v_order_amount
    FROM orders
    WHERE id = p_order_id
      AND payment_status = 'PAID'
      AND counted_towards_lifetime_value = FALSE;
    
    IF v_customer_id IS NULL OR v_order_amount IS NULL THEN
        RETURN;
    END IF;
    
    -- Cập nhật lifetime value
    UPDATE customers
    SET total_purchase_amount = total_purchase_amount + v_order_amount,
        total_orders_paid_count = total_orders_paid_count + 1,
        last_order_date = CURRENT_TIMESTAMP,
        last_order_amount = v_order_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_customer_id
    RETURNING total_purchase_amount INTO v_new_total;
    
    -- Đánh dấu order đã được tính
    UPDATE orders
    SET counted_towards_lifetime_value = TRUE,
        counted_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;
    
    -- Kiểm tra và upgrade VIP tier
    -- Chọn tier cao nhất mà customer đạt được (tier_level DESC)
    SELECT id INTO v_new_tier_id
    FROM member_pricing_tiers
    WHERE min_purchase_amount <= v_new_total
      AND status = 'ACTIVE'
    ORDER BY tier_level DESC
    LIMIT 1;
    
    -- Nếu chưa đạt STANDARD (100,000 đ), không có tier (NULL)
    -- Nếu đạt tier, upgrade
    IF v_new_tier_id IS NOT NULL THEN
        PERFORM upgrade_customer_vip_tier(v_customer_id, v_new_tier_id, p_order_id);
    END IF;
    
    -- Lưu snapshot vào customer_lifetime_value
    INSERT INTO customer_lifetime_value (
        customer_id, total_purchase_amount, total_orders_count,
        total_orders_paid_count, vip_tier_id, vip_tier_name, period_type
    )
    SELECT 
        id, total_purchase_amount, total_orders_count,
        total_orders_paid_count, current_vip_tier_id, current_vip_tier_name, 'SNAPSHOT'
    FROM customers
    WHERE id = v_customer_id;
END;
$$ LANGUAGE plpgsql;
```

### 8. **Function: upgrade_customer_vip_tier**
Nâng cấp VIP tier cho customer

```sql
CREATE OR REPLACE FUNCTION upgrade_customer_vip_tier(
    p_customer_id BIGINT,
    p_new_tier_id BIGINT,
    p_order_id BIGINT DEFAULT NULL,
    p_trigger_type VARCHAR(50) DEFAULT 'PURCHASE_AMOUNT',
    p_changed_by BIGINT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_old_tier_id BIGINT;
    v_old_tier_name VARCHAR(100);
    v_new_tier_name VARCHAR(100);
    v_current_total DECIMAL(15,2);
BEGIN
    -- Lấy thông tin tier cũ
    SELECT current_vip_tier_id, current_vip_tier_name, total_purchase_amount
    INTO v_old_tier_id, v_old_tier_name, v_current_total
    FROM customers
    WHERE id = p_customer_id;
    
    -- Lấy tên tier mới
    SELECT tier_name INTO v_new_tier_name
    FROM member_pricing_tiers
    WHERE id = p_new_tier_id;
    
    -- Chỉ upgrade nếu tier mới cao hơn tier cũ
    -- Nếu tier cũ là NULL (chưa có tier), cho phép set tier mới
    -- Nếu tier cũ có giá trị, chỉ upgrade khi tier mới cao hơn
    IF (v_old_tier_id IS NULL AND p_new_tier_id IS NOT NULL) OR
       (v_old_tier_id IS NOT NULL AND p_new_tier_id IS NOT NULL AND
        (SELECT tier_level FROM member_pricing_tiers WHERE id = p_new_tier_id) >
        (SELECT tier_level FROM member_pricing_tiers WHERE id = v_old_tier_id)) THEN
        
        -- Cập nhật customer
        -- Nếu p_new_tier_id là NULL, set cả tier_id và tier_name là NULL
        UPDATE customers
        SET current_vip_tier_id = p_new_tier_id,
            current_vip_tier_name = CASE 
                WHEN p_new_tier_id IS NULL THEN NULL 
                ELSE v_new_tier_name 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_customer_id;
        
        -- Lưu lịch sử (chỉ lưu khi có thay đổi thực sự)
        IF v_old_tier_id IS DISTINCT FROM p_new_tier_id THEN
            INSERT INTO customer_vip_history (
                customer_id, old_tier_id, old_tier_name,
                new_tier_id, new_tier_name, trigger_type,
                trigger_value, order_id, changed_by
            )
            VALUES (
                p_customer_id, v_old_tier_id, v_old_tier_name,
                p_new_tier_id, v_new_tier_name, p_trigger_type,
                v_current_total, p_order_id, p_changed_by
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 9. **Trigger: auto_update_customer_lifetime_value**
Tự động cập nhật lifetime value khi order được thanh toán

```sql
CREATE OR REPLACE FUNCTION trigger_update_customer_lifetime_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi order chuyển sang trạng thái PAID
    IF NEW.payment_status = 'PAID' AND 
       (OLD.payment_status IS NULL OR OLD.payment_status != 'PAID') THEN
        
        -- Đảm bảo customer record tồn tại
        PERFORM find_or_create_customer(
            NEW.customer_email,
            NEW.customer_phone,
            NEW.customer_name,
            NULL  -- Không có user_id vì không cần đăng ký
        );
        
        -- Cập nhật customer_id trong order nếu chưa có
        IF NEW.customer_id IS NULL THEN
            UPDATE orders
            SET customer_id = find_or_create_customer(
                NEW.customer_email,
                NEW.customer_phone,
                NEW.customer_name,
                NULL
            )
            WHERE id = NEW.id;
        END IF;
        
        -- Cập nhật lifetime value
        PERFORM update_customer_lifetime_value(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_update_lifetime_value
AFTER UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN (NEW.payment_status = 'PAID')
EXECUTE FUNCTION trigger_update_customer_lifetime_value();
```

### 10. **Function: calculate_vip_discount**
Tính toán giảm giá VIP cho đơn hàng

```sql
CREATE OR REPLACE FUNCTION calculate_vip_discount(
    p_customer_id BIGINT,
    p_subtotal DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_tier_id BIGINT;
    v_discount_percentage DECIMAL(5,2);
    v_discount_amount DECIMAL(15,2);
BEGIN
    -- Lấy tier hiện tại của customer
    SELECT current_vip_tier_id INTO v_tier_id
    FROM customers
    WHERE id = p_customer_id;
    
    IF v_tier_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Lấy % giảm giá của tier
    SELECT discount_percentage INTO v_discount_percentage
    FROM member_pricing_tiers
    WHERE id = v_tier_id
      AND status = 'ACTIVE';
    
    IF v_discount_percentage IS NULL OR v_discount_percentage = 0 THEN
        RETURN 0;
    END IF;
    
    -- Tính số tiền giảm
    v_discount_amount := (p_subtotal * v_discount_percentage) / 100;
    
    RETURN v_discount_amount;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Order & Customer System - Implementation Guide

### Workflow: Đặt Hàng Không Cần Đăng Ký (Guest Checkout)

#### 1. **Khi Khách Hàng Đặt Hàng (Checkout)**

```sql
-- Bước 1: Tìm hoặc tạo customer record (tự động từ email/phone)
SELECT find_or_create_customer(
    'customer@email.com',  -- email
    '0399194476',          -- phone
    'Nguyễn Văn A',        -- name
    NULL                   -- user_id (không cần, vì không có đăng ký)
) AS customer_id;

-- Bước 2: Tạo mã xác thực (6-10 ký tự, unique)
-- Ví dụ: "ABC123", "XYZ789"
-- Mã này sẽ được gửi qua email

-- Bước 3: Tạo order với verification_code
INSERT INTO orders (
    order_number, customer_id, customer_name, 
    customer_email, customer_phone, 
    verification_code, verification_code_expires_at,
    subtotal, total_amount, status
) VALUES (
    'ORD-2024-001', 
    customer_id,
    'Nguyễn Văn A',
    'customer@email.com',
    '0399194476',
    'ABC123',  -- Mã xác thực
    CURRENT_TIMESTAMP + INTERVAL '24 hours',  -- Hết hạn sau 24h
    2000000,
    2000000,
    'PENDING'  -- Chờ xác nhận email
);

-- Bước 4: Tính VIP discount (nếu có)
SELECT calculate_vip_discount(customer_id, 2000000) AS vip_discount;
-- Kết quả: 0 (nếu chưa có tier) hoặc số tiền giảm

-- Bước 5: Gửi email xác nhận đặt hàng
-- Email chứa:
-- - Mã đơn hàng (order_number)
-- - Mã xác thực (verification_code)
-- - Link xác nhận: /api/orders/verify?code=ABC123&email=customer@email.com
-- - Thông tin đơn hàng
```

#### 2. **Khách Hàng Xác Nhận Đơn Hàng Qua Email**

```sql
-- API: POST /api/orders/verify
-- Request: { "verification_code": "ABC123", "email": "customer@email.com" }

-- Bước 1: Kiểm tra mã xác thực
SELECT id, order_number, customer_email, verification_code_expires_at, 
       email_verified, verification_attempts
FROM orders
WHERE verification_code = 'ABC123'
  AND customer_email = 'customer@email.com'
  AND status = 'PENDING';

-- Bước 2: Validate mã xác thực
-- - Kiểm tra mã còn hạn (verification_code_expires_at > NOW())
-- - Kiểm tra chưa xác nhận (email_verified = FALSE)
-- - Kiểm tra số lần thử (verification_attempts < 5)

-- Bước 3: Xác nhận đơn hàng
UPDATE orders
SET email_verified = TRUE,
    email_verified_at = CURRENT_TIMESTAMP,
    status = 'CONFIRMED',  -- Chuyển sang CONFIRMED sau khi xác nhận
    updated_at = CURRENT_TIMESTAMP
WHERE verification_code = 'ABC123'
  AND customer_email = 'customer@email.com'
  AND email_verified = FALSE;

-- Bước 4: Gửi email xác nhận thành công
-- Email chứa:
-- - Thông báo đơn hàng đã được xác nhận
-- - Thông tin đơn hàng chi tiết
-- - Link tra cứu đơn hàng: /api/orders/track?code=ABC123&email=customer@email.com
```

#### 3. **Tra Cứu Đơn Hàng (Không Cần Đăng Nhập)**

```sql
-- API: GET /api/orders/track?code={verification_code}&email={email}
-- Khách hàng tra cứu đơn hàng bằng mã xác thực và email

SELECT 
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.total_amount,
    o.status,
    o.payment_status,
    o.shipping_status,
    o.tracking_number,
    o.created_at,
    o.email_verified_at,
    o.shipped_at,
    o.delivered_at
FROM orders o
WHERE o.verification_code = 'ABC123'
  AND o.customer_email = 'customer@email.com';
```

#### 4. **Khi Order Được Thanh Toán (Payment Success)**

```sql
-- Trigger tự động chạy:
-- 1. Cập nhật payment_status = 'PAID'
-- 2. Cập nhật total_purchase_amount của customer
-- 3. Kiểm tra và upgrade VIP tier
-- 4. Lưu lịch sử vào customer_vip_history

-- Manual trigger (nếu cần):
SELECT update_customer_lifetime_value(order_id);
```

#### 3. **VIP Tier Auto-Upgrade Logic**

```sql
-- Khi total_purchase_amount đạt mốc:
-- < 100,000 VND → Chưa có hạng (NULL)
-- >= 100,000 VND → STANDARD (Level 1, 2% discount)
-- >= 5,000,000 VND → SILVER (Level 2, 3% discount)
-- >= 10,000,000 VND → GOLD (Level 3, 5% discount)
-- >= 20,000,000 VND → PLATINUM (Level 4, 7% discount)
-- >= 50,000,000 VND → DIAMOND (Level 5, 10% discount)

-- Upgrade tự động khi:
-- - Order được thanh toán (payment_status = 'PAID')
-- - total_purchase_amount >= min_purchase_amount của tier cao hơn
-- - Chỉ upgrade lên, không downgrade
-- - Khách hàng < 100,000 đ sẽ không có tier (NULL)
```

#### 4. **Tra Cứu Điểm Thưởng và Đơn Hàng (Theo Hình Ảnh)**

```sql
-- API: GET /api/customers/lookup?phone={phone}&email={email}
-- Tra cứu thông tin khách hàng và VIP tier
SELECT 
    c.id,
    c.phone,
    c.email,
    c.full_name,
    c.total_purchase_amount,
    c.membership_points,
    COALESCE(c.current_vip_tier_name, 'Chưa có hạng') AS vip_tier_name,
    COALESCE(mpt.tier_display_name, 'Chưa có hạng') AS tier_display_name,
    COALESCE(mpt.discount_percentage, 0) AS discount_percentage,
    COALESCE(mpt.benefits_description, 'Chưa đạt điều kiện (cần mua > 100.000 đ)') AS benefits_description,
    c.total_orders_paid_count,
    c.first_order_date,
    c.last_order_date,
    -- Tính mốc tiếp theo để upgrade
    (SELECT min_purchase_amount 
     FROM member_pricing_tiers 
     WHERE min_purchase_amount > c.total_purchase_amount 
       AND status = 'ACTIVE'
     ORDER BY tier_level ASC 
     LIMIT 1) AS next_tier_threshold,
    (SELECT tier_display_name 
     FROM member_pricing_tiers 
     WHERE min_purchase_amount > c.total_purchase_amount 
       AND status = 'ACTIVE'
     ORDER BY tier_level ASC 
     LIMIT 1) AS next_tier_name
FROM customers c
LEFT JOIN member_pricing_tiers mpt ON c.current_vip_tier_id = mpt.id
WHERE c.phone = '0399194476'
   OR c.email = 'customer@email.com';

-- Lấy lịch sử đơn hàng
SELECT 
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    o.vip_discount_amount
FROM orders o
WHERE o.customer_id = customer_id
ORDER BY o.created_at DESC;
```

### Seed Data: VIP Tiers

```sql
-- Insert VIP Tiers (theo cấu trúc Orchard.vn)
INSERT INTO member_pricing_tiers (
    tier_name, tier_display_name, tier_level,
    min_purchase_amount, discount_percentage,
    card_color_code, benefits_description, status
) VALUES
('STANDARD', 'Standard', 1, 100000, 2, '#95A5A6',
 'Đã mua sắm tại Orchard (>100.000 đ). Giảm giá 2% cho mọi đơn hàng.', 'ACTIVE'),
 
('SILVER', 'Silver', 2, 5000000, 3, '#BDC3C7',
 'Tổng chi tiêu > 5.000.000 đ. Giảm giá 3% cho mọi đơn hàng, ưu đãi đặc biệt.', 'ACTIVE'),
 
('GOLD', 'Gold', 3, 10000000, 5, '#FFD700',
 'Tổng chi tiêu > 10.000.000 đ. Giảm giá 5% cho mọi đơn hàng, quà tặng sinh nhật.', 'ACTIVE'),
 
('PLATINUM', 'Platinum', 4, 20000000, 7, '#C0C0C0',
 'Tổng chi tiêu > 20.000.000 đ. Giảm giá 7% cho mọi đơn hàng, ưu tiên giao hàng, quà tặng đặc biệt.', 'ACTIVE'),
 
('DIAMOND', 'Diamond', 5, 50000000, 10, '#B9F2FF',
 'Tổng chi tiêu > 50.000.000 đ. Giảm giá 10% cho mọi đơn hàng, ưu tiên cao nhất, quà tặng độc quyền.', 'ACTIVE');
```

### API Endpoints Cần Implement

#### Public APIs (Không Cần Authentication)

1. **POST /api/orders** - Tạo đơn hàng
   - Nhận thông tin khách hàng (name, email, phone, address)
   - Tự động tạo customer record
   - Tạo mã xác thực (verification_code)
   - Gửi email xác nhận đặt hàng
   - Trả về: order_number, verification_code

2. **POST /api/orders/verify** - Xác nhận đơn hàng qua email
   - Request: `{ "verification_code": "ABC123", "email": "customer@email.com" }`
   - Kiểm tra mã xác thực
   - Cập nhật email_verified = TRUE
   - Chuyển status = 'CONFIRMED'
   - Gửi email xác nhận thành công

3. **GET /api/orders/track?code={verification_code}&email={email}** - Tra cứu đơn hàng
   - Tra cứu đơn hàng bằng mã xác thực và email
   - Trả về: Thông tin đơn hàng, trạng thái, tracking number

4. **GET /api/customers/lookup?phone={phone}&email={email}** - Tra cứu thông tin khách hàng
   - Tra cứu theo phone/email
   - Trả về: VIP tier, tổng tiền đã mua, điểm thưởng, lịch sử đơn hàng

#### Admin APIs (Cần Authentication - JWT cho Admin/Staff)

5. **GET /api/admin/orders** - Quản lý đơn hàng
   - Xem danh sách đơn hàng
   - Filter, search, pagination

6. **PUT /api/admin/orders/{id}/status** - Cập nhật trạng thái đơn hàng
   - Cập nhật shipping_status, payment_status

7. **POST /api/admin/customers/{id}/upgrade-tier** - Nâng cấp VIP tier thủ công
   - Admin manually upgrade/downgrade tier
   - Ghi lại lý do trong customer_vip_history

8. **GET /api/admin/customers/top-vip** - Top customers
   - Top customers theo total_purchase_amount
   - Phân tích VIP tier distribution

---

## ✅ Migration Strategy

### Phase 1: Core Tables
1. users, brands, categories
2. products, product_variants
3. product_images

### Phase 2: Attributes System
4. product_attributes, attribute_values
5. product_attribute_values, category_attributes

### Phase 3: Inventory & Pricing
6. inventory_transactions, pre_orders, stock_alerts
7. product_price_history, member_pricing_tiers

### Phase 4: Customer & VIP System (NEW)
8. **customers** - Customer tracking
9. **customer_lifetime_value** - Lifetime value history
10. **customer_vip_history** - VIP tier change history

### Phase 5: Bundling & Relationships
11. product_bundles, bundle_items
12. product_gifts, related_products

### Phase 6: Analytics
13. product_views, product_conversion_tracking
14. search_queries, product_comparisons

### Phase 7: SEO & Shopping
15. seo_urls, url_slugs_history
16. carts, orders (enhanced), order_items

### Phase 8: Reviews & Promotions
17. reviews, review_images, review_helpful
18. promotions, promotion_usage

---

**Schema này được thiết kế để đạt 95% tính năng so với Orchard.vn với focus vào scalability, performance và maintainability!**

**VIP Customer System**: Hệ thống tracking khách hàng theo email/phone, tự động tính lifetime value và upgrade VIP tier dựa trên tổng tiền đã mua!

**Simplified Authentication**: 
- ✅ Khách hàng KHÔNG cần đăng ký/đăng nhập
- ✅ Xác thực đơn hàng qua email với mã xác thực (verification_code)
- ✅ Tra cứu đơn hàng bằng verification_code + email
- ✅ JWT authentication chỉ dành cho Admin/Staff
- ✅ Guest checkout đơn giản, không cần tài khoản

