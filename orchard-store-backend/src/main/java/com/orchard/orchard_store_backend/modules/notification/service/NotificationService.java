package com.orchard.orchard_store_backend.modules.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service để gửi thông báo real-time qua WebSocket
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo đơn hàng mới đến tất cả admin đang online
     * 
     * @param orderId ID của đơn hàng
     * @param orderNumber Số đơn hàng (ví dụ: ORD-2024-001)
     * @param customerName Tên khách hàng
     * @param totalAmount Tổng tiền
     */
    public void sendNewOrderNotification(Long orderId, String orderNumber, String customerName, Double totalAmount) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_ORDER");
        notification.put("title", "Đơn hàng mới");
        notification.put("message", String.format("Có đơn hàng mới #%s từ %s - Tổng tiền: %,.0f VNĐ", 
            orderNumber, customerName, totalAmount));
        notification.put("orderId", orderId);
        notification.put("orderNumber", orderNumber);
        notification.put("customerName", customerName);
        notification.put("totalAmount", totalAmount);
        notification.put("timestamp", LocalDateTime.now().toString());
        notification.put("read", false);

        // Gửi đến topic /topic/admin-notifications
        messagingTemplate.convertAndSend("/topic/admin-notifications", notification);
        log.info("Sent new order notification: Order #{} from {}", orderNumber, customerName);
    }

    /**
     * Gửi thông báo tùy chỉnh
     * 
     * @param type Loại thông báo (NEW_ORDER, ORDER_UPDATED, etc.)
     * @param title Tiêu đề
     * @param message Nội dung
     * @param data Dữ liệu bổ sung
     */
    public void sendNotification(String type, String title, String message, Map<String, Object> data) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", type);
        notification.put("title", title);
        notification.put("message", message);
        notification.put("timestamp", LocalDateTime.now().toString());
        notification.put("read", false);
        
        if (data != null) {
            notification.putAll(data);
        }

        messagingTemplate.convertAndSend("/topic/admin-notifications", notification);
        log.info("Sent notification: {} - {}", type, title);
    }
}

