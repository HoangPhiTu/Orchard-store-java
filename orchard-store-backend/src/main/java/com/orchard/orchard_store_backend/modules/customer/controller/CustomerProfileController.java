package com.orchard.orchard_store_backend.modules.customer.controller;

import com.orchard.orchard_store_backend.dto.ApiResponse;
import com.orchard.orchard_store_backend.modules.customer.dto.CustomerProfileDTO;
import com.orchard.orchard_store_backend.modules.customer.service.CustomerStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store/profile")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {

    private final CustomerStoreService customerStoreService;

    /**
     * Lấy thông tin tổng quan profile + VIP status.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CustomerProfileDTO>> getProfile() {
        CustomerProfileDTO profile = customerStoreService.getCustomerProfile();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin profile thành công", profile));
    }

    /**
     * Lấy lịch sử đơn hàng của customer.
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<CustomerProfileDTO.OrderSummaryDTO>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<CustomerProfileDTO.OrderSummaryDTO> orders = customerStoreService.getCustomerOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử đơn hàng thành công", orders));
    }
}

