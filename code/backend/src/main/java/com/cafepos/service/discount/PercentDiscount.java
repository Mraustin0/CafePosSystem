package com.cafepos.service.discount;

import com.cafepos.domain.enums.DiscountType;
import com.cafepos.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** value = percent 0–100. 10% of 105.00 = 10.50; half-satang rounds up. */
@Component
public class PercentDiscount implements DiscountStrategy {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    @Override
    public DiscountType type() {
        return DiscountType.PERCENT;
    }

    @Override
    public BigDecimal calculate(BigDecimal subtotal, BigDecimal value) {
        if (value == null || value.signum() < 0 || value.compareTo(HUNDRED) > 0) {
            throw new BadRequestException("Percent discount must be between 0 and 100");
        }
        return subtotal.multiply(value).divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }
}
