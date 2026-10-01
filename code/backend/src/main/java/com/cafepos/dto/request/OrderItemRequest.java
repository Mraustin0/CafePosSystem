package com.cafepos.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

/** addOnIds: optional, each must be active and allowed for the product (product_add_ons), otherwise 400. */
public record OrderItemRequest(
        @NotNull Long productId,
        @Min(value = 1, message = "quantity must be at least 1") int quantity,
        Set<Long> addOnIds) {
}
