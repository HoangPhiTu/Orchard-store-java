package com.orchard.orchard_store_backend.modules.promotion.repository;

import com.orchard.orchard_store_backend.modules.promotion.entity.Promotion;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Promotion> findByCodeAndStatus(String code, String status);

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @NonNull
    Optional<Promotion> findById(@NonNull Long id);
}

