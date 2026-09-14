package com.cafepos.dto.response;

import com.cafepos.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long orderId,
        PaymentMethod method,
        BigDecimal amountReceived,
        BigDecimal change,
        Instant paidAt) {
}
