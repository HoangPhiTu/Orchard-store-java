package com.orchard.orchard_store_backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmailChangeInitRequest {

    @NotNull(message = "UserId không được để trống")
    private Long userId;

    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String newEmail;
}

