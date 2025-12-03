-- ============================================================================
-- PHẦN 1: CORE ENTITIES (RBAC & Users)
-- ============================================================================

-- 1.1. Bảng roles (RBAC - Role-Based Access Control)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    hierarchy_level INTEGER DEFAULT 1 CHECK (hierarchy_level >= 1 AND hierarchy_level <= 10),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_code ON roles(role_code);
CREATE INDEX idx_roles_status ON roles(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_roles_hierarchy ON roles(hierarchy_level);
CREATE INDEX idx_roles_permissions ON roles USING GIN (permissions);

-- 1.2. Bảng user_roles (Many-to-Many relationship)
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;

-- 1.3. Bảng users (Enhanced với RBAC support)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'ADMIN',
    primary_role_id BIGINT,
    additional_permissions JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED')),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    last_password_reset_request TIMESTAMP,
    last_login TIMESTAMP,
    last_login_ip VARCHAR(45),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (failed_login_attempts >= 0)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_primary_role ON users(primary_role_id) WHERE primary_role_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_additional_permissions ON users USING GIN (additional_permissions);
CREATE INDEX idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;

-- Foreign keys for users
ALTER TABLE users ADD CONSTRAINT fk_users_primary_role FOREIGN KEY (primary_role_id) REFERENCES roles(id);
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);

-- 1.4. Bảng login_history
CREATE TABLE login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(255),
    login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED')),
    failure_reason VARCHAR(255),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_email ON login_history(email);
CREATE INDEX idx_login_history_time ON login_history(login_at DESC);
CREATE INDEX idx_login_history_status ON login_history(login_status);

ALTER TABLE login_history ADD CONSTRAINT fk_login_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 1.5. Bảng password_reset_tokens
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at) WHERE used = false;
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used) WHERE used = false;

ALTER TABLE password_reset_tokens ADD CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 1.6. Insert default roles
INSERT INTO roles (role_code, role_name, description, hierarchy_level, permissions) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system access with all permissions', 10,
 '{"*": ["*"]}'::jsonb),
('ADMIN', 'Administrator', 'Full access to all modules except system settings', 9,
 '{"products": ["*"], "orders": ["*"], "customers": ["*"], "categories": ["*"], "brands": ["*"], "concentrations": ["*"], "inventory": ["*"], "analytics": ["read"]}'::jsonb),
('MANAGER', 'Manager', 'Can manage products, orders, and view analytics', 7,
 '{"products": ["create", "read", "update"], "orders": ["read", "update"], "customers": ["read"], "analytics": ["read"]}'::jsonb),
('STAFF', 'Staff', 'Can view and update orders, limited product access', 5,
 '{"orders": ["read", "update"], "products": ["read"], "customers": ["read"]}'::jsonb),
('VIEWER', 'Viewer', 'Read-only access to all modules', 3,
 '{"*": ["read"]}'::jsonb);

-- ============================================================================
-- PHẦN 2: CATALOG CORE (Brands, Categories, Concentrations)
-- ============================================================================

-- 2.1. Bảng brands
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    country VARCHAR(100),
    website_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_display_order ON brands(display_order);

-- 2.2. Bảng categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_level ON categories(level);

ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 2.3. Bảng concentrations
CREATE TABLE concentrations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    acronym VARCHAR(20),
    color_code VARCHAR(7),
    min_oil_percentage INTEGER CHECK (min_oil_percentage IS NULL OR (min_oil_percentage >= 0 AND min_oil_percentage <= 100)),
    max_oil_percentage INTEGER CHECK (max_oil_percentage IS NULL OR (max_oil_percentage >= 0 AND max_oil_percentage <= 100)),
    longevity VARCHAR(100),
    intensity_level INTEGER DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 10),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        min_oil_percentage IS NULL 
        OR max_oil_percentage IS NULL 
        OR min_oil_percentage <= max_oil_percentage
    )
);

