package com.orchard.orchard_store_backend.modules.catalog.product.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Implementation của ImageUploadService sử dụng local file storage.
 * 
 * Lưu file vào thư mục uploads/ trong dự án.
 * Sau này có thể thay thế bằng S3Service hoặc CloudStorageService.
 */
@Service
@Slf4j
public class LocalStorageService implements ImageUploadService {

    /**
     * Thư mục gốc để lưu file uploads
     * Mặc định: uploads/ (trong project root)
     */
    @Value("${app.upload.directory:uploads}")
    private String uploadDirectory;

    /**
     * Base URL để truy cập file
     * Mặc định: /uploads/
     */
    @Value("${app.upload.base-url:/uploads/}")
    private String baseUrl;

    /**
     * Kích thước file tối đa (bytes)
     * Mặc định: 5MB
     */
    @Value("${app.upload.max-file-size:5242880}")
    private long maxFileSize;

    /**
     * Các extension được phép
     */
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    @Override
    public String uploadImage(MultipartFile file, String folderName) {
        validateImage(file);

        try {
            // Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDirectory, folderName);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Đã tạo thư mục: {}", uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Copy file vào thư mục
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Tạo URL để trả về
            String imageUrl = baseUrl + folderName + "/" + uniqueFilename;
            log.info("Đã upload file: {} -> {}", originalFilename, imageUrl);

            return imageUrl;
        } catch (IOException e) {
            log.error("Lỗi khi upload file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Không thể upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folderName) {
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String imageUrl = uploadImage(file, folderName);
                imageUrls.add(imageUrl);
            }
        }
        return imageUrls;
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            log.warn("Image URL không được để trống khi xóa ảnh (local storage)");
            return;
        }

        try {
            String relativePath = imageUrl.replaceFirst("^" + baseUrl, "");
            Path filePath = Paths.get(uploadDirectory, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Đã xóa file: {}", filePath);
            } else {
                log.warn("Không tìm thấy file để xóa: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Lỗi khi xóa file: {}", imageUrl, e);
        }
    }

    @Override
    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được để trống");
        }

        // Kiểm tra kích thước file
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    String.format("Kích thước file vượt quá giới hạn. Tối đa: %d MB", maxFileSize / 1024 / 1024)
            );
        }

        // Kiểm tra extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("Extension không được phép. Chỉ chấp nhận: %s", String.join(", ", ALLOWED_EXTENSIONS))
            );
        }

        // Kiểm tra content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File phải là ảnh");
        }
    }

    /**
     * Lấy extension từ tên file.
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}

