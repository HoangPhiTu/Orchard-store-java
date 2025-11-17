package com.orchard.orchard_store_backend.modules.catalog.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewHelpfulDTO {

    private Long id;
    private Long reviewId;
    private Long userId;
    private String userName;

    @NotNull(message = "isHelpful không được để trống")
    private Boolean isHelpful;

    private LocalDateTime createdAt;
}

