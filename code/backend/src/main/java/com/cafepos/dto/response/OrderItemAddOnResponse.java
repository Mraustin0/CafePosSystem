package com.cafepos.dto.response;

import java.math.BigDecimal;

/** price is the add-on price when the order was placed, not the current price. */
public record OrderItemAddOnResponse(Long addOnId, String name, BigDecimal price) {
}
