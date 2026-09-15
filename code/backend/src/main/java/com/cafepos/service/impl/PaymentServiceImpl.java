package com.cafepos.service.impl;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.entity.Order;
import com.cafepos.domain.entity.Payment;
import com.cafepos.domain.enums.PaymentMethod;
import com.cafepos.domain.event.OrderPaidEvent;
import com.cafepos.dto.request.PaymentRequest;
import com.cafepos.dto.response.PaymentResponse;
import com.cafepos.exception.BadRequestException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.PaymentMapper;
import com.cafepos.repository.OrderRepository;
import com.cafepos.repository.PaymentRepository;
import com.cafepos.service.PaymentService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ApplicationEventPublisher eventPublisher;

    public PaymentServiceImpl(OrderRepository orderRepository, PaymentRepository paymentRepository,
                              PaymentMapper paymentMapper, ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.paymentMapper = paymentMapper;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public PaymentResponse pay(Long orderId, PaymentRequest request, CurrentUser actor) {
        Order order = getVisibleOrder(orderId, actor);
        order.markPaid(); // State: PAID / CANCELLED -> 409
        BigDecimal received = validateAmount(request, order.getTotal());

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(request.method());
        payment.setAmount(received);
        payment.setPaidAt(Instant.now());
        // Two cashiers paying at the same moment: payments.order_id UNIQUE rejects the second one -> 409.
        paymentRepository.save(payment);

        PaymentResponse response = paymentMapper.toResponse(payment, order);
        eventPublisher.publishEvent(new OrderPaidEvent(order.getId(), order.getOrderNumber(), order.getCashier().getId(),
                payment.getMethod(), order.getTotal(), response.change(), payment.getPaidAt()));
        return response;
    }

    @Override
    public PaymentResponse findByOrder(Long orderId, CurrentUser actor) {
        Order order = getVisibleOrder(orderId, actor);
        return paymentRepository.findByOrderId(order.getId())
                .map(payment -> paymentMapper.toResponse(payment, order))
                .orElseThrow(() -> new ResourceNotFoundException("Payment for order", orderId));
    }

    /** Cash may be more than the total (change is given); QR/card is charged exactly. */
    private static BigDecimal validateAmount(PaymentRequest request, BigDecimal total) {
        BigDecimal received = request.amountReceived().setScale(2, RoundingMode.HALF_UP);
        if (received.compareTo(total) < 0) {
            throw new BadRequestException("Amount received " + received + " is less than the total " + total);
        }
        if (request.method() != PaymentMethod.CASH && received.compareTo(total) != 0) {
            throw new BadRequestException(request.method() + " payment must be exactly the total " + total);
        }
        return received;
    }

    private Order getVisibleOrder(Long orderId, CurrentUser actor) {
        return orderRepository.findVisibleById(orderId, actor)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }
}