CREATE INDEX idx_concentrations_slug ON concentrations(slug);
CREATE INDEX idx_concentrations_status ON concentrations(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_concentrations_intensity ON concentrations(intensity_level);
CREATE INDEX idx_concentrations_display_order ON concentrations(display_order);
CREATE INDEX idx_concentrations_acronym ON concentrations(acronym) WHERE acronym IS NOT NULL;
CREATE INDEX idx_concentrations_color_code ON concentrations(color_code) WHERE color_code IS NOT NULL;

COMMENT ON COLUMN concentrations.acronym IS 'Tên viết tắt của nồng độ (ví dụ: EDP, EDT, EDC) - dùng để hiển thị trên Product Card';
COMMENT ON COLUMN concentrations.color_code IS 'Mã màu hex đại diện cho nồng độ (ví dụ: #FF5733) - dùng để phân biệt trực quan';
COMMENT ON COLUMN concentrations.min_oil_percentage IS 'Tỷ lệ tinh dầu tối thiểu (0-100%) - dùng trong bảng thông số kỹ thuật';
COMMENT ON COLUMN concentrations.max_oil_percentage IS 'Tỷ lệ tinh dầu tối đa (0-100%) - dùng trong bảng thông số kỹ thuật';
COMMENT ON COLUMN concentrations.longevity IS 'Độ lưu hương ước tính (ví dụ: "6 - 8 tiếng" hoặc "Trên 12 tiếng") - thông tin khách hàng quan tâm';

-- ============================================================================
-- PHẦN 3: PRODUCTS & VARIANTS
-- ============================================================================

-- 3.1. Bảng products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','UNDER_REVIEW','ACTIVE','INACTIVE','ARCHIVED')),
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_brand_status ON products(brand_id, status);
CREATE INDEX idx_products_published ON products(published_at) WHERE status = 'ACTIVE';

ALTER TABLE products ADD CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE products ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE products ADD CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- 3.2. Bảng product_variants (với JSONB cached_attributes)
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    concentration_code VARCHAR(20),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category_id BIGINT,
    concentration_id BIGINT,
    price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    cost_price DECIMAL(15,2),
    currency_code VARCHAR(3) DEFAULT 'VND',
    tax_class_id BIGINT,
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10 CHECK (low_stock_threshold >= 0),
    manage_inventory BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    allow_out_of_stock_purchase BOOLEAN DEFAULT FALSE,
    stock_status VARCHAR(20) DEFAULT 'IN_STOCK' CHECK (stock_status IN ('IN_STOCK','OUT_OF_STOCK','LOW_STOCK','BACKORDER')),
    volume_ml INTEGER,
    volume_unit VARCHAR(10) DEFAULT 'ml' CHECK (volume_unit IN ('ml','oz','cl')),
    weight_grams DECIMAL(8,2),
    weight_unit VARCHAR(10) DEFAULT 'g' CHECK (weight_unit IN ('g','kg','oz','lb')),
    short_description TEXT,
    full_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    available_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    available_to TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by BIGINT,
    updated_by BIGINT,
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    cached_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (available_to IS NULL OR available_from < available_to)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_status ON product_variants(status);
CREATE INDEX idx_variants_is_default ON product_variants(is_default) WHERE is_default = true;
CREATE INDEX idx_variants_slug ON product_variants(slug);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_category ON product_variants(category_id);
CREATE INDEX idx_variants_price ON product_variants(price) WHERE status = 'ACTIVE';
CREATE INDEX idx_variants_stock_status ON product_variants(stock_status);
-- GIN Index cho JSONB cached_attributes (Performance Optimization)
CREATE INDEX idx_variants_cached_attributes_gin ON product_variants USING GIN (cached_attributes);

ALTER TABLE product_variants ADD CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_variants ADD CONSTRAINT fk_variants_category FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE product_variants ADD CONSTRAINT fk_variants_concentration FOREIGN KEY (concentration_id) REFERENCES concentrations(id);
ALTER TABLE product_variants ADD CONSTRAINT fk_variants_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE product_variants ADD CONSTRAINT fk_variants_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- ============================================================================
-- PHẦN 4: DYNAMIC ATTRIBUTES SYSTEM
-- ============================================================================

-- 4.1. Bảng product_attributes
CREATE TABLE product_attributes (
    id BIGSERIAL PRIMARY KEY,
    attribute_key VARCHAR(100) NOT NULL UNIQUE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_name_en VARCHAR(255),
    attribute_type VARCHAR(50) NOT NULL CHECK (attribute_type IN ('SELECT', 'MULTISELECT', 'RANGE', 'BOOLEAN', 'TEXT')),
    data_type VARCHAR(50) DEFAULT 'STRING',
    is_filterable BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    is_variant_specific BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    icon_class VARCHAR(100),
    color_code VARCHAR(7),
    validation_rules JSONB,
    description TEXT,
    help_text TEXT,
    unit VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attributes_key ON product_attributes(attribute_key);
CREATE INDEX idx_attributes_type ON product_attributes(attribute_type);
CREATE INDEX idx_attributes_filterable ON product_attributes(is_filterable) WHERE is_filterable = true;
CREATE INDEX idx_attributes_status ON product_attributes(status);
CREATE INDEX idx_attributes_display_order ON product_attributes(display_order);

ALTER TABLE product_attributes ADD CONSTRAINT fk_attributes_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE product_attributes ADD CONSTRAINT fk_attributes_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- 4.2. Bảng attribute_values
CREATE TABLE attribute_values (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_value VARCHAR(255) NOT NULL,
    display_value_en VARCHAR(255),
    color_code VARCHAR(7),
    image_url VARCHAR(500),
    hex_color VARCHAR(7),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    search_keywords TEXT,
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attribute_id, value)
);

CREATE INDEX idx_attribute_values_attribute ON attribute_values(attribute_id);
CREATE INDEX idx_attribute_values_display_order ON attribute_values(attribute_id, display_order);
CREATE INDEX idx_attribute_values_search ON attribute_values USING gin(to_tsvector('english', search_keywords));
CREATE INDEX idx_attribute_values_value ON attribute_values(value);

ALTER TABLE attribute_values ADD CONSTRAINT fk_attribute_values_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE;
ALTER TABLE attribute_values ADD CONSTRAINT fk_attribute_values_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE attribute_values ADD CONSTRAINT fk_attribute_values_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- 4.3. Bảng product_attribute_values
CREATE TABLE product_attribute_values (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    attribute_value_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    custom_value TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, attribute_value_id, product_variant_id),
    CHECK (
        (product_id IS NOT NULL AND product_variant_id IS NULL) OR
        (product_variant_id IS NOT NULL)
    )
);

CREATE INDEX idx_prod_attr_values_product ON product_attribute_values(product_id);
CREATE INDEX idx_prod_attr_values_attr_value ON product_attribute_values(attribute_value_id);
CREATE INDEX idx_prod_attr_values_variant ON product_attribute_values(product_variant_id);
CREATE INDEX idx_prod_attr_values_primary ON product_attribute_values(is_primary) WHERE is_primary = true;
CREATE INDEX idx_prod_attr_values_composite ON product_attribute_values(product_id, attribute_value_id);

