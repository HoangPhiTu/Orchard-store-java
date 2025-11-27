-- 1. Bảng quan hệ Many-to-Many
CREATE TABLE promotion_applicable_products (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, product_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE promotion_applicable_categories (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, category_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 2. Indexes cho tốc độ
CREATE INDEX idx_promo_app_prod_promo ON promotion_applicable_products(promotion_id);
CREATE INDEX idx_promo_app_prod_prod ON promotion_applicable_products(product_id);
CREATE INDEX idx_promo_app_cat_promo ON promotion_applicable_categories(promotion_id);
CREATE INDEX idx_promo_app_cat_cat ON promotion_applicable_categories(category_id);

-- 3. MIGRATE DATA (Chuyển dữ liệu cũ từ JSONB sang bảng mới)

-- Migrate Products
INSERT INTO promotion_applicable_products (promotion_id, product_id)
SELECT 
    p.id AS promotion_id,
    (jsonb_array_elements_text(p.applicable_products)::BIGINT) AS product_id
FROM promotions p
WHERE p.applicable_products IS NOT NULL 
  AND jsonb_array_length(p.applicable_products) > 0
ON CONFLICT DO NOTHING;

-- Migrate Categories
INSERT INTO promotion_applicable_categories (promotion_id, category_id)
SELECT 
    p.id AS promotion_id,
    (jsonb_array_elements_text(p.applicable_categories)::BIGINT) AS category_id
FROM promotions p
WHERE p.applicable_categories IS NOT NULL 
  AND jsonb_array_length(p.applicable_categories) > 0
ON CONFLICT DO NOTHING;

