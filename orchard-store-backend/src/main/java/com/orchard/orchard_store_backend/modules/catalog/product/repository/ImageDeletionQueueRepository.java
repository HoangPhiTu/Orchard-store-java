package com.orchard.orchard_store_backend.modules.catalog.product.repository;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ImageDeletionQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho ImageDeletionQueue
 */
@Repository
public interface ImageDeletionQueueRepository extends JpaRepository<ImageDeletionQueue, Long> {

    /**
     * Tìm queue record theo image URL
     */
    Optional<ImageDeletionQueue> findByImageUrl(String imageUrl);

    /**
     * Tìm tất cả records có status PENDING và marked_at > threshold (để cleanup)
     * 
     * @param threshold Thời điểm threshold (ví dụ: 24 giờ trước)
     * @return Danh sách records cần xử lý
     */
    @Query("SELECT q FROM ImageDeletionQueue q " +
           "WHERE q.status = :status " +
           "AND q.markedAt <= :threshold " +
           "ORDER BY q.markedAt ASC")
    List<ImageDeletionQueue> findPendingRecordsForCleanup(
            @Param("status") ImageDeletionQueue.DeletionStatus status,
            @Param("threshold") LocalDateTime threshold
    );

    /**
     * Đếm số lượng records pending
     */
    long countByStatus(ImageDeletionQueue.DeletionStatus status);

    /**
     * Tìm records theo entity type và entity id
     */
    List<ImageDeletionQueue> findByEntityTypeAndEntityId(String entityType, Long entityId);

    /**
     * Xóa records đã completed quá lâu (cleanup old records)
     * 
     * @param threshold Thời điểm threshold (ví dụ: 30 ngày trước)
     */
    @Query("DELETE FROM ImageDeletionQueue q " +
           "WHERE q.status = :status " +
           "AND q.deletedAt <= :threshold")
    void deleteOldCompletedRecords(
            @Param("status") ImageDeletionQueue.DeletionStatus status,
            @Param("threshold") LocalDateTime threshold
    );
}