ALTER TABLE product_attribute_values ADD CONSTRAINT fk_prod_attr_values_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_attribute_values ADD CONSTRAINT fk_prod_attr_values_attr_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE;
ALTER TABLE product_attribute_values ADD CONSTRAINT fk_prod_attr_values_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE product_attribute_values ADD CONSTRAINT fk_prod_attr_values_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- 4.4. Bảng category_attributes
CREATE TABLE category_attributes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, attribute_id)
);

CREATE INDEX idx_category_attributes_category ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_attribute ON category_attributes(attribute_id);

ALTER TABLE category_attributes ADD CONSTRAINT fk_category_attributes_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE category_attributes ADD CONSTRAINT fk_category_attributes_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE;

-- 4.5. Bảng attribute_option_translations
CREATE TABLE attribute_option_translations (
    id BIGSERIAL PRIMARY KEY,
    attribute_option_id BIGINT NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'vi-VN',
    display_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attribute_option_id, locale)
);

CREATE INDEX idx_attr_option_translations_option ON attribute_option_translations(attribute_option_id);

ALTER TABLE attribute_option_translations ADD CONSTRAINT fk_attr_option_translations_option FOREIGN KEY (attribute_option_id) REFERENCES attribute_values(id) ON DELETE CASCADE;

-- ============================================================================
-- PHẦN 5: PRODUCT MEDIA & TRANSLATIONS
-- ============================================================================

-- 5.1. Bảng product_images
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    image_type VARCHAR(50),
    file_size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_images_variant ON product_images(product_variant_id);
CREATE INDEX idx_images_primary ON product_images(is_primary) WHERE is_primary = true;
CREATE INDEX idx_images_display_order ON product_images(product_id, display_order);

ALTER TABLE product_images ADD CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_images ADD CONSTRAINT fk_images_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

-- 5.2. Bảng product_translations
CREATE TABLE product_translations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT,
    product_variant_id BIGINT,
    locale VARCHAR(10) NOT NULL DEFAULT 'vi-VN',
    name VARCHAR(255),
    short_description TEXT,
    full_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (product_id IS NOT NULL OR product_variant_id IS NOT NULL),
    UNIQUE(product_variant_id, locale)
);

CREATE INDEX idx_product_translations_product ON product_translations(product_id);
CREATE INDEX idx_product_translations_variant ON product_translations(product_variant_id);
CREATE INDEX idx_product_translations_locale ON product_translations(locale);

ALTER TABLE product_translations ADD CONSTRAINT fk_product_translations_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_translations ADD CONSTRAINT fk_product_translations_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE product_translations ADD CONSTRAINT fk_product_translations_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- 5.3. Bảng product_seo_urls
CREATE TABLE product_seo_urls (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    old_slug VARCHAR(500) NOT NULL,
    new_slug VARCHAR(500) NOT NULL,
    redirect_type VARCHAR(20) DEFAULT '301',
    redirect_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(old_slug)
);

CREATE INDEX idx_product_seo_urls_product ON product_seo_urls(product_id);
CREATE INDEX idx_product_seo_urls_new_slug ON product_seo_urls(new_slug);

ALTER TABLE product_seo_urls ADD CONSTRAINT fk_product_seo_urls_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ============================================================================
-- PHẦN 6: INVENTORY & WAREHOUSES
-- ============================================================================

-- 6.1. Bảng warehouses
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_status ON warehouses(status);

-- 6.2. Bảng warehouse_stock
CREATE TABLE warehouse_stock (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, warehouse_id),
    CHECK (quantity >= 0),
    CHECK (reserved_quantity <= quantity)
);

CREATE INDEX idx_warehouse_stock_variant ON warehouse_stock(product_variant_id);
CREATE INDEX idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);

ALTER TABLE warehouse_stock ADD CONSTRAINT fk_warehouse_stock_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
ALTER TABLE warehouse_stock ADD CONSTRAINT fk_warehouse_stock_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);

-- 6.3. Bảng inventory_transactions
CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    warehouse_id BIGINT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN','OUT','ADJUSTMENT','RETURN','DAMAGED','TRANSFER')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    batch_number VARCHAR(100),
    expiry_date DATE,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    notes TEXT,
    reason VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_trans_variant ON inventory_transactions(product_variant_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_created ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inv_trans_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_inv_trans_wh ON inventory_transactions(warehouse_id);

ALTER TABLE inventory_transactions ADD CONSTRAINT fk_inv_trans_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
ALTER TABLE inventory_transactions ADD CONSTRAINT fk_inv_trans_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);
ALTER TABLE inventory_transactions ADD CONSTRAINT fk_inv_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- 6.4. Bảng pre_orders
CREATE TABLE pre_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    product_variant_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    expected_restock_date DATE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    converted_to_order_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pre_orders_user ON pre_orders(user_id);
CREATE INDEX idx_pre_orders_variant ON pre_orders(product_variant_id);
CREATE INDEX idx_pre_orders_status ON pre_orders(status);
CREATE INDEX idx_pre_orders_restock_date ON pre_orders(expected_restock_date) WHERE status = 'PENDING';

ALTER TABLE pre_orders ADD CONSTRAINT fk_pre_orders_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE pre_orders ADD CONSTRAINT fk_pre_orders_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);

-- 6.5. Bảng stock_alerts
CREATE TABLE stock_alerts (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    threshold_quantity INTEGER,
    current_quantity INTEGER,
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_alerts_variant ON stock_alerts(product_variant_id);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_notified ON stock_alerts(notified) WHERE notified = false;

ALTER TABLE stock_alerts ADD CONSTRAINT fk_stock_alerts_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);

-- 6.6. Bảng shedlock (Cho Distributed Scheduler)
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL PRIMARY KEY,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL
);

