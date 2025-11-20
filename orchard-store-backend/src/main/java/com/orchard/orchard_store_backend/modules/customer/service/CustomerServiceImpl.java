package com.orchard.orchard_store_backend.modules.customer.service;

import com.orchard.orchard_store_backend.modules.customer.entity.Customer;
import com.orchard.orchard_store_backend.modules.customer.entity.CustomerLifetimeValue;
import com.orchard.orchard_store_backend.modules.customer.entity.CustomerVipHistory;
import com.orchard.orchard_store_backend.modules.customer.entity.MemberPricingTier;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerLifetimeValueRepository;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerRepository;
import com.orchard.orchard_store_backend.modules.customer.repository.CustomerVipHistoryRepository;
import com.orchard.orchard_store_backend.modules.customer.repository.MemberPricingTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service xử lý logic tính toán CustomerLifetimeValue và VIP tier
 * Được gọi bất đồng bộ từ CustomerEventListener để không block transaction đặt hàng
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final MemberPricingTierRepository tierRepository;
    private final CustomerLifetimeValueRepository lifetimeValueRepository;
    private final CustomerVipHistoryRepository vipHistoryRepository;

    @Override
    public Long findOrCreateCustomer(String email, String phone, String name) {
        // Tìm customer theo phone (ưu tiên) hoặc email
        Optional<Customer> existingCustomer = customerRepository.findByPhoneOrEmail(phone, email);
        
        if (existingCustomer.isPresent()) {
            Customer customer = existingCustomer.get();
            // Cập nhật thông tin nếu có
            if (email != null && !email.equals(customer.getEmail())) {
                customer.setEmail(email);
            }
            if (name != null && !name.equals(customer.getFullName())) {
                customer.setFullName(name);
            }
            return customerRepository.save(customer).getId();
        }

        // Tạo customer mới
        Customer newCustomer = Customer.builder()
                .email(email)
                .phone(phone)
                .fullName(name)
                .status(Customer.Status.ACTIVE)
                .totalPurchaseAmount(BigDecimal.ZERO)
                .totalOrdersCount(0)
                .totalOrdersPaidCount(0)
                .membershipPoints(0)
                .availablePoints(0)
                .build();

        return customerRepository.save(newCustomer).getId();
    }

    @Override
    public void updateLifetimeValueAndVipTier(Long customerId, Long orderId, BigDecimal orderAmount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        // Cập nhật lifetime value
        BigDecimal newTotal = customer.getTotalPurchaseAmount().add(orderAmount);
        customer.setTotalPurchaseAmount(newTotal);
        customer.setTotalOrdersPaidCount(customer.getTotalOrdersPaidCount() + 1);
        customer.setLastOrderDate(LocalDateTime.now());
        customer.setLastOrderAmount(orderAmount);
        
        // Cập nhật first_order_date nếu đây là đơn đầu tiên
        if (customer.getFirstOrderDate() == null) {
            customer.setFirstOrderDate(LocalDateTime.now());
        }

        customerRepository.save(customer);

        // Kiểm tra và nâng hạng VIP (truyền orderId để lưu vào history)
        updateVipTierWithOrderId(customerId, orderId);

        // Lưu snapshot vào customer_lifetime_value
        saveLifetimeValueSnapshot(customer, orderId);
    }

    @Override
    public void updateVipTier(Long customerId) {
        updateVipTierWithOrderId(customerId, null);
    }

    /**
     * Cập nhật VIP tier với orderId (để lưu vào history)
     */
    private void updateVipTierWithOrderId(Long customerId, Long orderId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        BigDecimal totalPurchase = customer.getTotalPurchaseAmount();
        Long oldTierId = customer.getCurrentVipTierId();

        // Tìm tier cao nhất mà customer đạt được (tier_level DESC)
        Optional<MemberPricingTier> newTier = tierRepository
                .findHighestTierByPurchaseAmount(totalPurchase);

        Long newTierId = newTier.map(MemberPricingTier::getId).orElse(null);
        String newTierName = newTier.map(MemberPricingTier::getTierName).orElse(null);

        // Chỉ upgrade nếu tier mới cao hơn tier cũ
        if (newTierId != null && !newTierId.equals(oldTierId)) {
            // Kiểm tra tier level để đảm bảo chỉ upgrade, không downgrade
            if (oldTierId == null || isTierUpgrade(oldTierId, newTierId)) {
                customer.setCurrentVipTierId(newTierId);
                customer.setCurrentVipTierName(newTierName);
                customerRepository.save(customer);

                // Lưu lịch sử upgrade
                saveVipHistory(customer, oldTierId, newTierId, newTierName, orderId);

                log.info("Customer {} upgraded to VIP tier: {} (Total purchase: {})", 
                        customerId, newTierName, totalPurchase);
            }
        }
    }

    /**
     * Kiểm tra xem có phải upgrade tier không (tier mới có level cao hơn)
     */
    private boolean isTierUpgrade(Long oldTierId, Long newTierId) {
        Optional<MemberPricingTier> oldTier = tierRepository.findById(oldTierId);
        Optional<MemberPricingTier> newTier = tierRepository.findById(newTierId);
        
        if (oldTier.isEmpty() || newTier.isEmpty()) {
            return true; // Nếu không tìm thấy tier cũ, coi như upgrade
        }
        
        return newTier.get().getTierLevel() > oldTier.get().getTierLevel();
    }

    /**
     * Lưu snapshot vào customer_lifetime_value
     */
    private void saveLifetimeValueSnapshot(Customer customer, Long orderId) {
        CustomerLifetimeValue snapshot = CustomerLifetimeValue.builder()
                .customer(customer)
                .totalPurchaseAmount(customer.getTotalPurchaseAmount())
                .totalOrdersCount(customer.getTotalOrdersCount())
                .totalOrdersPaidCount(customer.getTotalOrdersPaidCount())
                .vipTierId(customer.getCurrentVipTierId())
                .vipTierName(customer.getCurrentVipTierName())
                .periodType(CustomerLifetimeValue.PeriodType.SNAPSHOT)
                .calculatedAt(LocalDateTime.now())
                .build();

        lifetimeValueRepository.save(snapshot);
    }

    /**
     * Lưu lịch sử thay đổi VIP tier
     */
    private void saveVipHistory(Customer customer, Long oldTierId, Long newTierId, 
                                String newTierName, Long orderId) {
        CustomerVipHistory history = CustomerVipHistory.builder()
                .customer(customer)
                .oldTierId(oldTierId)
                .newTierId(newTierId)
                .newTierName(newTierName)
                .triggerType(CustomerVipHistory.TriggerType.PURCHASE_AMOUNT)
                .triggerValue(customer.getTotalPurchaseAmount())
                .orderId(orderId)
                .build();

        vipHistoryRepository.save(history);
    }
}

