package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.orchard.orchard_store_backend.modules.catalog.product.entity.ImageDeletionQueue;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ImageDeletionQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service để quản lý soft delete của images
 * 
 * Implements soft delete strategy:
 * - Mark images for deletion thay vì xóa ngay
 * - Cleanup job sẽ xóa vật lý sau khi verify DB transaction thành công
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageDeletionService {

    private final ImageDeletionQueueRepository repository;
    private final ImageUploadService imageUploadService;

    /**
     * Mark image for deletion (soft delete)
     * 
     * @param imageUrl URL của ảnh cần xóa
     * @param entityType Loại entity (users, brands, categories, etc.)
     * @param entityId ID của entity (optional)
     * @param reason Lý do xóa
     * @return ImageDeletionQueue record
     */
    @Transactional
    public ImageDeletionQueue markForDeletion(
            String imageUrl,
            String entityType,
            Long entityId,
            ImageDeletionQueue.DeletionReason reason
    ) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Image URL không được để trống");
        }

        // Kiểm tra xem đã có record chưa (tránh duplicate)
        var existingOpt = repository.findByImageUrl(imageUrl);

        if (existingOpt.isPresent()) {
            ImageDeletionQueue existing = existingOpt.get();
            // Nếu đã có record và đang pending, không tạo mới
            if (existing.getStatus() == ImageDeletionQueue.DeletionStatus.PENDING) {
                log.debug("Image already marked for deletion: {}", imageUrl);
                return existing;
            }
            // Nếu failed, reset về pending để retry
            if (existing.getStatus() == ImageDeletionQueue.DeletionStatus.FAILED) {
                existing.setStatus(ImageDeletionQueue.DeletionStatus.PENDING);
                existing.setMarkedAt(LocalDateTime.now());
                return repository.save(existing);
            }
        }

        // Tạo record mới
        ImageDeletionQueue queue = ImageDeletionQueue.builder()
                .imageUrl(imageUrl)
                .entityType(entityType)
                .entityId(entityId)
                .reason(reason)
                .status(ImageDeletionQueue.DeletionStatus.PENDING)
                .build();

        ImageDeletionQueue saved = repository.save(queue);
        log.info("Image marked for deletion: {} (entity: {}, id: {}, reason: {})",
                imageUrl, entityType, entityId, reason);

        return saved;
    }

    /**
     * Mark multiple images for deletion (batch)
     * 
     * @param requests Danh sách requests
     * @return Danh sách records đã tạo
     */
    @Transactional
    public List<ImageDeletionQueue> markBatchForDeletion(
            List<MarkForDeletionRequest> requests
    ) {
        return requests.stream()
                .map(req -> markForDeletion(
                        req.imageUrl(),
                        req.entityType(),
                        req.entityId(),
                        req.reason()
                ))
                .toList();
    }

    /**
     * Process pending deletions (called by cleanup job)
     * 
     * @param threshold Thời điểm threshold (ví dụ: 24 giờ trước)
     * @return Số lượng images đã xóa
     */
    @Transactional
    public int processPendingDeletions(LocalDateTime threshold) {
        List<ImageDeletionQueue> pendingRecords = repository.findPendingRecordsForCleanup(
                ImageDeletionQueue.DeletionStatus.PENDING,
                threshold
        );

        if (pendingRecords.isEmpty()) {
            log.debug("No pending deletions to process");
            return 0;
        }

        log.info("Processing {} pending deletions", pendingRecords.size());

        int deletedCount = 0;
        int failedCount = 0;

        for (ImageDeletionQueue record : pendingRecords) {
            try {
                // Mark as processing
                record.setStatus(ImageDeletionQueue.DeletionStatus.PROCESSING);
                repository.save(record);

                // Delete from MinIO
                imageUploadService.deleteImage(record.getImageUrl());

                // Mark as completed
                record.setStatus(ImageDeletionQueue.DeletionStatus.COMPLETED);
                record.setDeletedAt(LocalDateTime.now());
                repository.save(record);

                deletedCount++;
                log.debug("Deleted image: {}", record.getImageUrl());

            } catch (Exception e) {
                // Mark as failed
                record.setStatus(ImageDeletionQueue.DeletionStatus.FAILED);
                repository.save(record);

                failedCount++;
                log.error("Failed to delete image: {}", record.getImageUrl(), e);
            }
        }

        log.info("Cleanup completed: {} deleted, {} failed", deletedCount, failedCount);
        return deletedCount;
    }

    /**
     * Cleanup old completed records (archive old queue records)
     * 
     * @param threshold Thời điểm threshold (ví dụ: 30 ngày trước)
     * @return Số lượng records đã xóa
     */
    @Transactional
    public int cleanupOldRecords(LocalDateTime threshold) {
        try {
            repository.deleteOldCompletedRecords(
                    ImageDeletionQueue.DeletionStatus.COMPLETED,
                    threshold
            );
            log.info("Cleaned up old completed records before: {}", threshold);
            return 1; // JPA delete returns void, so we return 1 to indicate success
        } catch (Exception e) {
            log.error("Failed to cleanup old records", e);
            return 0;
        }
    }

    /**
     * Get pending count
     */
    public long getPendingCount() {
        return repository.countByStatus(ImageDeletionQueue.DeletionStatus.PENDING);
    }

    /**
     * Request DTO for mark for deletion
     */
    public record MarkForDeletionRequest(
            String imageUrl,
            String entityType,
            Long entityId,
            ImageDeletionQueue.DeletionReason reason
    ) {}
}

