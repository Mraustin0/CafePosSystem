package com.cafepos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        @Email @Size(max = 100) String email) {
}
