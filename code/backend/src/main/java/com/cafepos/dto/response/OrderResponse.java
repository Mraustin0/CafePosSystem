package com.cafepos.dto.response;

import com.cafepos.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** payment is null until the order is PAID. */
public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        Long cashierId,
        String cashierName,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal total,
        Instant createdAt,
        PaymentResponse payment) {
}
