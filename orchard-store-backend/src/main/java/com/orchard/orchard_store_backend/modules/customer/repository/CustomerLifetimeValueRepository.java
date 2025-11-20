package com.orchard.orchard_store_backend.modules.customer.repository;

import com.orchard.orchard_store_backend.modules.customer.entity.CustomerLifetimeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerLifetimeValueRepository extends JpaRepository<CustomerLifetimeValue, Long> {
    
    List<CustomerLifetimeValue> findByCustomerIdOrderByCalculatedAtDesc(Long customerId);
}

