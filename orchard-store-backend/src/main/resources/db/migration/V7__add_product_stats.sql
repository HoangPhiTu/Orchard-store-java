-- 1. Bảng Product Stats
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

-- Constraints
ALTER TABLE product_stats
ADD CONSTRAINT chk_product_stats_rating CHECK (average_rating >= 0 AND average_rating <= 5),
ADD CONSTRAINT chk_product_stats_counts CHECK (total_reviews >= 0 AND total_sold >= 0);

-- 2. Trigger Update Review (Handle cả INSERT, UPDATE, DELETE)
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

