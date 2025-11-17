package com.orchard.orchard_store_backend.modules.catalog.review.controller;

import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewDTO;
import com.orchard.orchard_store_backend.modules.catalog.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Tạo review mới (public)
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody ReviewDTO dto) {
        ReviewDTO created = reviewService.createReview(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Lấy review theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    /**
     * Lấy reviews theo product ID (public)
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "APPROVED") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getReviewsByProduct(productId, status, pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Lấy tất cả reviews theo product ID
     */
    @GetMapping("/product/{productId}/all")
    public ResponseEntity<List<ReviewDTO>> getAllReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        List<ReviewDTO> reviews = reviewService.getAllReviewsByProduct(productId, status);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Lấy reviews theo rating
     */
    @GetMapping("/product/{productId}/rating/{rating}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByRating(
            @PathVariable Long productId,
            @PathVariable Integer rating,
            @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        List<ReviewDTO> reviews = reviewService.getReviewsByRating(productId, rating, status);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Lấy verified reviews
     */
    @GetMapping("/product/{productId}/verified")
    public ResponseEntity<List<ReviewDTO>> getVerifiedReviews(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        List<ReviewDTO> reviews = reviewService.getVerifiedReviews(productId, status);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Tính rating trung bình
     */
    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Double> getAverageRating(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        Double avgRating = reviewService.calculateAverageRating(productId, status);
        return ResponseEntity.ok(avgRating);
    }

    /**
     * Đếm số reviews
     */
    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getReviewCount(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        long count = reviewService.countReviews(productId, status);
        return ResponseEntity.ok(count);
    }

    /**
     * Đánh dấu review là hữu ích (public)
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<Void> markHelpful(
            @PathVariable Long reviewId,
            @RequestParam(required = false) Long userId,
            @RequestParam Boolean isHelpful) {
        reviewService.markHelpful(reviewId, userId, isHelpful);
        return ResponseEntity.ok().build();
    }

    /**
     * Báo cáo review (public)
     */
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<Void> reportReview(@PathVariable Long reviewId) {
        reviewService.reportReview(reviewId);
        return ResponseEntity.ok().build();
    }

    /**
     * Admin: Cập nhật review
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDTO dto) {
        ReviewDTO updated = reviewService.updateReview(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Admin: Xóa review
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin: Duyệt review
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ReviewDTO> approveReview(
            @PathVariable Long id,
            @RequestParam(required = false) Long moderatorId) {
        ReviewDTO approved = reviewService.approveReview(id, moderatorId);
        return ResponseEntity.ok(approved);
    }

    /**
     * Admin: Từ chối review
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ReviewDTO> rejectReview(
            @PathVariable Long id,
            @RequestParam(required = false) Long moderatorId) {
        ReviewDTO rejected = reviewService.rejectReview(id, moderatorId);
        return ResponseEntity.ok(rejected);
    }

    /**
     * Admin: Ẩn review
     */
    @PostMapping("/{id}/hide")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ReviewDTO> hideReview(
            @PathVariable Long id,
            @RequestParam(required = false) Long moderatorId) {
        ReviewDTO hidden = reviewService.hideReview(id, moderatorId);
        return ResponseEntity.ok(hidden);
    }

    /**
     * Admin: Lấy reviews cần moderation
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ReviewDTO>> getPendingReviews(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getPendingReviews(pageable);
        return ResponseEntity.ok(reviews);
    }
}

