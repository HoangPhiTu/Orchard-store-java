package com.orchard.orchard_store_backend.modules.catalog.category.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {

    @jakarta.validation.constraints.NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 2, max = 255, message = "Tên danh mục phải từ 2 đến 255 ký tự")
    private String name;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|)$", message = "URL hình ảnh phải là URL hợp lệ (http:// hoặc https://)")
    private String imageUrl;

    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String slug; // Optional - nếu không có sẽ tự tạo từ name

    private Long parentId; // Optional - ID của category cha (null = root category)

    private Integer displayOrder;
}

