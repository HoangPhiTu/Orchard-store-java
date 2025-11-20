package com.orchard.orchard_store_backend.modules.customer.repository;

import com.orchard.orchard_store_backend.modules.customer.entity.MemberPricingTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface MemberPricingTierRepository extends JpaRepository<MemberPricingTier, Long> {
    
    Optional<MemberPricingTier> findByTierName(String tierName);
    
    /**
     * Tìm tier cao nhất mà customer đạt được dựa trên tổng tiền đã mua
     * Sắp xếp theo tier_level DESC để lấy tier cao nhất
     */
    @Query("SELECT t FROM MemberPricingTier t " +
           "WHERE t.minPurchaseAmount <= :totalPurchase " +
           "AND t.status = 'ACTIVE' " +
           "ORDER BY t.tierLevel DESC")
    Optional<MemberPricingTier> findHighestTierByPurchaseAmount(@Param("totalPurchase") BigDecimal totalPurchase);
}

