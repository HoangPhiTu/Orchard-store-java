package com.orchard.orchard_store_backend.modules.catalog.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Product SEO URLs
 * Used for redirects and canonical URLs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSeoUrlDTO {

    private Long id;
    private Long productId;

    @NotBlank(message = "Old slug không được để trống")
    @Size(max = 500, message = "Old slug không được vượt quá 500 ký tự")
    private String oldSlug;

    @NotBlank(message = "New slug không được để trống")
    @Size(max = 500, message = "New slug không được vượt quá 500 ký tự")
    private String newSlug;

    @Pattern(regexp = "^(301|302)$", message = "Redirect type phải là 301 hoặc 302")
    private String redirectType;

    @Min(value = 0, message = "Redirect count phải >= 0")
    private Integer redirectCount;

    private LocalDateTime createdAt;
}

