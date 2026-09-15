package com.cafepos.domain.state;

import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.exception.ConflictException;

/** Closed bill: read-only, money already taken. */
final class PaidOrderState implements OrderState {

    static final PaidOrderState INSTANCE = new PaidOrderState();

    private PaidOrderState() {
    }

    @Override
    public void ensureModifiable() {
        throw new ConflictException("Order is already paid and cannot be changed");
    }

    @Override
    public OrderStatus cancel() {
        throw new ConflictException("Order is already paid and cannot be cancelled");
    }
}
