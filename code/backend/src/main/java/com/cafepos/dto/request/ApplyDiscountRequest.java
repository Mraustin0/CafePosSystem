package com.cafepos.dto.request;

import com.cafepos.domain.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** PERCENT: value 0-100, FIXED_AMOUNT: baht, NONE: value ignored (removes the discount). */
public record ApplyDiscountRequest(
        @NotNull DiscountType type,
        @DecimalMin("0.00") BigDecimal value) {
}