-- 6.7. Bảng stock_reservations
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

-- ============================================================================
-- PHẦN 7: PRICING & TAX
-- ============================================================================

-- 7.1. Bảng tax_classes
CREATE TABLE tax_classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL CHECK (rate BETWEEN 0 AND 100),
    description TEXT,
    country_code VARCHAR(2),
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tax_classes_status ON tax_classes(status);
CREATE INDEX idx_tax_classes_country ON tax_classes(country_code);

-- 7.2. Bảng currency_rates
CREATE TABLE currency_rates (
    id BIGSERIAL PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency, effective_from)
);

CREATE INDEX idx_currency_rates_base ON currency_rates(base_currency);
CREATE INDEX idx_currency_rates_target ON currency_rates(target_currency);
CREATE INDEX idx_currency_rates_effective ON currency_rates(effective_from, effective_to);

-- 7.3. Bảng product_price_history
CREATE TABLE product_price_history (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    currency_code VARCHAR(3) DEFAULT 'VND',
    price_change_type VARCHAR(20) NOT NULL CHECK (price_change_type IN ('INCREASE','DECREASE','PROMOTION','REGULAR','CLEARANCE')),
    previous_price DECIMAL(15,2),
    change_amount DECIMAL(15,2),
    change_percentage DECIMAL(5,2),
    reason TEXT,
    promotion_id BIGINT,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    changed_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_variant ON product_price_history(product_variant_id);
CREATE INDEX idx_price_history_effective ON product_price_history(effective_from, effective_to);
CREATE INDEX idx_price_history_promotion ON product_price_history(promotion_id);
CREATE INDEX idx_price_history_created ON product_price_history(created_at DESC);

ALTER TABLE product_price_history ADD CONSTRAINT fk_price_history_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
ALTER TABLE product_price_history ADD CONSTRAINT fk_price_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id);

-- 7.4. Bảng member_pricing_tiers
CREATE TABLE member_pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL UNIQUE,
    tier_display_name VARCHAR(255),
    tier_level INTEGER NOT NULL,
    min_purchase_amount DECIMAL(15,2) DEFAULT 0,
    min_points_required INTEGER DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    card_color_code VARCHAR(7),
    card_image_url VARCHAR(500),
    icon_class VARCHAR(100),
    benefits_description TEXT,
    benefits_json JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (tier_level >= 1 AND tier_level <= 10),
    CHECK (min_purchase_amount >= 0),
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

CREATE INDEX idx_pricing_tiers_level ON member_pricing_tiers(tier_level);
CREATE INDEX idx_pricing_tiers_status ON member_pricing_tiers(status);
CREATE INDEX idx_pricing_tiers_min_purchase ON member_pricing_tiers(min_purchase_amount);

-- 7.5. Bảng product_member_prices
CREATE TABLE product_member_prices (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    pricing_tier_id BIGINT NOT NULL,
    member_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, pricing_tier_id)
);

CREATE INDEX idx_member_prices_variant ON product_member_prices(product_variant_id);
CREATE INDEX idx_member_prices_tier ON product_member_prices(pricing_tier_id);

ALTER TABLE product_member_prices ADD CONSTRAINT fk_member_prices_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE product_member_prices ADD CONSTRAINT fk_member_prices_tier FOREIGN KEY (pricing_tier_id) REFERENCES member_pricing_tiers(id) ON DELETE CASCADE;

-- Foreign key cho tax_class_id trong product_variants
ALTER TABLE product_variants ADD CONSTRAINT fk_variants_tax_class FOREIGN KEY (tax_class_id) REFERENCES tax_classes(id);

-- ============================================================================
-- PHẦN 8: CUSTOMERS & VIP SYSTEM
-- ============================================================================

-- 8.1. Bảng customers
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    current_vip_tier_id BIGINT,
    current_vip_tier_name VARCHAR(100),
    total_purchase_amount DECIMAL(15,2) DEFAULT 0,
    total_orders_count INTEGER DEFAULT 0,
    total_orders_paid_count INTEGER DEFAULT 0,
    membership_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    first_order_date TIMESTAMP,
    last_order_date TIMESTAMP,
    last_order_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email) WHERE email IS NOT NULL,
    CHECK (total_purchase_amount >= 0),
    CHECK (total_orders_count >= 0)
);

CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_vip_tier ON customers(current_vip_tier_id);
CREATE INDEX idx_customers_total_purchase ON customers(total_purchase_amount DESC);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_tags ON customers USING GIN (tags);

ALTER TABLE customers ADD CONSTRAINT fk_customers_vip_tier FOREIGN KEY (current_vip_tier_id) REFERENCES member_pricing_tiers(id);

-- 8.2. Bảng customer_lifetime_value
CREATE TABLE customer_lifetime_value (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total_purchase_amount DECIMAL(15,2) NOT NULL,
    total_orders_count INTEGER NOT NULL,
    total_orders_paid_count INTEGER NOT NULL,
    vip_tier_id BIGINT,
    vip_tier_name VARCHAR(100),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    period_type VARCHAR(20) DEFAULT 'SNAPSHOT',
    notes TEXT
);

CREATE INDEX idx_customer_ltv_customer ON customer_lifetime_value(customer_id);
CREATE INDEX idx_customer_ltv_calculated ON customer_lifetime_value(calculated_at DESC);
CREATE INDEX idx_customer_ltv_tier ON customer_lifetime_value(vip_tier_id);

ALTER TABLE customer_lifetime_value ADD CONSTRAINT fk_customer_ltv_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE customer_lifetime_value ADD CONSTRAINT fk_customer_ltv_tier FOREIGN KEY (vip_tier_id) REFERENCES member_pricing_tiers(id);

