package com.orchard.orchard_store_backend.modules.catalog.product.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * S3ImageService - Service để upload và delete ảnh lên MinIO (S3 Compatible)
 * 
 * Đặc điểm:
 * - Sử dụng AmazonS3 client để kết nối với MinIO
 * - Tạo tên file duy nhất bằng UUID
 * - Set quyền PublicRead để ảnh có thể truy cập công khai
 * - Trả về URL đầy đủ để frontend có thể hiển thị ảnh
 * 
 * @Primary: Đánh dấu đây là implementation mặc định của ImageUploadService
 */
@Service("s3ImageService")
@Primary
@RequiredArgsConstructor
@Slf4j
public class S3ImageService implements ImageUploadService {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.endpoint}")
    private String s3Endpoint;

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Validate cấu hình endpoint sau khi inject
     */
    @PostConstruct
    public void validateConfiguration() {
        if (s3Endpoint == null || s3Endpoint.trim().isEmpty()) {
            log.error("❌ S3 endpoint chưa được cấu hình trong application.properties");
            throw new IllegalStateException("cloud.aws.s3.endpoint is required");
        }
        
        if (bucketName == null || bucketName.trim().isEmpty()) {
            log.error("❌ S3 bucket name chưa được cấu hình trong application.properties");
            throw new IllegalStateException("cloud.aws.s3.bucket-name is required");
        }
        
        // Log cấu hình để debug
        log.info("✅ S3ImageService initialized:");
        log.info("   - Endpoint: {}", s3Endpoint);
        log.info("   - Bucket: {}", bucketName);
        log.info("   - URL Format: {}/{}/{{keyPath}}", s3Endpoint, bucketName);
    }

    /**
     * Upload ảnh lên MinIO bucket
     * 
     * @param file File cần upload (MultipartFile)
     * @param folderName Tên folder trong bucket (VD: "users", "products", "avatars")
     * @return URL đầy đủ của ảnh sau khi upload thành công
     * @throws IOException Nếu có lỗi khi đọc file
     * @throws IllegalArgumentException Nếu file rỗng hoặc không hợp lệ
     */
    @Override
    public String uploadImage(MultipartFile file, String folderName) {
        // Validate file trước khi upload
        validateImage(file);

        // Lấy content type
        String contentType = file.getContentType();

        // Tạo tên file duy nhất: UUID + "_" + originalFilename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "image";
        }

        // Lấy extension từ tên file gốc
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex);
        }

        // Tạo tên file mới: UUID + extension
        String fileName = UUID.randomUUID().toString() + extension;

        // Tạo key path: folderName/fileName
        String keyPath = folderName + "/" + fileName;

        log.info("Uploading image to S3: bucket={}, key={}, contentType={}, size={} bytes",
                bucketName, keyPath, contentType, file.getSize());

        try {
            // Tạo ObjectMetadata
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(contentType);

            // Đọc file input stream
            InputStream inputStream = file.getInputStream();

            // Tạo PutObjectRequest với PublicRead permission
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    bucketName,
                    keyPath,
                    inputStream,
                    metadata
            );

            // Set quyền PublicRead để ảnh có thể truy cập công khai
            putObjectRequest.setCannedAcl(CannedAccessControlList.PublicRead);

            // Upload lên S3/MinIO
            amazonS3.putObject(putObjectRequest);

            // Tạo URL đầy đủ: endpoint/bucketName/keyPath
            // Đảm bảo format chuẩn: http://127.0.0.1:9000/orchard-bucket/users/filename.jpg
            String imageUrl = buildImageUrl(keyPath);

            log.info("Image uploaded successfully: {}", imageUrl);

            return imageUrl;
        } catch (IOException e) {
            log.error("Error reading file input stream: bucket={}, key={}", bucketName, keyPath, e);
            throw new RuntimeException("Không thể đọc file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error uploading image to S3: bucket={}, key={}", bucketName, keyPath, e);
            throw new RuntimeException("Không thể upload ảnh lên MinIO: " + e.getMessage(), e);
        }
    }

    /**
     * Upload nhiều file ảnh và trả về danh sách URLs
     * 
     * @param files Danh sách MultipartFile cần upload
     * @param folderName Tên thư mục để lưu
     * @return Danh sách URLs của các file đã upload
     * @throws RuntimeException Nếu upload thất bại
     */
    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folderName) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Danh sách file không được để trống");
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                String imageUrl = uploadImage(file, folderName);
                imageUrls.add(imageUrl);
            } catch (Exception e) {
                log.error("Error uploading file: {}", file.getOriginalFilename(), e);
                // Tiếp tục upload các file khác, không throw exception
                // Hoặc có thể throw exception để dừng toàn bộ quá trình
                throw new RuntimeException("Không thể upload file: " + file.getOriginalFilename(), e);
            }
        }

        return imageUrls;
    }

    /**
     * Xóa ảnh từ MinIO bucket
     * 
     * @param imageUrl URL đầy đủ của ảnh cần xóa
     * @return true nếu xóa thành công, false nếu không tìm thấy file
     */
    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            log.warn("Image URL không được để trống khi xóa ảnh");
            return;
        }

        try {
            String key = extractKeyFromUrl(imageUrl);

            if (key == null || key.isEmpty()) {
                log.warn("Không thể trích xuất object key từ URL: {}", imageUrl);
                return;
            }

            log.info("Deleting image from S3: bucket={}, key={}", bucketName, key);

            if (!amazonS3.doesObjectExist(bucketName, key)) {
                log.warn("Image không tồn tại trong bucket: bucket={}, key={}", bucketName, key);
                return;
            }

            amazonS3.deleteObject(bucketName, key);

            log.info("Image deleted successfully: {}", imageUrl);
        } catch (Exception e) {
            log.error("Error deleting image from S3: url={}", imageUrl, e);
        }
    }

    /**
     * Validate file ảnh (kiểm tra extension, size, etc.)
     * 
     * @param file MultipartFile cần validate
     * @throws IllegalArgumentException Nếu file không hợp lệ
     */
    @Override
    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        // Kiểm tra content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File phải là ảnh (image/*). Nhận được: " + contentType);
        }

        // Kiểm tra size (tối đa 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 10MB. Nhận được: " + file.getSize() + " bytes");
        }

        // Kiểm tra extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && !originalFilename.isEmpty()) {
            String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "gif", "webp", "bmp");
            if (!allowedExtensions.contains(extension)) {
                throw new IllegalArgumentException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: " + String.join(", ", allowedExtensions));
            }
        }
    }

    /**
     * Build URL đầy đủ cho ảnh từ MinIO
     * 
     * Format: http://127.0.0.1:9000/orchard-bucket/users/filename.jpg
     * 
     * @param keyPath Key path trong bucket (VD: "users/avatar-123.jpg")
     * @return URL đầy đủ có thể truy cập từ trình duyệt
     */
    private String buildImageUrl(String keyPath) {
        // Loại bỏ trailing slash từ endpoint nếu có
        String normalizedEndpoint = s3Endpoint;
        if (normalizedEndpoint.endsWith("/")) {
            normalizedEndpoint = normalizedEndpoint.substring(0, normalizedEndpoint.length() - 1);
        }
        
        // Loại bỏ leading slash từ keyPath nếu có
        String normalizedKeyPath = keyPath;
        if (normalizedKeyPath.startsWith("/")) {
            normalizedKeyPath = normalizedKeyPath.substring(1);
        }
        
        // Ghép URL: endpoint/bucketName/keyPath
        // Ví dụ: http://127.0.0.1:9000/orchard-bucket/users/avatar-123.jpg
        String imageUrl = normalizedEndpoint + "/" + bucketName + "/" + normalizedKeyPath;
        
        log.debug("Built image URL: endpoint={}, bucket={}, key={}, url={}", 
                normalizedEndpoint, bucketName, normalizedKeyPath, imageUrl);
        
        return imageUrl;
    }

    /**
     * Extract key từ URL
     * 
     * Ví dụ:
     * URL: http://127.0.0.1:9000/orchard-bucket/users/avatar-123.jpg
     * Key: users/avatar-123.jpg
     * 
     * @param imageUrl URL đầy đủ của ảnh
     * @return Key path trong bucket
     */
    private String extractKeyFromUrl(String imageUrl) {
        try {
            // Tìm vị trí bucket name trong URL
            int bucketIndex = imageUrl.indexOf("/" + bucketName + "/");
            if (bucketIndex == -1) {
                // Thử format khác: endpoint/bucketName/keyPath
                // Nếu có bucket name trong URL, tìm sau bucket name
                int bucketNameIndex = imageUrl.indexOf(bucketName);
                if (bucketNameIndex > 0) {
                    int keyStartIndex = bucketNameIndex + bucketName.length() + 1;
                    if (keyStartIndex < imageUrl.length()) {
                        return imageUrl.substring(keyStartIndex);
                    }
                }
                return null;
            }

            // Extract key sau bucket name
            int keyStartIndex = bucketIndex + bucketName.length() + 2; // +2 cho "/" và "/"
            if (keyStartIndex < imageUrl.length()) {
                return imageUrl.substring(keyStartIndex);
            }

            return null;
        } catch (Exception e) {
            log.error("Error extracting key from URL: {}", imageUrl, e);
            return null;
        }
    }
}

