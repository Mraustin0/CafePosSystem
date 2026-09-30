package com.cafepos.domain.state;

import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.exception.ConflictException;

/** Void bill: read-only. */
final class CancelledOrderState implements OrderState {

    static final CancelledOrderState INSTANCE = new CancelledOrderState();

    private CancelledOrderState() {
    }

    @Override
    public void ensureModifiable() {
        throw new ConflictException("Order is cancelled and cannot be changed");
    }

    @Override
    public OrderStatus cancel() {
        throw new ConflictException("Order is already cancelled");
    }

    @Override
    public OrderStatus pay() {
        throw new ConflictException("Order is cancelled and cannot be paid");
    }
}
