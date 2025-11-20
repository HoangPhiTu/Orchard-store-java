package com.orchard.orchard_store_backend.modules.order.service;

/**
 * Service xử lý đơn hàng
 * 
 * Example: Khi order được thanh toán thành công, publish OrderPaidEvent
 */
public interface OrderService {
    
    /**
     * Cập nhật payment status của order
     * Khi status = PAID, sẽ publish OrderPaidEvent
     */
    void updatePaymentStatus(Long orderId, String paymentStatus);
}

