package com.orchard.orchard_store_backend.modules.catalog.review.service;

import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    /**
     * Tạo review mới
     */
    ReviewDTO createReview(ReviewDTO dto);

    /**
     * Lấy review theo ID
     */
    ReviewDTO getReviewById(Long id);

    /**
     * Lấy reviews theo product ID (có phân trang)
     */
    Page<ReviewDTO> getReviewsByProduct(Long productId, String status, Pageable pageable);

    /**
     * Lấy tất cả reviews theo product ID
     */
    List<ReviewDTO> getAllReviewsByProduct(Long productId, String status);

    /**
     * Lấy reviews theo user ID
     */
    Page<ReviewDTO> getReviewsByUser(Long userId, Pageable pageable);

    /**
     * Lấy reviews theo rating
     */
    List<ReviewDTO> getReviewsByRating(Long productId, Integer rating, String status);

    /**
     * Lấy verified reviews
     */
    List<ReviewDTO> getVerifiedReviews(Long productId, String status);

    /**
     * Tính rating trung bình
     */
    Double calculateAverageRating(Long productId, String status);

    /**
     * Đếm số reviews
     */
    long countReviews(Long productId, String status);

    /**
     * Cập nhật review
     */
    ReviewDTO updateReview(Long id, ReviewDTO dto);

    /**
     * Xóa review
     */
    void deleteReview(Long id);

    /**
     * Duyệt review (approve)
     */
    ReviewDTO approveReview(Long id, Long moderatorId);

    /**
     * Từ chối review (reject)
     */
    ReviewDTO rejectReview(Long id, Long moderatorId);

    /**
     * Ẩn review
     */
    ReviewDTO hideReview(Long id, Long moderatorId);

    /**
     * Lấy reviews cần moderation
     */
    Page<ReviewDTO> getPendingReviews(Pageable pageable);

    /**
     * Đánh dấu review là hữu ích
     */
    void markHelpful(Long reviewId, Long userId, Boolean isHelpful);

    /**
     * Báo cáo review
     */
    void reportReview(Long reviewId);
}

