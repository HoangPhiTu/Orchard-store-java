package com.orchard.orchard_store_backend.modules.catalog.product.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface cho service xử lý upload ảnh.
 * 
 * Hiện tại implement LocalStorageService để lưu file vào thư mục local.
 * Sau này có thể thay thế bằng S3Service hoặc CloudStorageService.
 */
public interface ImageUploadService {

    /**
     * Upload một file ảnh và trả về URL.
     * 
     * @param file MultipartFile cần upload
     * @param folderName Tên thư mục để lưu (ví dụ: "products", "variants")
     * @return URL của file đã upload (ví dụ: "/uploads/products/image-123.jpg")
     * @throws RuntimeException Nếu upload thất bại
     */
    String uploadImage(MultipartFile file, String folderName);

    /**
     * Upload nhiều file ảnh và trả về danh sách URLs.
     * 
     * @param files Danh sách MultipartFile cần upload
     * @param folderName Tên thư mục để lưu
     * @return Danh sách URLs của các file đã upload
     * @throws RuntimeException Nếu upload thất bại
     */
    List<String> uploadImages(List<MultipartFile> files, String folderName);

    /**
     * Xóa file ảnh theo URL.
     * 
     * @param imageUrl URL của file cần xóa
     * @return true nếu xóa thành công, false nếu không tìm thấy file
     */
    boolean deleteImage(String imageUrl);

    /**
     * Validate file ảnh (kiểm tra extension, size, etc.).
     * 
     * @param file MultipartFile cần validate
     * @throws IllegalArgumentException Nếu file không hợp lệ
     */
    void validateImage(MultipartFile file);
}

