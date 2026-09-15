package com.cafepos.domain.state;

import com.cafepos.domain.entity.Order;
import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.exception.ConflictException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderStateTest {

    @Test
    void pending_canBeModifiedAndCancelled() {
        Order order = order(OrderStatus.PENDING);

        assertThatCode(order::ensureModifiable).doesNotThrowAnyException();
        order.cancel();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void pending_canBePaid_onlyOnce() {
        Order order = order(OrderStatus.PENDING);

        order.markPaid();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        assertThatThrownBy(order::markPaid).hasMessageContaining("already paid");
    }

    @Test
    void cancelled_cannotBePaid() {
        assertThatThrownBy(order(OrderStatus.CANCELLED)::markPaid).isInstanceOf(ConflictException.class);
    }

    @Test
    void paid_isReadOnly() {
        Order order = order(OrderStatus.PAID);

        assertThatThrownBy(order::ensureModifiable).isInstanceOf(ConflictException.class);
        assertThatThrownBy(order::cancel).isInstanceOf(ConflictException.class);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    void cancelled_isReadOnly_andCannotBeCancelledTwice() {
        Order order = order(OrderStatus.CANCELLED);

        assertThatThrownBy(order::ensureModifiable).isInstanceOf(ConflictException.class);
        assertThatThrownBy(order::cancel).hasMessageContaining("already cancelled");
    }

    @Test
    void everyStatusHasAState() {
        for (OrderStatus status : OrderStatus.values()) {
            assertThat(OrderState.of(status)).isNotNull();
        }
    }

    private static Order order(OrderStatus status) {
        Order order = new Order();
        order.setStatus(status);
        return order;
    }
}
