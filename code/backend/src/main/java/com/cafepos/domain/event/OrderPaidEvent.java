package com.cafepos.domain.event;

import com.cafepos.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Observer pattern: published by the payment service after an order is paid. Listeners react without the
 * payment service knowing them (today: sale audit log; later e.g. LINE notify to the owner, kitchen display).
 */
public record OrderPaidEvent(
        Long orderId,
        String orderNumber,
        Long cashierId,
        PaymentMethod method,
        BigDecimal total,
        BigDecimal change,
        Instant paidAt) {
}
