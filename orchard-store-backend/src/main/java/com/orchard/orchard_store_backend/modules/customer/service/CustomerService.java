package com.orchard.orchard_store_backend.modules.customer.service;

import java.math.BigDecimal;

public interface CustomerService {
    
    /**
     * Tìm hoặc tạo customer record
     */
    Long findOrCreateCustomer(String email, String phone, String name);
    
    /**
     * Cập nhật lifetime value và kiểm tra nâng hạng VIP
     */
    void updateLifetimeValueAndVipTier(Long customerId, Long orderId, BigDecimal orderAmount);
    
    /**
     * Tính lại và cập nhật VIP tier cho customer
     */
    void updateVipTier(Long customerId);
}

