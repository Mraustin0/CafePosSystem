package com.cafepos.service;

import com.cafepos.common.CurrentUser;
import com.cafepos.dto.request.PaymentRequest;
import com.cafepos.dto.response.PaymentResponse;

/** Same visibility as orders: a cashier can only pay and read their own orders (others answer 404). */
public interface PaymentService {

    /**
     * PENDING order only (paid/cancelled -> 409). CASH: amountReceived >= total; QR_CODE/CARD: exactly the total
     * (otherwise 400). Publishes {@link com.cafepos.domain.event.OrderPaidEvent}.
     */
    PaymentResponse pay(Long orderId, PaymentRequest request, CurrentUser actor);

    /** 404 if the order is not paid yet. */
    PaymentResponse findByOrder(Long orderId, CurrentUser actor);
}
