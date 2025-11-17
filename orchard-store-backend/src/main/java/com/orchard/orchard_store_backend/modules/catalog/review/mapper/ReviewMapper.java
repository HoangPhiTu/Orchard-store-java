package com.orchard.orchard_store_backend.modules.catalog.review.mapper;

import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewDTO;
import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.Review;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.ReviewImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    ReviewMapper INSTANCE = Mappers.getMapper(ReviewMapper.class);

    @Mapping(target = "productId", expression = "java(entity.getProduct() != null ? entity.getProduct().getId() : null)")
    @Mapping(target = "productName", expression = "java(entity.getProduct() != null ? entity.getProduct().getName() : null)")
    @Mapping(target = "userId", expression = "java(entity.getUser() != null ? entity.getUser().getId() : null)")
    @Mapping(target = "userName", expression = "java(entity.getUser() != null ? entity.getUser().getFullName() : null)")
    @Mapping(target = "userEmail", expression = "java(entity.getUser() != null ? entity.getUser().getEmail() : null)")
    @Mapping(target = "status", expression = "java(entity.getStatus() != null ? entity.getStatus().name() : null)")
    @Mapping(target = "moderatedById", expression = "java(entity.getModeratedBy() != null ? entity.getModeratedBy().getId() : null)")
    @Mapping(target = "moderatedByName", expression = "java(entity.getModeratedBy() != null ? entity.getModeratedBy().getFullName() : null)")
    @Mapping(target = "images", expression = "java(mapImages(entity.getImages()))")
    ReviewDTO toDTO(Review entity);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Review.Status.valueOf(dto.getStatus().toUpperCase()) : Review.Status.PENDING)")
    @Mapping(target = "moderatedBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Review toEntity(ReviewDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? Review.Status.valueOf(dto.getStatus().toUpperCase()) : entity.getStatus())")
    @Mapping(target = "moderatedBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ReviewDTO dto, @MappingTarget Review entity);

    default List<ReviewImageDTO> mapImages(List<ReviewImage> images) {
        if (images == null || images.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return images.stream()
                .map(img -> {
                    ReviewImageDTO dto = new ReviewImageDTO();
                    dto.setId(img.getId());
                    dto.setReviewId(img.getReview() != null ? img.getReview().getId() : null);
                    dto.setImageUrl(img.getImageUrl());
                    dto.setDisplayOrder(img.getDisplayOrder());
                    dto.setCreatedAt(img.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

