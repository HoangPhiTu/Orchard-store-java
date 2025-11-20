package com.orchard.orchard_store_backend.modules.order.service;

import com.orchard.orchard_store_backend.modules.customer.event.OrderPaidEvent;
import com.orchard.orchard_store_backend.modules.order.entity.Order;
import com.orchard.orchard_store_backend.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý đơn hàng
 * Publish OrderPaidEvent khi order được thanh toán thành công
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void updatePaymentStatus(Long orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        String oldStatus = order.getPaymentStatus();
        order.setPaymentStatus(paymentStatus);

        // Nếu chuyển sang trạng thái PAID, publish event
        if ("PAID".equals(paymentStatus) && !"PAID".equals(oldStatus)) {
            order.setPaidAt(java.time.LocalDateTime.now());
            orderRepository.save(order);

            // Publish event để trigger tính toán VIP (xử lý bất đồng bộ)
            OrderPaidEvent event = new OrderPaidEvent(
                    order.getId(),
                    order.getCustomerId(),
                    order.getTotalAmount(),
                    order.getCustomerEmail(),
                    order.getCustomerPhone(),
                    order.getCustomerName()
            );

            eventPublisher.publishEvent(event);
            log.info("Published OrderPaidEvent for orderId: {}, amount: {}", orderId, order.getTotalAmount());
        } else {
            orderRepository.save(order);
        }
    }
}

