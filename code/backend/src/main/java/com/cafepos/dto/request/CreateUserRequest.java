package com.cafepos.dto.request;

import com.cafepos.domain.enums.Role;
import jakarta.validation.constraints.*;

public record CreateUserRequest(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Size(min = 8, max = 72, message = "password must be 8-72 characters") String password,
        @NotNull Role role,
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        @Email @Size(max = 100) String email) {
}
