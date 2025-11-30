package com.orchard.orchard_store_backend.modules.catalog.product.scheduler;

import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageDeletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled job để cleanup images đã được mark for deletion
 * 
 * Chạy mỗi đêm 2h AM để:
 * - Xóa images đã được mark > 24 giờ
 * - Cleanup old completed records
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ImageDeletionCleanupJob {

    private final ImageDeletionService imageDeletionService;

    /**
     * Cleanup pending deletions
     * Chạy mỗi đêm 2h AM
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2h AM mỗi ngày
    public void cleanupPendingDeletions() {
        try {
            log.info("Starting image deletion cleanup job...");

            // Process deletions marked > 24 hours ago
            LocalDateTime threshold = LocalDateTime.now().minusHours(24);
            int deletedCount = imageDeletionService.processPendingDeletions(threshold);

            log.info("Image deletion cleanup completed: {} images deleted", deletedCount);
        } catch (Exception e) {
            log.error("Failed to cleanup pending deletions", e);
        }
    }

    /**
     * Cleanup old completed records (archive)
     * Chạy mỗi tuần vào Chủ nhật 3h AM
     */
    @Scheduled(cron = "0 0 3 * * SUN") // 3h AM mỗi Chủ nhật
    public void cleanupOldRecords() {
        try {
            log.info("Starting old records cleanup job...");

            // Delete completed records older than 30 days
            LocalDateTime threshold = LocalDateTime.now().minusDays(30);
            imageDeletionService.cleanupOldRecords(threshold);

            log.info("Old records cleanup completed");
        } catch (Exception e) {
            log.error("Failed to cleanup old records", e);
        }
    }

    /**
     * Log pending count (for monitoring)
     * Chạy mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * ?") // Mỗi giờ
    public void logPendingCount() {
        try {
            long pendingCount = imageDeletionService.getPendingCount();
            if (pendingCount > 0) {
                log.debug("Pending image deletions: {}", pendingCount);
            }
        } catch (Exception e) {
            log.error("Failed to get pending count", e);
        }
    }
}

