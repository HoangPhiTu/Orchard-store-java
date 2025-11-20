package com.orchard.orchard_store_backend.modules.customer.listener;

import com.orchard.orchard_store_backend.modules.customer.event.OrderPaidEvent;
import com.orchard.orchard_store_backend.modules.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event Listener xử lý các sự kiện liên quan đến Customer
 * Sử dụng @Async để xử lý bất đồng bộ, không block transaction đặt hàng
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CustomerEventListener {

    private final CustomerService customerService;

    /**
     * Lắng nghe sự kiện OrderPaidEvent và xử lý bất đồng bộ
     * - Tính lại CustomerLifetimeValue
     * - Kiểm tra và nâng hạng VIP nếu đủ điều kiện
     */
    @Async
    @EventListener
    public void handleOrderPaid(OrderPaidEvent event) {
        try {
            log.info("Processing OrderPaidEvent for orderId: {}, customerId: {}, amount: {}", 
                    event.getOrderId(), event.getCustomerId(), event.getAmount());

            // Đảm bảo customer record tồn tại
            Long customerId = customerService.findOrCreateCustomer(
                    event.getCustomerEmail(),
                    event.getCustomerPhone(),
                    event.getCustomerName()
            );

            // Cập nhật lifetime value và kiểm tra VIP tier
            customerService.updateLifetimeValueAndVipTier(customerId, event.getOrderId(), event.getAmount());

            log.info("Successfully processed OrderPaidEvent for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Error processing OrderPaidEvent for orderId: {}", event.getOrderId(), e);
            // Có thể thêm retry logic hoặc dead letter queue ở đây
        }
    }
}

