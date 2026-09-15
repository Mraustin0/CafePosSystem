package com.cafepos.mapper;

import com.cafepos.domain.entity.Order;
import com.cafepos.domain.entity.Payment;
import com.cafepos.dto.response.PaymentResponse;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    /** payments.amount is the money received; change = received - order total. */
    public PaymentResponse toResponse(Payment payment, Order order) {
        return new PaymentResponse(payment.getId(), order.getId(), payment.getMethod(), payment.getAmount(),
                payment.getAmount().subtract(order.getTotal()), payment.getPaidAt());
    }
}
