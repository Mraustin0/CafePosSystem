package com.cafepos.service.discount;

import com.cafepos.domain.enums.DiscountType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class NoDiscount implements DiscountStrategy {

    @Override
    public DiscountType type() {
        return DiscountType.NONE;
    }

    @Override
    public BigDecimal calculate(BigDecimal subtotal, BigDecimal value) {
        return BigDecimal.ZERO.setScale(2);
    }
}
