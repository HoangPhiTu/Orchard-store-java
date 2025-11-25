package com.orchard.orchard_store_backend.modules.catalog.brand.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandUpdateRequest {

    @Size(min = 2, max = 255, message = "Tên thương hiệu phải từ 2 đến 255 ký tự")
    private String name;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Size(max = 500, message = "URL logo không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|)$", message = "URL logo phải là URL hợp lệ (http:// hoặc https://)")
    private String logoUrl;

    @Size(max = 100, message = "Tên quốc gia không được vượt quá 100 ký tự")
    private String country;

    @Size(max = 500, message = "URL website không được vượt quá 500 ký tự")
    @Pattern(regexp = "^(https?://.*|)$", message = "URL website phải là URL hợp lệ (http:// hoặc https://)")
    private String website;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    private Integer displayOrder;

    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status phải là ACTIVE hoặc INACTIVE")
    private String status;

    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String slug; // Optional - nếu không có sẽ tự tạo từ name
}

