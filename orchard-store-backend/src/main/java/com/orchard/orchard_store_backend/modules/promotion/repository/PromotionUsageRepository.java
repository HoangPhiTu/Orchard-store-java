package com.orchard.orchard_store_backend.modules.promotion.repository;

import com.orchard.orchard_store_backend.modules.promotion.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {

    long countByPromotionId(Long promotionId);

    long countByPromotionIdAndCustomerId(Long promotionId, Long customerId);
}

