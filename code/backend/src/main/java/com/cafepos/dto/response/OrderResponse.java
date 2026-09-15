package com.cafepos.dto.response;

import com.cafepos.domain.enums.DiscountType;
import com.cafepos.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** payment is null until the order is PAID. discountValue is what was entered (10 = 10% for PERCENT), null for NONE. */
public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        Long cashierId,
        String cashierName,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal discountAmount,
        BigDecimal total,
        Instant createdAt,
        PaymentResponse payment) {
}
