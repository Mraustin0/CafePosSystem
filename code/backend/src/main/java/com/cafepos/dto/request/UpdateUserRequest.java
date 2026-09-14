package com.cafepos.dto.request;

import com.cafepos.domain.enums.Role;
import jakarta.validation.constraints.*;

public record UpdateUserRequest(
        @NotNull Role role,
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        @Email @Size(max = 100) String email) {
}
