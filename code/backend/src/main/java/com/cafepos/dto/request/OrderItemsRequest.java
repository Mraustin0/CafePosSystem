package com.cafepos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/** Full cart: used to create an order and to replace the items of a PENDING order. */
public record OrderItemsRequest(@NotEmpty(message = "items must not be empty") List<@Valid OrderItemRequest> items) {
}
