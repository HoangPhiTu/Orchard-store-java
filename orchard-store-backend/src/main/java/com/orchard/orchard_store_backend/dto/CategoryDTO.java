package com.orchard.orchard_store_backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    
    private Long id;
    
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 2, max = 255, message = "Tên danh mục phải từ 2 đến 255 ký tự")
    private String name;
    
    @NotBlank(message = "Slug không được để trống")
    @Size(min = 2, max = 255, message = "Slug phải từ 2 đến 255 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", 
             message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String slug;
    
    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;
    
    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|)$", 
             message = "URL hình ảnh phải là URL hợp lệ (http:// hoặc https://)")
    private String imageUrl;
    
    private Long parentId;
    private String parentName;
    private Integer level;
    
    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    @Max(value = 9999, message = "Thứ tự hiển thị phải <= 9999")
    private Integer displayOrder;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", 
             message = "Status phải là ACTIVE hoặc INACTIVE")
    private String status;
    
    private List<CategoryDTO> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public CategoryDTO(Long id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.children = new ArrayList<>();
    }
}

