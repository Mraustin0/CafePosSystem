package com.cafepos.dto.response;

import com.cafepos.domain.enums.PaymentMethod;

import java.math.BigDecimal;

public record PaymentMethodSalesResponse(PaymentMethod method, long orderCount, BigDecimal amount) {
}
