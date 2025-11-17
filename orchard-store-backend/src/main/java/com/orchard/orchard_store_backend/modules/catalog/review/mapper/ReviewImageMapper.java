package com.orchard.orchard_store_backend.modules.catalog.review.mapper;

import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewImageDTO;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.ReviewImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ReviewImageMapper {
    ReviewImageMapper INSTANCE = Mappers.getMapper(ReviewImageMapper.class);

    @Mapping(target = "reviewId", expression = "java(entity.getReview() != null ? entity.getReview().getId() : null)")
    ReviewImageDTO toDTO(ReviewImage entity);

    @Mapping(target = "review", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ReviewImage toEntity(ReviewImageDTO dto);
}