-- 8.3. Bảng customer_vip_history
CREATE TABLE customer_vip_history (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    old_tier_id BIGINT,
    old_tier_name VARCHAR(100),
    new_tier_id BIGINT NOT NULL,
    new_tier_name VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_value DECIMAL(15,2),
    order_id BIGINT,
    changed_by BIGINT,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vip_history_customer ON customer_vip_history(customer_id);
CREATE INDEX idx_vip_history_changed_at ON customer_vip_history(changed_at DESC);
CREATE INDEX idx_vip_history_order ON customer_vip_history(order_id) WHERE order_id IS NOT NULL;

ALTER TABLE customer_vip_history ADD CONSTRAINT fk_vip_history_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE customer_vip_history ADD CONSTRAINT fk_vip_history_old_tier FOREIGN KEY (old_tier_id) REFERENCES member_pricing_tiers(id);
ALTER TABLE customer_vip_history ADD CONSTRAINT fk_vip_history_new_tier FOREIGN KEY (new_tier_id) REFERENCES member_pricing_tiers(id);
ALTER TABLE customer_vip_history ADD CONSTRAINT fk_vip_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id);

-- ============================================================================
-- PHẦN 9: ORDERS & SHOPPING
-- ============================================================================

-- 9.1. Bảng orders (Enhanced với Rate Limiting & Tax Snapshot)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    -- FIX: Bỏ UNIQUE ở verification_code (có thể trùng nếu nhiều đơn hàng cùng lúc)
    verification_code VARCHAR(10) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    verification_code_expires_at TIMESTAMP,
    verification_attempts INTEGER DEFAULT 0,
    verification_sent_count INTEGER DEFAULT 0,
    verification_last_sent_at TIMESTAMP,
    verification_sent_limit INTEGER DEFAULT 5,
    verification_blocked_until TIMESTAMP,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_district VARCHAR(100),
    shipping_ward VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    subtotal DECIMAL(15,2) NOT NULL,
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    vip_discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    customer_vip_tier_id BIGINT,
    customer_vip_tier_name VARCHAR(100),
    vip_discount_percentage DECIMAL(5,2) DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    shipping_method VARCHAR(100),
    shipping_status VARCHAR(20) DEFAULT 'PENDING',
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    notes TEXT,
    promotion_code VARCHAR(50),
    promotion_id BIGINT,
    counted_towards_lifetime_value BOOLEAN DEFAULT FALSE,
    counted_at TIMESTAMP,
    tax_breakdown JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (verification_sent_count >= 0),
    CHECK (verification_attempts >= 0),
    CHECK (verification_sent_limit > 0)
);

CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_verification_code ON orders(verification_code);
-- Index hỗ trợ tìm kiếm OTP nhanh (verification_code + customer_email)
CREATE INDEX idx_orders_verify_lookup ON orders(verification_code, customer_email) WHERE status = 'PENDING';
CREATE INDEX idx_orders_email_verified ON orders(email_verified) WHERE email_verified = false;
CREATE INDEX idx_orders_verification_sent ON orders(verification_last_sent_at) WHERE verification_last_sent_at IS NOT NULL;
CREATE INDEX idx_orders_verification_blocked ON orders(verification_blocked_until) WHERE verification_blocked_until IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_promotion ON orders(promotion_id);
CREATE INDEX idx_orders_counted_ltv ON orders(counted_towards_lifetime_value) WHERE counted_towards_lifetime_value = false;

ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_vip_tier FOREIGN KEY (customer_vip_tier_id) REFERENCES member_pricing_tiers(id);

-- 9.2. Bảng order_items (Enhanced với Tax Snapshot)
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    subtotal DECIMAL(15,2) NOT NULL,
    gift_product_id BIGINT,
    gift_name VARCHAR(255),
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_class_id BIGINT,
    tax_class_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 100)),
    CHECK (tax_amount >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_variant ON order_items(product_variant_id);
CREATE INDEX idx_order_items_tax_rate ON order_items(tax_rate);
CREATE INDEX idx_order_items_tax_class ON order_items(tax_class_id);

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_gift FOREIGN KEY (gift_product_id) REFERENCES products(id);

-- Comments for tax snapshot
COMMENT ON COLUMN order_items.tax_rate IS 'Thuế suất tại thời điểm mua (Snapshot)';
COMMENT ON COLUMN order_items.tax_amount IS 'Số tiền thuế tại thời điểm mua (Snapshot)';
COMMENT ON COLUMN order_items.tax_class_id IS 'ID của tax class tại thời điểm mua (Snapshot)';
COMMENT ON COLUMN order_items.tax_class_name IS 'Tên tax class tại thời điểm mua (Snapshot)';
COMMENT ON COLUMN orders.tax_breakdown IS 'Cấu trúc thuế chi tiết (JSON) tại thời điểm mua';

-- 9.3. Bảng carts
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT,
    session_id VARCHAR(255),
    product_variant_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, product_variant_id),
    UNIQUE(session_id, product_variant_id)
);

CREATE INDEX idx_carts_customer ON carts(customer_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_expires ON carts(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE carts ADD CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE carts ADD CONSTRAINT fk_carts_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);

-- 9.4. Bảng addresses
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT,
    user_id BIGINT,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Vietnam',
    is_default BOOLEAN DEFAULT FALSE,
    address_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_addresses_owner CHECK (
        (customer_id IS NOT NULL AND user_id IS NULL) OR
        (customer_id IS NULL AND user_id IS NOT NULL) OR
        (customer_id IS NOT NULL AND user_id IS NOT NULL)
    )
);

