package com.orchard.orchard_store_backend.modules.catalog.review.service;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.review.dto.ReviewDTO;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.Review;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.ReviewHelpful;
import com.orchard.orchard_store_backend.modules.catalog.review.entity.ReviewImage;
import com.orchard.orchard_store_backend.modules.catalog.review.mapper.ReviewImageMapper;
import com.orchard.orchard_store_backend.modules.catalog.review.mapper.ReviewMapper;
import com.orchard.orchard_store_backend.modules.catalog.review.repository.ReviewHelpfulRepository;
import com.orchard.orchard_store_backend.modules.catalog.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final ReviewImageMapper reviewImageMapper;

    @Override
    @Transactional
    public ReviewDTO createReview(ReviewDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

        Review review = reviewMapper.toEntity(dto);
        review.setProduct(product);

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            review.setUser(user);
        }

        // Xử lý images
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            for (var imageDTO : dto.getImages()) {
                ReviewImage image = reviewImageMapper.toEntity(imageDTO);
                review.addImage(image);
            }
        }

        Review saved = reviewRepository.save(review);
        updateProductRating(product.getId());
        return reviewMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDTO getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        return reviewMapper.toDTO(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsByProduct(Long productId, String status, Pageable pageable) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, reviewStatus, pageable)
                .map(reviewMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviewsByProduct(Long productId, String status) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, reviewStatus)
                .stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsByUser(Long userId, Pageable pageable) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(reviewMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByRating(Long productId, Integer rating, String status) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.findByProductIdAndRatingAndStatus(productId, rating, reviewStatus)
                .stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getVerifiedReviews(Long productId, String status) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.findByProductIdAndIsVerifiedPurchaseAndStatus(productId, true, reviewStatus)
                .stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateAverageRating(Long productId, String status) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.calculateAverageRating(productId, reviewStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public long countReviews(Long productId, String status) {
        Review.Status reviewStatus = (status != null && !status.isEmpty()) 
                ? Review.Status.valueOf(status.toUpperCase()) 
                : Review.Status.APPROVED;
        return reviewRepository.countByProductIdAndStatus(productId, reviewStatus);
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long id, ReviewDTO dto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));

        reviewMapper.updateEntityFromDto(dto, review);

        // Xử lý images
        if (dto.getImages() != null) {
            review.getImages().clear();
            for (var imageDTO : dto.getImages()) {
                ReviewImage image = reviewImageMapper.toEntity(imageDTO);
                review.addImage(image);
            }
        }

        Review updated = reviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        return reviewMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        Long productId = review.getProduct().getId();
        reviewRepository.deleteById(id);
        updateProductRating(productId);
    }

    @Override
    @Transactional
    public ReviewDTO approveReview(Long id, Long moderatorId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));

        review.setStatus(Review.Status.APPROVED);
        if (moderatorId != null) {
            User moderator = userRepository.findById(moderatorId).orElse(null);
            review.setModeratedBy(moderator);
            review.setModeratedAt(java.time.LocalDateTime.now());
        }

        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        return reviewMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ReviewDTO rejectReview(Long id, Long moderatorId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));

        review.setStatus(Review.Status.REJECTED);
        if (moderatorId != null) {
            User moderator = userRepository.findById(moderatorId).orElse(null);
            review.setModeratedBy(moderator);
            review.setModeratedAt(java.time.LocalDateTime.now());
        }

        Review saved = reviewRepository.save(review);
        return reviewMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ReviewDTO hideReview(Long id, Long moderatorId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));

        review.setStatus(Review.Status.HIDDEN);
        if (moderatorId != null) {
            User moderator = userRepository.findById(moderatorId).orElse(null);
            review.setModeratedBy(moderator);
            review.setModeratedAt(java.time.LocalDateTime.now());
        }

        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        return reviewMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByStatusOrderByCreatedAtAsc(Review.Status.PENDING, pageable)
                .map(reviewMapper::toDTO);
    }

    @Override
    @Transactional
    public void markHelpful(Long reviewId, Long userId, Boolean isHelpful) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        ReviewHelpful existing = reviewHelpfulRepository.findByReviewIdAndUserId(reviewId, userId).orElse(null);

        if (existing != null) {
            existing.setIsHelpful(isHelpful);
            reviewHelpfulRepository.save(existing);
        } else {
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            ReviewHelpful helpful = ReviewHelpful.builder()
                    .review(review)
                    .user(user)
                    .isHelpful(isHelpful)
                    .build();
            reviewHelpfulRepository.save(helpful);
        }

        // Cập nhật helpful count
        long helpfulCount = reviewHelpfulRepository.countHelpfulByReviewId(reviewId);
        review.setHelpfulCount((int) helpfulCount);
        reviewRepository.save(review);
    }

    @Override
    @Transactional
    public void reportReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));
        review.setReportCount(review.getReportCount() + 1);
        reviewRepository.save(review);
    }

    private void updateProductRating(Long productId) {
        // Product base no longer stores aggregate rating; aggregation handled at variant or analytics layer.
    }
}

