package com.cafepos.service.discount;

import com.cafepos.domain.enums.DiscountType;
import com.cafepos.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** value = baht off, must not exceed the subtotal (a bill can't go negative). */
@Component
public class FixedAmountDiscount implements DiscountStrategy {

    @Override
    public DiscountType type() {
        return DiscountType.FIXED_AMOUNT;
    }

    @Override
    public BigDecimal calculate(BigDecimal subtotal, BigDecimal value) {
        if (value == null || value.signum() < 0) {
            throw new BadRequestException("Discount amount must be 0 or more");
        }
        if (value.compareTo(subtotal) > 0) {
            throw new BadRequestException("Discount amount cannot exceed the subtotal (" + subtotal + ")");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
