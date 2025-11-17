package com.orchard.orchard_store_backend.modules.catalog.review.repository;

import com.orchard.orchard_store_backend.modules.catalog.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Tìm reviews theo product ID
    Page<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, Review.Status status, Pageable pageable);

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, Review.Status status);

    // Tìm reviews theo user ID
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Tìm reviews theo rating
    List<Review> findByProductIdAndRatingAndStatus(Long productId, Integer rating, Review.Status status);

    // Tìm verified reviews
    List<Review> findByProductIdAndIsVerifiedPurchaseAndStatus(Long productId, Boolean isVerifiedPurchase, Review.Status status);

    // Tính rating trung bình
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = :status")
    Double calculateAverageRating(@Param("productId") Long productId, @Param("status") Review.Status status);

    // Đếm số reviews
    long countByProductIdAndStatus(Long productId, Review.Status status);

    // Tìm review theo order ID
    Optional<Review> findByOrderId(Long orderId);

    // Tìm reviews cần moderation
    Page<Review> findByStatusOrderByCreatedAtAsc(Review.Status status, Pageable pageable);
}

