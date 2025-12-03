package com.orchard.orchard_store_backend.modules.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDTO {

    private Long id;

    @NotBlank(message = "Tên kho không được để trống")
    @Size(min = 2, max = 255, message = "Tên kho phải từ 2 đến 255 ký tự")
    private String name;

    @NotBlank(message = "Mã kho không được để trống")
    @Size(min = 2, max = 50, message = "Mã kho phải từ 2 đến 50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Mã kho chỉ được chứa chữ in hoa, số, dấu gạch dưới và dấu gạch ngang")
    private String code;

    @Size(max = 1000, message = "Địa chỉ không được vượt quá 1000 ký tự")
    private String address;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    @Pattern(regexp = "^[0-9+\\-()\\s]*$", message = "Số điện thoại không hợp lệ")
    private String contactPhone;

    private Boolean isDefault;

    @Pattern(regexp = "^(ACTIVE|INACTIVE)$",
            message = "Status phải là ACTIVE hoặc INACTIVE")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

