package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity để quản lý queue xóa ảnh (soft delete)
 * 
 * Images được mark for deletion thay vì xóa ngay để đảm bảo data consistency.
 * Cleanup job sẽ xóa vật lý sau khi verify DB transaction thành công.
 */
@Entity
@Table(name = "image_deletion_queue", indexes = {
    @Index(name = "idx_image_deletion_marked_at", columnList = "marked_at"),
    @Index(name = "idx_image_deletion_status", columnList = "status"),
    @Index(name = "idx_image_deletion_entity", columnList = "entity_type,entity_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageDeletionQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * URL đầy đủ của ảnh cần xóa
     */
    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    /**
     * Loại entity (users, brands, categories, products, etc.)
     */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /**
     * ID của entity (optional)
     */
    @Column(name = "entity_id")
    private Long entityId;

    /**
     * Lý do xóa
     */
    @Column(name = "reason", length = 100)
    @Enumerated(EnumType.STRING)
    private DeletionReason reason;

    /**
     * Thời điểm mark for deletion
     */
    @CreationTimestamp
    @Column(name = "marked_at", nullable = false, updatable = false)
    private LocalDateTime markedAt;

    /**
     * Thời điểm xóa vật lý (sau khi cleanup job xóa thành công)
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Trạng thái xử lý
     */
    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DeletionStatus status = DeletionStatus.PENDING;

    /**
     * Thời điểm cập nhật cuối cùng
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Lý do xóa
     */
    public enum DeletionReason {
        REPLACED,      // Ảnh bị thay thế bởi ảnh mới
        REMOVED,      // User xóa ảnh
        ENTITY_DELETED, // Entity bị xóa
        ORPHANED      // Ảnh mồ côi (upload nhưng không được lưu vào DB)
    }

    /**
     * Trạng thái xử lý
     */
    public enum DeletionStatus {
        PENDING,      // Chờ xử lý
        PROCESSING,   // Đang xử lý
        COMPLETED,    // Đã xóa thành công
        FAILED        // Xóa thất bại (có thể retry)
    }
}

