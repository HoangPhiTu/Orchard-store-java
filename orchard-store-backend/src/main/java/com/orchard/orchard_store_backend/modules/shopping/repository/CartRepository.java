package com.orchard.orchard_store_backend.modules.shopping.repository;

import com.orchard.orchard_store_backend.modules.shopping.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findBySessionId(String sessionId);

    List<Cart> findByCustomerId(Long customerId);

    Optional<Cart> findBySessionIdAndProductVariantId(String sessionId, Long productVariantId);

    Optional<Cart> findByCustomerIdAndProductVariantId(Long customerId, Long productVariantId);

    void deleteBySessionId(String sessionId);

    void deleteByCustomerId(Long customerId);
}

