package com.orchard.orchard_store_backend.modules.catalog.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDetailDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.dto.ProductUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ProductAdminService;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

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
    private final ProductService productService;
    private final ImageUploadService imageUploadService;
    private final ObjectMapper objectMapper;

    /**
     * Lấy danh sách products cho Admin với pagination & sort.
     * (Hiện tại lọc theo keyword/status/brand/category chưa được áp dụng đầy đủ,
     *  nhưng vẫn nhận params để giữ tương thích với frontend.)
     *
     * Endpoint: GET /api/admin/products?page=0&size=15&sortBy=name&direction=ASC
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId
    ) {
        Sort sort = direction.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductDTO> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách sản phẩm thành công", products)
        );
    }

    /**
     * Tạo mới Product với đầy đủ thông tin (JSON).
     * 
     * Endpoint: POST /api/admin/products
     * 
     * Content-Type: application/json
     * 
     * Features:
     * - Tự động generate slug từ tên
     * - Validate SKU unique
     * - Sync attributes vào EAV và JSONB
     * - Transactional (rollback nếu có lỗi)
     * 
     * @param requestDTO ProductCreateRequestDTO
     * @return ApiResponse<ProductDetailDTO>
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> createProduct(
            @Valid @RequestBody ProductCreateRequestDTO requestDTO
    ) {
        try {
            // Tạo Product
            ProductDetailDTO createdProduct = productAdminService.createProduct(requestDTO);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("Tạo sản phẩm thành công", createdProduct));

        } catch (jakarta.validation.ConstraintViolationException e) {
            log.error("Lỗi validation khi tạo Product", e);
            StringBuilder errorMsg = new StringBuilder("Dữ liệu không hợp lệ: ");
            e.getConstraintViolations().forEach(violation -> {
                errorMsg.append(violation.getPropertyPath()).append(" - ").append(violation.getMessage()).append("; ");
            });
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), errorMsg.toString()));
        } catch (com.orchard.orchard_store_backend.exception.ResourceNotFoundException e) {
            log.error("Resource không tìm thấy khi tạo Product", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException e) {
            log.error("Resource đã tồn tại khi tạo Product", e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(HttpStatus.CONFLICT.value(), e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi tạo Product", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                            "Lỗi hệ thống khi tạo sản phẩm: " + (e.getMessage() != null ? e.getMessage() : "Vui lòng thử lại sau")));
        }
    }

    /**
     * Tạo mới Product với đầy đủ thông tin (Multipart với ảnh).
     * 
     * Endpoint: POST /api/admin/products/with-images
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
    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> createProductWithImages(
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
     * Cập nhật Product (JSON).
     * 
     * Endpoint: PUT /api/admin/products/{id}
     * 
     * Content-Type: application/json
     * 
     * @param id ID của Product cần update
     * @param requestDTO ProductUpdateRequestDTO
     * @return ApiResponse<ProductDetailDTO>
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequestDTO requestDTO
    ) {
        try {
            // Update Product
            ProductDetailDTO updatedProduct = productAdminService.updateProduct(id, requestDTO);

            return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct));

        } catch (jakarta.validation.ConstraintViolationException e) {
            log.error("Lỗi validation khi cập nhật Product ID: {}", id, e);
            StringBuilder errorMsg = new StringBuilder("Dữ liệu không hợp lệ: ");
            e.getConstraintViolations().forEach(violation -> {
                errorMsg.append(violation.getPropertyPath()).append(" - ").append(violation.getMessage()).append("; ");
            });
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), errorMsg.toString()));
        } catch (com.orchard.orchard_store_backend.exception.ResourceNotFoundException e) {
            log.error("Resource không tìm thấy khi cập nhật Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException e) {
            log.error("Resource đã tồn tại khi cập nhật Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(HttpStatus.CONFLICT.value(), e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                            "Lỗi hệ thống khi cập nhật sản phẩm: " + (e.getMessage() != null ? e.getMessage() : "Vui lòng thử lại sau")));
        }
    }

    /**
     * Cập nhật Product với ảnh (Multipart).
     * 
     * Endpoint: PUT /api/admin/products/{id}/with-images
     * 
     * Content-Type: multipart/form-data
     * 
     * @param id ID của Product cần update
     * @param productJson JSON string của ProductUpdateRequestDTO
     * @param thumbnail Ảnh đại diện mới (optional)
     * @param images Danh sách ảnh chi tiết mới (optional)
     * @return ApiResponse<ProductDetailDTO>
     */
    @PutMapping(value = "/{id}/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailDTO>> updateProductWithImages(
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
     * Lấy chi tiết Product theo ID (bao gồm variants, images).
     * 
     * Endpoint: GET /api/admin/products/{id}
     * 
     * @param id ID của Product cần lấy
     * @return ApiResponse<ProductDetailDTO>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> getProductDetail(@PathVariable Long id) {
        try {
            ProductDetailDTO product = productAdminService.getProductDetail(id);
            return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công", product));
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết Product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy sản phẩm: " + e.getMessage()));
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