CREATE INDEX idx_addresses_customer ON addresses(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_addresses_user ON addresses(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_addresses_default_customer ON addresses(customer_id, is_default) WHERE customer_id IS NOT NULL AND is_default = true;
CREATE INDEX idx_addresses_default_user ON addresses(user_id, is_default) WHERE user_id IS NOT NULL AND is_default = true;
CREATE INDEX idx_addresses_type ON addresses(address_type);

ALTER TABLE addresses ADD CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 9.5. Bảng payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    transaction_id VARCHAR(255) UNIQUE,
    gateway_response JSONB,
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
CREATE INDEX idx_payments_gateway_response ON payments USING GIN (gateway_response);

ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id);

-- 9.6. Sequence cho Refund Number (QUAN TRỌNG: Phải tạo trước bảng refunds)
-- Java code sẽ sử dụng sequence này để generate refund_number
CREATE SEQUENCE refund_number_seq START 1;
COMMENT ON SEQUENCE refund_number_seq IS 'Sequence để generate mã hoàn tiền (Java code sẽ dùng)';

-- 9.7. Bảng refunds
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

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_refund_number ON refunds(refund_number);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- 9.8. Bảng refund_items
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
    FOREIGN KEY (restocked_warehouse_id) REFERENCES warehouses(id),
    CHECK (quantity > 0),
    CHECK (refund_amount >= 0)
);

CREATE INDEX idx_refund_items_refund ON refund_items(refund_id);
CREATE INDEX idx_refund_items_restocked ON refund_items(restocked) WHERE restocked = false;

-- ============================================================================
-- PHẦN 10: PRODUCT RELATIONSHIPS & BUNDLING
-- ============================================================================

-- 10.1. Bảng product_bundles
CREATE TABLE product_bundles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    bundle_price DECIMAL(15,2) NOT NULL,
    original_total_price DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    discount_percentage DECIMAL(5,2),
    bundle_type VARCHAR(50) NOT NULL,
    is_customizable BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bundles_slug ON product_bundles(slug);
CREATE INDEX idx_bundles_type ON product_bundles(bundle_type);
CREATE INDEX idx_bundles_status ON product_bundles(status);
CREATE INDEX idx_bundles_dates ON product_bundles(start_date, end_date);

-- 10.2. Bảng bundle_items
CREATE TABLE bundle_items (
    id BIGSERIAL PRIMARY KEY,
    bundle_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bundle_id, product_id, product_variant_id)
);

CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON bundle_items(product_id);

ALTER TABLE bundle_items ADD CONSTRAINT fk_bundle_items_bundle FOREIGN KEY (bundle_id) REFERENCES product_bundles(id) ON DELETE CASCADE;
ALTER TABLE bundle_items ADD CONSTRAINT fk_bundle_items_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE bundle_items ADD CONSTRAINT fk_bundle_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);

-- 10.3. Bảng product_gifts
CREATE TABLE product_gifts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    gift_product_id BIGINT,
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

ALTER TABLE product_gifts ADD CONSTRAINT fk_gifts_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_gifts ADD CONSTRAINT fk_gifts_gift_product FOREIGN KEY (gift_product_id) REFERENCES products(id);

-- 10.4. Bảng related_products
CREATE TABLE related_products (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    related_product_id BIGINT NOT NULL,
    relation_type VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, related_product_id)
);

CREATE INDEX idx_related_product ON related_products(product_id);
CREATE INDEX idx_related_related ON related_products(related_product_id);
CREATE INDEX idx_related_type ON related_products(relation_type);

ALTER TABLE related_products ADD CONSTRAINT fk_related_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE related_products ADD CONSTRAINT fk_related_related FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 10.5. Bảng product_comparisons
CREATE TABLE product_comparisons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    session_id VARCHAR(255),
    product_ids BIGINT[] NOT NULL,
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_ids),
    UNIQUE(session_id, product_ids)
);

CREATE INDEX idx_comparisons_user ON product_comparisons(user_id);
CREATE INDEX idx_comparisons_session ON product_comparisons(session_id);
CREATE INDEX idx_comparisons_compared_at ON product_comparisons(compared_at DESC);

ALTER TABLE product_comparisons ADD CONSTRAINT fk_comparisons_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 10.6. Bảng product_specifications
CREATE TABLE product_specifications (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    specification_key VARCHAR(100) NOT NULL,
    specification_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specs_product ON product_specifications(product_id);

ALTER TABLE product_specifications ADD CONSTRAINT fk_specs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ============================================================================
-- PHẦN 11: REVIEWS & RATINGS
-- ============================================================================

-- 11.1. Bảng reviews
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT,
    order_id BIGINT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    moderated_by BIGINT,
    moderated_at TIMESTAMP,
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified_purchase) WHERE is_verified_purchase = true;

ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(id);

-- 11.2. Bảng review_images
CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);

ALTER TABLE review_images ADD CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

