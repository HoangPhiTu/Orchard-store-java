package com.orchard.orchard_store_backend.modules.catalog.product.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ImageDeletionQueue;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageDeletionService;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller cho upload ảnh lên MinIO
 * 
 * Endpoint: POST /api/admin/upload
 * 
 * Request:
 * - file: MultipartFile (ảnh cần upload)
 * - folder: String (tên folder trong bucket, optional, default: "others")
 * 
 * Response:
 * - ApiResponse<String> với data là URL đầy đủ của ảnh
 */
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class UploadController {

    private final ImageUploadService imageUploadService;
    private final ImageDeletionService imageDeletionService;

    /**
     * Upload một file ảnh lên MinIO
     * 
     * POST /api/admin/upload
     * 
     * @param file File ảnh cần upload (required)
     * @param folder Tên folder trong bucket (optional, default: "others")
     * @return ApiResponse<String> với URL đầy đủ của ảnh
     */
    @PostMapping
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "others") String folder
    ) {
        log.info("POST /api/admin/upload - folder: {}, filename: {}, size: {} bytes", 
                folder, file.getOriginalFilename(), file.getSize());

        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File không được để trống"));
            }

            // Upload ảnh lên MinIO
            String imageUrl = imageUploadService.uploadImage(file, folder);

            log.info("Image uploaded successfully: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", imageUrl));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Không thể upload ảnh: " + e.getMessage()));
        }
    }

    /**
     * Xóa file ảnh khỏi MinIO
     *
     * DELETE /api/admin/upload?imageUrl={url}
     *
     * @param imageUrl URL đầy đủ của ảnh cần xóa
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam("imageUrl") String imageUrl
    ) {
        log.info("DELETE /api/admin/upload - imageUrl: {}", imageUrl);

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Thiếu tham số imageUrl"));
        }

        try {
            imageUploadService.deleteImage(imageUrl);
            return ResponseEntity.ok(ApiResponse.success("Đã xử lý yêu cầu xóa ảnh", null));
        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Không thể xóa ảnh: " + e.getMessage()));
        }
    }

    /**
     * Mark image for deletion (soft delete)
     * 
     * POST /api/admin/upload/mark-for-deletion
     * 
     * Request Body:
     * {
     *   "imageUrl": "http://...",
     *   "entityType": "users",
     *   "entityId": 123,
     *   "reason": "REPLACED"
     * }
     * 
     * @param request Mark for deletion request
     * @return ApiResponse<ImageDeletionQueue> với record đã tạo
     */
    @PostMapping("/mark-for-deletion")
    public ResponseEntity<ApiResponse<ImageDeletionQueue>> markForDeletion(
            @RequestBody MarkForDeletionRequest request
    ) {
        log.info("POST /api/admin/upload/mark-for-deletion - imageUrl: {}, entityType: {}, entityId: {}, reason: {}",
                request.imageUrl(), request.entityType(), request.entityId(), request.reason());

        try {
            if (request.imageUrl() == null || request.imageUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Image URL không được để trống"));
            }

            if (request.entityType() == null || request.entityType().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Entity type không được để trống"));
            }

            // Convert reason string to enum
            ImageDeletionQueue.DeletionReason reason;
            try {
                reason = ImageDeletionQueue.DeletionReason.valueOf(
                        request.reason() != null ? request.reason().toUpperCase() : "REPLACED"
                );
            } catch (IllegalArgumentException e) {
                reason = ImageDeletionQueue.DeletionReason.REPLACED;
            }

            ImageDeletionQueue queue = imageDeletionService.markForDeletion(
                    request.imageUrl(),
                    request.entityType(),
                    request.entityId(),
                    reason
            );

            return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu ảnh để xóa", queue));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Error marking image for deletion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Không thể đánh dấu ảnh để xóa: " + e.getMessage()));
        }
    }

    /**
     * Mark multiple images for deletion (batch)
     * 
     * POST /api/admin/upload/mark-for-deletion/batch
     * 
     * Request Body:
     * {
     *   "images": [
     *     {
     *       "imageUrl": "http://...",
     *       "entityType": "users",
     *       "entityId": 123,
     *       "reason": "REPLACED"
     *     }
     *   ]
     * }
     * 
     * @param request Batch mark for deletion request
     * @return ApiResponse<List<ImageDeletionQueue>> với danh sách records đã tạo
     */
    @PostMapping("/mark-for-deletion/batch")
    public ResponseEntity<ApiResponse<List<ImageDeletionQueue>>> markBatchForDeletion(
            @RequestBody BatchMarkForDeletionRequest request
    ) {
        log.info("POST /api/admin/upload/mark-for-deletion/batch - count: {}",
                request.images() != null ? request.images().size() : 0);

        try {
            if (request.images() == null || request.images().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Danh sách images không được để trống"));
            }

            // Convert to service requests
            List<ImageDeletionService.MarkForDeletionRequest> serviceRequests = request.images().stream()
                    .map(req -> {
                        ImageDeletionQueue.DeletionReason reason;
                        try {
                            reason = ImageDeletionQueue.DeletionReason.valueOf(
                                    req.reason() != null ? req.reason().toUpperCase() : "REPLACED"
                            );
                        } catch (IllegalArgumentException e) {
                            reason = ImageDeletionQueue.DeletionReason.REPLACED;
                        }

                        return new ImageDeletionService.MarkForDeletionRequest(
                                req.imageUrl(),
                                req.entityType(),
                                req.entityId(),
                                reason
                        );
                    })
                    .toList();

            List<ImageDeletionQueue> queues = imageDeletionService.markBatchForDeletion(serviceRequests);

            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Đã đánh dấu %d ảnh để xóa", queues.size()),
                    queues
            ));
        } catch (Exception e) {
            log.error("Error marking images for deletion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Không thể đánh dấu ảnh để xóa: " + e.getMessage()));
        }
    }

    /**
     * Request DTO for mark for deletion
     */
    public record MarkForDeletionRequest(
            String imageUrl,
            String entityType,
            Long entityId,
            String reason
    ) {}

    /**
     * Request DTO for batch mark for deletion
     */
    public record BatchMarkForDeletionRequest(
            List<MarkForDeletionRequest> images
    ) {}
}

