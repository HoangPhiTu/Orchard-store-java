package com.orchard.orchard_store_backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}

