package com.cafepos.domain.state;

import com.cafepos.domain.enums.OrderStatus;

/** Open bill: everything is allowed. */
final class PendingOrderState implements OrderState {

    static final PendingOrderState INSTANCE = new PendingOrderState();

    private PendingOrderState() {
    }

    @Override
    public void ensureModifiable() {
        // allowed
    }

    @Override
    public OrderStatus cancel() {
        return OrderStatus.CANCELLED;
    }

    @Override
    public OrderStatus pay() {
        return OrderStatus.PAID;
    }
}