-- 11.3. Bảng review_helpful
CREATE TABLE review_helpful (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_helpful_review ON review_helpful(review_id);
CREATE INDEX idx_review_helpful_user ON review_helpful(user_id);

ALTER TABLE review_helpful ADD CONSTRAINT fk_review_helpful_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;
ALTER TABLE review_helpful ADD CONSTRAINT fk_review_helpful_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 11.4. Bảng product_stats (Cache số liệu thống kê)
CREATE TABLE product_stats (
    product_id BIGINT PRIMARY KEY,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_verified_reviews INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CHECK (average_rating >= 0 AND average_rating <= 5),
    CHECK (total_reviews >= 0 AND total_sold >= 0)
);

-- ============================================================================
-- PHẦN 12: PROMOTIONS
-- ============================================================================

-- 12.1. Bảng promotions
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(15,2),
    min_purchase_amount DECIMAL(15,2) DEFAULT 0,
    max_discount_amount DECIMAL(15,2),
    applicable_to VARCHAR(50),
    applicable_products JSONB,
    applicable_categories JSONB,
    applicable_brands JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_applicable ON promotions(applicable_to);
CREATE INDEX idx_promotions_applicable_products ON promotions USING GIN (applicable_products);
CREATE INDEX idx_promotions_applicable_categories ON promotions USING GIN (applicable_categories);
CREATE INDEX idx_promotions_applicable_brands ON promotions USING GIN (applicable_brands);

-- 12.2. Bảng promotion_usage
CREATE TABLE promotion_usage (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    customer_id BIGINT,
    user_id BIGINT,
    order_id BIGINT,
    discount_amount DECIMAL(15,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotion_usage_promo ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_customer ON promotion_usage(customer_id);
CREATE INDEX idx_promotion_usage_user ON promotion_usage(user_id);
CREATE INDEX idx_promotion_usage_order ON promotion_usage(order_id);

ALTER TABLE promotion_usage ADD CONSTRAINT fk_promotion_usage_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id);
ALTER TABLE promotion_usage ADD CONSTRAINT fk_promotion_usage_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE promotion_usage ADD CONSTRAINT fk_promotion_usage_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE promotion_usage ADD CONSTRAINT fk_promotion_usage_order FOREIGN KEY (order_id) REFERENCES orders(id);

-- Foreign key cho promotion_id trong orders
ALTER TABLE orders ADD CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id);

-- 12.3. Bảng promotion_applicable_products (Many-to-Many thay thế JSONB)
CREATE TABLE promotion_applicable_products (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, product_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_promo_app_prod_promo ON promotion_applicable_products(promotion_id);
CREATE INDEX idx_promo_app_prod_prod ON promotion_applicable_products(product_id);

-- 12.4. Bảng promotion_applicable_categories (Many-to-Many thay thế JSONB)
CREATE TABLE promotion_applicable_categories (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, category_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_promo_app_cat_promo ON promotion_applicable_categories(promotion_id);
CREATE INDEX idx_promo_app_cat_cat ON promotion_applicable_categories(category_id);

-- ============================================================================
-- PHẦN 13: ANALYTICS & SEO
-- ============================================================================

-- 13.1. Bảng product_views
CREATE TABLE product_views (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(255),
    view_duration_seconds INTEGER,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referrer_url VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    user_agent TEXT,
    ip_address VARCHAR(45),
    added_to_cart BOOLEAN DEFAULT FALSE,
    added_to_cart_at TIMESTAMP,
    purchased BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP,
    order_id BIGINT
);

CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_session ON product_views(session_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at DESC);
CREATE INDEX idx_product_views_conversion ON product_views(purchased) WHERE purchased = true;

ALTER TABLE product_views ADD CONSTRAINT fk_product_views_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_views ADD CONSTRAINT fk_product_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE product_views ADD CONSTRAINT fk_product_views_order FOREIGN KEY (order_id) REFERENCES orders(id);

-- 13.2. Bảng product_conversion_tracking
CREATE TABLE product_conversion_tracking (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    add_to_carts INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    view_to_cart_rate DECIMAL(5,2) DEFAULT 0,
    cart_to_purchase_rate DECIMAL(5,2) DEFAULT 0,
    view_to_purchase_rate DECIMAL(5,2) DEFAULT 0,
    avg_view_duration INTEGER DEFAULT 0,
    avg_order_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, date)
);

CREATE INDEX idx_conversion_product ON product_conversion_tracking(product_id);
CREATE INDEX idx_conversion_date ON product_conversion_tracking(date DESC);
CREATE INDEX idx_conversion_rates ON product_conversion_tracking(view_to_purchase_rate DESC);

ALTER TABLE product_conversion_tracking ADD CONSTRAINT fk_conversion_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 13.3. Bảng search_queries
CREATE TABLE search_queries (
    id BIGSERIAL PRIMARY KEY,
    query_text VARCHAR(500) NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(255),
    results_count INTEGER DEFAULT 0,
    clicked_product_id BIGINT,
    clicked_at TIMESTAMP,
    filters_applied JSONB,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_queries_text ON search_queries(query_text);
CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_created ON search_queries(created_at DESC);
CREATE INDEX idx_search_queries_clicked ON search_queries(clicked_product_id) WHERE clicked_product_id IS NOT NULL;
CREATE INDEX idx_search_queries_filters ON search_queries USING GIN (filters_applied);

ALTER TABLE search_queries ADD CONSTRAINT fk_search_queries_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE search_queries ADD CONSTRAINT fk_search_queries_product FOREIGN KEY (clicked_product_id) REFERENCES products(id);

-- 13.4. Bảng seo_urls
CREATE TABLE seo_urls (
    id BIGSERIAL PRIMARY KEY,
    old_url VARCHAR(500) NOT NULL UNIQUE,
    new_url VARCHAR(500) NOT NULL,
    canonical_url VARCHAR(500),
    redirect_type VARCHAR(20) DEFAULT '301',
    entity_type VARCHAR(50),
    entity_id BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    redirect_count INTEGER DEFAULT 0,
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_urls_old ON seo_urls(old_url);
CREATE INDEX idx_seo_urls_new ON seo_urls(new_url);
CREATE INDEX idx_seo_urls_entity ON seo_urls(entity_type, entity_id);
CREATE INDEX idx_seo_urls_status ON seo_urls(status);

ALTER TABLE seo_urls ADD CONSTRAINT fk_seo_urls_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- 13.5. Bảng url_slugs_history
CREATE TABLE url_slugs_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_slug VARCHAR(255) NOT NULL,
    new_slug VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT
);

CREATE INDEX idx_slugs_history_entity ON url_slugs_history(entity_type, entity_id);
CREATE INDEX idx_slugs_history_old_slug ON url_slugs_history(old_slug);

ALTER TABLE url_slugs_history ADD CONSTRAINT fk_slugs_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id);

-- ============================================================================
-- PHẦN 14: USER FEATURES
-- ============================================================================

-- 14.1. Bảng wishlists
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ============================================================================
-- PHẦN 15: DATABASE FUNCTIONS & TRIGGERS
-- ============================================================================

-- 15.1. Function: calculate_total_available_stock
CREATE OR REPLACE FUNCTION calculate_total_available_stock(p_product_variant_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    total_available INTEGER;
BEGIN
    SELECT COALESCE(SUM(available_quantity), 0)
    INTO total_available
    FROM warehouse_stock
    WHERE product_variant_id = p_product_variant_id;

    RETURN total_available;
END;
$$ LANGUAGE plpgsql;

-- 15.2. Function: sync_variant_stock_from_warehouses
-- Trigger tự động sync stock từ warehouse_stock sang product_variants.stock_quantity
CREATE OR REPLACE FUNCTION sync_variant_stock_from_warehouses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE product_variants
    SET stock_quantity = calculate_total_available_stock(NEW.product_variant_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_variant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động sync stock khi warehouse_stock thay đổi
CREATE TRIGGER trg_sync_variant_stock
    AFTER INSERT OR UPDATE OR DELETE ON warehouse_stock
    FOR EACH ROW
    EXECUTE FUNCTION sync_variant_stock_from_warehouses();

-- 15.3. Function: validate_color_code
CREATE OR REPLACE FUNCTION validate_color_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.color_code IS NOT NULL AND NEW.color_code !~ '^#[0-9A-Fa-f]{6}$' THEN
        RAISE EXCEPTION 'Invalid color code format. Must be #RRGGBB';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validate color code format
CREATE TRIGGER trg_validate_color_code
    BEFORE INSERT OR UPDATE ON attribute_values
    FOR EACH ROW
    EXECUTE FUNCTION validate_color_code();

-- 15.4. Function: generate_variant_slug
CREATE OR REPLACE FUNCTION generate_variant_slug()
RETURNS TRIGGER AS $$
DECLARE
    brand_name VARCHAR;
    product_name VARCHAR;
    base_slug VARCHAR;
    counter INTEGER := 1;
    final_slug VARCHAR;
BEGIN
    SELECT b.name, p.name INTO brand_name, product_name
    FROM products p JOIN brands b ON p.brand_id = b.id
    WHERE p.id = NEW.product_id;

    base_slug := lower(regexp_replace(
        brand_name || '-' || product_name || '-' || COALESCE(NEW.concentration_code, ''),
        '[^a-zA-Z0-9]+', '-', 'g'
    ));

    base_slug := regexp_replace(base_slug, '-+$', '');
    final_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM product_variants WHERE slug = final_slug AND id != COALESCE(NEW.id, 0)) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    NEW.slug := final_slug;
    NEW.variant_name := brand_name || ' ' || product_name || ' ' || COALESCE(NEW.concentration_code, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate variant slug và variant_name
CREATE TRIGGER trg_generate_variant_slug
    BEFORE INSERT ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION generate_variant_slug();

-- 15.5. Function: ensure_one_default_variant
CREATE OR REPLACE FUNCTION ensure_one_default_variant()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE product_variants
        SET is_default = false
        WHERE product_id = NEW.product_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Đảm bảo chỉ có một default variant per product
CREATE TRIGGER trg_ensure_one_default_variant
    BEFORE INSERT OR UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_default_variant();

-- 15.6. Function: update_stock_status
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity <= 0 THEN
        IF NEW.allow_backorder = true OR NEW.allow_out_of_stock_purchase = true THEN
            NEW.stock_status := 'BACKORDER';
        ELSE
            NEW.stock_status := 'OUT_OF_STOCK';
        END IF;
    ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
        NEW.stock_status := 'LOW_STOCK';
    ELSE
        NEW.stock_status := 'IN_STOCK';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động cập nhật stock_status
CREATE TRIGGER trg_update_stock_status
    BEFORE INSERT OR UPDATE OF stock_quantity, allow_backorder, allow_out_of_stock_purchase
    ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_status();

-- 15.7. Function: sync_reserved_quantity_to_warehouse_stock
-- Trigger tự động sync reserved_quantity từ stock_reservations vào warehouse_stock
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

-- 15.8. Function: update_product_stats_on_review
-- Trigger tự động update product_stats khi có thay đổi reviews
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

    -- Xử lý trường hợp không còn review nào -> Reset về 0
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = affected_product_id AND status = 'APPROVED') THEN
        UPDATE product_stats
        SET average_rating = 0, total_reviews = 0, total_verified_reviews = 0
        WHERE product_id = affected_product_id;
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_stats_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_on_review();

-- ============================================================================
-- PHẦN 16: SEED DATA (Optional - có thể tách ra file riêng)
-- ============================================================================

-- Seed VIP Tiers (nếu chưa có)
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
 'Tổng chi tiêu > 50.000.000 đ. Giảm giá 10% cho mọi đơn hàng, ưu tiên cao nhất, quà tặng độc quyền.', 'ACTIVE')
ON CONFLICT (tier_name) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================