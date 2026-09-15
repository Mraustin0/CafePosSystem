package com.cafepos.service.discount;

import com.cafepos.domain.enums.DiscountType;

import java.math.BigDecimal;

/**
 * Strategy pattern: one class per way of computing a discount. The order service picks the strategy by
 * {@link #type()}, so adding a discount (e.g. buy-2-get-1) is a new @Component, not a change to the service.
 */
public interface DiscountStrategy {

    DiscountType type();

    /**
     * @param subtotal order subtotal, >= 0
     * @param value    the number the cashier entered (meaning depends on the type; may be null for NONE)
     * @return discount amount with 2 decimals, between 0 and subtotal
     * @throws com.cafepos.exception.BadRequestException if value is missing or out of range
     */
    BigDecimal calculate(BigDecimal subtotal, BigDecimal value);
}
