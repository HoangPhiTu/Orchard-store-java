-- Migration: Create image_deletion_queue table
-- Purpose: Support soft delete strategy for images
-- Date: 2024-11-29

CREATE TABLE image_deletion_queue (
    id BIGSERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    reason VARCHAR(100),
    marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_image_deletion_marked_at ON image_deletion_queue(marked_at);
CREATE INDEX idx_image_deletion_status ON image_deletion_queue(status);
CREATE INDEX idx_image_deletion_entity ON image_deletion_queue(entity_type, entity_id);

-- Add comment
COMMENT ON TABLE image_deletion_queue IS 'Queue để quản lý soft delete của images. Images được mark for deletion thay vì xóa ngay để đảm bảo data consistency.';
COMMENT ON COLUMN image_deletion_queue.image_url IS 'URL đầy đủ của ảnh cần xóa';
COMMENT ON COLUMN image_deletion_queue.entity_type IS 'Loại entity (users, brands, categories, products, etc.)';
COMMENT ON COLUMN image_deletion_queue.entity_id IS 'ID của entity (optional)';
COMMENT ON COLUMN image_deletion_queue.reason IS 'Lý do xóa: REPLACED, REMOVED, ENTITY_DELETED, ORPHANED';
COMMENT ON COLUMN image_deletion_queue.marked_at IS 'Thời điểm mark for deletion';
COMMENT ON COLUMN image_deletion_queue.deleted_at IS 'Thời điểm xóa vật lý (sau khi cleanup job xóa thành công)';
COMMENT ON COLUMN image_deletion_queue.status IS 'Trạng thái: PENDING, PROCESSING, COMPLETED, FAILED';

