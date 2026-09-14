package com.cafepos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "name is required")
        @Size(max = 50, message = "name must be at most 50 characters")
        String name) {
}
