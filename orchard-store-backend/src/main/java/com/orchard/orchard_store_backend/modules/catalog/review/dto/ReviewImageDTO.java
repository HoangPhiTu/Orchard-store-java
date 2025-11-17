package com.orchard.orchard_store_backend.modules.catalog.review.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewImageDTO {

    private Long id;
    private Long reviewId;

    @NotBlank(message = "Image URL không được để trống")
    @Size(max = 500, message = "Image URL không được vượt quá 500 ký tự")
    private String imageUrl;

    @Min(value = 0, message = "Thứ tự hiển thị phải >= 0")
    private Integer displayOrder;

    private LocalDateTime createdAt;
}

