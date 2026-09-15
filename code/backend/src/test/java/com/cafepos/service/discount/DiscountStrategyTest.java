package com.cafepos.service.discount;

import com.cafepos.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DiscountStrategyTest {

    private static final BigDecimal SUBTOTAL = new BigDecimal("105.00");

    @Test
    void none_isAlwaysZero() {
        assertThat(new NoDiscount().calculate(SUBTOTAL, null)).isEqualByComparingTo("0.00");
    }

    @Test
    void percent_roundsHalfUpToTwoDecimals() {
        PercentDiscount percent = new PercentDiscount();

        assertThat(percent.calculate(SUBTOTAL, BigDecimal.TEN)).isEqualTo(new BigDecimal("10.50"));
        assertThat(percent.calculate(new BigDecimal("55.55"), new BigDecimal("10"))).isEqualTo(new BigDecimal("5.56"));
        assertThat(percent.calculate(SUBTOTAL, new BigDecimal("100"))).isEqualTo(new BigDecimal("105.00"));
    }

    @Test
    void percent_rejectsMissingOrOutOfRange() {
        PercentDiscount percent = new PercentDiscount();

        assertThatThrownBy(() -> percent.calculate(SUBTOTAL, null)).isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> percent.calculate(SUBTOTAL, new BigDecimal("100.01"))).isInstanceOf(BadRequestException.class);
    }

    @Test
    void fixed_returnsAmount_butNeverMoreThanSubtotal() {
        FixedAmountDiscount fixed = new FixedAmountDiscount();

        assertThat(fixed.calculate(SUBTOTAL, new BigDecimal("20"))).isEqualTo(new BigDecimal("20.00"));
        assertThat(fixed.calculate(SUBTOTAL, SUBTOTAL)).isEqualByComparingTo(SUBTOTAL);
        assertThatThrownBy(() -> fixed.calculate(SUBTOTAL, new BigDecimal("105.01"))).isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> fixed.calculate(SUBTOTAL, null)).isInstanceOf(BadRequestException.class);
    }
}
