package com.orchard.orchard_store_backend.modules.catalog.product.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}

