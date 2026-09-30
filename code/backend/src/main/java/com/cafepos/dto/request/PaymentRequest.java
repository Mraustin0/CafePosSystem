package com.cafepos.dto.request;

import com.cafepos.domain.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** amountReceived must be >= order total. For QR_CODE / CARD send the exact total. */
public record PaymentRequest(
        @NotNull PaymentMethod method,
        @NotNull @DecimalMin("0.00") BigDecimal amountReceived) {
}
