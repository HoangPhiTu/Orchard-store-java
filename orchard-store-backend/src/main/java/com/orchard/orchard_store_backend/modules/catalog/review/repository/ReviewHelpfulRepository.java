package com.orchard.orchard_store_backend.modules.catalog.review.repository;

import com.orchard.orchard_store_backend.modules.catalog.review.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {
    Optional<ReviewHelpful> findByReviewIdAndUserId(Long reviewId, Long userId);
    
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.review.id = :reviewId AND rh.isHelpful = true")
    long countHelpfulByReviewId(@Param("reviewId") Long reviewId);
    
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.review.id = :reviewId AND rh.isHelpful = false")
    long countNotHelpfulByReviewId(@Param("reviewId") Long reviewId);
}

