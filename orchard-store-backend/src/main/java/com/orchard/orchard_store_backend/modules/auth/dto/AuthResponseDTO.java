package com.orchard.orchard_store_backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String type = "Bearer";

    private Long id;
    private String email;
    private String fullName;
    private String role;
}

