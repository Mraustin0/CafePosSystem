package com.cafepos.dto.response;

import com.cafepos.domain.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

public record PromotionResponse(
        Long id,
        String code,
        String name,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        boolean active,
        Instant createdAt) {
}
