package com.orchard.orchard_store_backend.modules.catalog.review.dto;

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
public class ReviewDTO {

    private Long id;

    @NotNull(message = "Product ID không được để trống")
    @Positive(message = "Product ID phải là số dương")
    private Long productId;

    private String productName;

    private Long userId;
    private String userName;
    private String userEmail;

    private Long orderId;

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1 đến 5")
    @Max(value = 5, message = "Rating phải từ 1 đến 5")
    private Integer rating;

    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @Size(max = 5000, message = "Bình luận không được vượt quá 5000 ký tự")
    private String comment;

    @Pattern(regexp = "^(PENDING|APPROVED|REJECTED|HIDDEN)$",
            message = "Status phải là PENDING, APPROVED, REJECTED hoặc HIDDEN")
    private String status;

    private Boolean isVerifiedPurchase;

    private Long moderatedById;
    private String moderatedByName;
    private LocalDateTime moderatedAt;

    private Integer helpfulCount;
    private Integer reportCount;

    @Builder.Default
    private List<ReviewImageDTO> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

