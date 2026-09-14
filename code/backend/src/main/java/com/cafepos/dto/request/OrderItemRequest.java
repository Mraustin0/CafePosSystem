package com.cafepos.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotNull Long productId,
        @Min(value = 1, message = "quantity must be at least 1") int quantity) {
}
