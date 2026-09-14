package com.cafepos.dto.response;

import com.cafepos.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

/** Row in the order list — no items, to keep the list light. */
public record OrderSummaryResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        String cashierName,
        int itemCount,
        BigDecimal total,
        Instant createdAt) {
}
