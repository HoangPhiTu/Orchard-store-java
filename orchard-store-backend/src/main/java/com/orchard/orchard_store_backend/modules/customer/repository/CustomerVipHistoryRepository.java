package com.orchard.orchard_store_backend.modules.customer.repository;

import com.orchard.orchard_store_backend.modules.customer.entity.CustomerVipHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerVipHistoryRepository extends JpaRepository<CustomerVipHistory, Long> {
    
    List<CustomerVipHistory> findByCustomerIdOrderByChangedAtDesc(Long customerId);
}

