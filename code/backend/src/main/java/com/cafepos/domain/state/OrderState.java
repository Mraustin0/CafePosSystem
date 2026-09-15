package com.cafepos.domain.state;

import com.cafepos.domain.enums.OrderStatus;

/**
 * State pattern: what an order may do depends on its status. Each status is one class, so a new status
 * (e.g. REFUNDED) is a new class instead of another if/else branch in the service.
 * <p>
 * Every method either succeeds or throws {@link com.cafepos.exception.ConflictException} (HTTP 409);
 * implementations never throw UnsupportedOperationException.
 */
public interface OrderState {

    /** Items and discount may change. */
    void ensureModifiable();

    /** @return the status after cancelling */
    OrderStatus cancel();

    static OrderState of(OrderStatus status) {
        return switch (status) {
            case PENDING -> PendingOrderState.INSTANCE;
            case PAID -> PaidOrderState.INSTANCE;
            case CANCELLED -> CancelledOrderState.INSTANCE;
        };
    }
}
