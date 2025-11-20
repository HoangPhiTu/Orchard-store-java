package com.orchard.orchard_store_backend.modules.customer.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Event được publish khi order được thanh toán thành công
 * Sử dụng để trigger việc tính toán CustomerLifetimeValue và nâng hạng VIP
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPaidEvent {
    
    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private String customerEmail;
    private String customerPhone;
    private String customerName;
}

