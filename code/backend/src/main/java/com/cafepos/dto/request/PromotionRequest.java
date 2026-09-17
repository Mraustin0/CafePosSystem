package com.cafepos.dto.request;

import com.cafepos.domain.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * discountType is PERCENT (value 0-100) or FIXED_AMOUNT (value in baht). NONE is not accepted here — a
 * promotion always applies some kind of discount. minOrderAmount is optional (null = no minimum).
 */
public record PromotionRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 100) String name,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal discountValue,
        @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal minOrderAmount,
        Boolean active) {
}
