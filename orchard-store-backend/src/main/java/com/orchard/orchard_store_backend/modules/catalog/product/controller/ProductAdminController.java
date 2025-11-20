package com.orchard.orchard_store_backend.modules.catalog.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ProductAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller cho các chức năng Admin của Product.
 * 
 * Bao gồm:
 * - Tạo mới Product với đầy đủ thông tin (variants, attributes, images)
 * - Cập nhật Product
 * - Xóa mềm Product (soft delete)
 * - Upload ảnh
 * - Slug generation tự động
 * - Attribute sync (EAV + JSONB)
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class ProductAdminController {

    private final ProductAdminService productAdminService;
    private final ImageUploadService imageUploadService;
    private final ObjectMapper objectMapper;

    /**
     * Tạo mới Product với đầy đủ thông tin.
     * 
     * Endpoint: POST /api/admin/products
     * 
     * Content-Type: multipart/form-data
     * 
     * Form fields:
     * - product: JSON string của ProductCreateRequestDTO
     * - thumbnail: MultipartFile (optional) - Ảnh đại diện
     * - images: MultipartFile[] (optional) - Danh sách ảnh chi tiết
     * 
     * Features:
     * - Tự động generate slug từ tên
     * - Validate SKU unique
     * - Sync attributes vào EAV và JSONB
     * - Upload và lưu ảnh
     * - Transactional (rollback nếu có lỗi)
     * 
     * @param productJson JSON string của ProductCreateRequestDTO
     * @param thumbnail Ảnh đại diện (optional)
     * @param images Danh sách ảnh chi tiết (optional)
     * @return ApiResponse<ProductDetailDTO>
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> createProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // Parse JSON string thành DTO
            ProductCreateRequestDTO requestDTO = objectMapper.readValue(productJson, ProductCreateRequestDTO.class);

            // Upload ảnh đại diện nếu có
            if (thumbnail != null && !thumbnail.isEmpty()) {
                imageUploadService.validateImage(thumbnail);
                String thumbnailUrl = imageUploadService.uploadImage(thumbnail, "products");
                
                // Tạo ProductImageDTO cho thumbnail
                ProductImageDTO thumbnailImage = ProductImageDTO.builder()
                        .imageUrl(thumbnailUrl)
                        .thumbnailUrl(thumbnailUrl)
                        .isPrimary(true)
                        .displayOrder(0)
                        .build();
                
                if (requestDTO.getImages() == null) {
                    requestDTO.setImages(new ArrayList<>());
                }
                requestDTO.getImages().add(0, thumbnailImage); // Thêm vào đầu danh sách
            }

            // Upload danh sách ảnh chi tiết nếu có
            if (images != null && !images.isEmpty()) {
                List<String> imageUrls = imageUploadService.uploadImages(images, "products");
                
                // Tạo ProductImageDTO cho mỗi ảnh
                for (int i = 0; i < imageUrls.size(); i++) {
                    ProductImageDTO imageDTO = ProductImageDTO.builder()
                            .imageUrl(imageUrls.get(i))
                            .thumbnailUrl(imageUrls.get(i))
                            .isPrimary(false)
                            .displayOrder(i + 1)
                            .build();
                    
                    if (requestDTO.getImages() == null) {
                        requestDTO.setImages(new ArrayList<>());
                    }
                    requestDTO.getImages().add(imageDTO);
                }
            }

            // Tạo Product
            ProductDetailDTO createdProduct = productAdminService.createProduct(requestDTO);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("Tạo sản phẩm thành công", createdProduct));

        } catch (Exception e) {
            log.error("Lỗi khi tạo Product", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Lỗi khi tạo sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật Product.
     * 
     * Endpoint: PUT /api/admin/products/{id}
     * 
     * Content-Type: multipart/form-data (nếu có ảnh) hoặc application/json
     * 
     * @param id ID của Product cần update
     * @param productJson JSON string của ProductUpdateRequestDTO
     * @param thumbnail Ảnh đại diện mới (optional)
     * @param images Danh sách ảnh chi tiết mới (optional)
     * @return ApiResponse<ProductDetailDTO>
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // Parse JSON string thành DTO
            ProductUpdateRequestDTO requestDTO = objectMapper.readValue(productJson, ProductUpdateRequestDTO.class);

            // Upload ảnh đại diện mới nếu có
            if (thumbnail != null && !thumbnail.isEmpty()) {
                imageUploadService.validateImage(thumbnail);
                String thumbnailUrl = imageUploadService.uploadImage(thumbnail, "products");
                
                ProductImageDTO thumbnailImage = ProductImageDTO.builder()
                        .imageUrl(thumbnailUrl)
                        .thumbnailUrl(thumbnailUrl)
                        .isPrimary(true)
                        .displayOrder(0)
                        .build();
                
                if (requestDTO.getImages() == null) {
                    requestDTO.setImages(new ArrayList<>());
                }
                requestDTO.getImages().add(0, thumbnailImage);
            }

            // Upload danh sách ảnh chi tiết mới nếu có
            if (images != null && !images.isEmpty()) {
                List<String> imageUrls = imageUploadService.uploadImages(images, "products");
                
                for (int i = 0; i < imageUrls.size(); i++) {
                    ProductImageDTO imageDTO = ProductImageDTO.builder()
                            .imageUrl(imageUrls.get(i))
                            .thumbnailUrl(imageUrls.get(i))
                            .isPrimary(false)
                            .displayOrder(i + 1)
                            .build();
                    
                    if (requestDTO.getImages() == null) {
                        requestDTO.setImages(new ArrayList<>());
                    }
                    requestDTO.getImages().add(imageDTO);
                }
            }

            // Update Product
            ProductDetailDTO updatedProduct = productAdminService.updateProduct(id, requestDTO);

            return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct));

        } catch (Exception e) {
            log.error("Lỗi khi cập nhật Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Lỗi khi cập nhật sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Xóa mềm Product (đổi status sang ARCHIVED).
     * 
     * Endpoint: DELETE /api/admin/products/{id}
     * 
     * @param id ID của Product cần xóa
     * @return ApiResponse<Void>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productAdminService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
        } catch (Exception e) {
            log.error("Lỗi khi xóa Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Lỗi khi xóa sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Upload ảnh riêng lẻ (không tạo Product).
     * 
     * Endpoint: POST /api/admin/products/upload-image
     * 
     * @param file MultipartFile cần upload
     * @return ApiResponse<String> chứa URL của ảnh đã upload
     */
    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            imageUploadService.validateImage(file);
            String imageUrl = imageUploadService.uploadImage(file, "products");
            return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", imageUrl));
        } catch (Exception e) {
            log.error("Lỗi khi upload ảnh", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Lỗi khi upload ảnh: " + e.getMessage()));
        }
    }
}

