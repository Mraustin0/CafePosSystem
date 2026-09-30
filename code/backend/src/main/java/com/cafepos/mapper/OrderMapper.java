package com.cafepos.mapper;

import com.cafepos.domain.entity.Order;
import com.cafepos.domain.entity.OrderItem;
import com.cafepos.domain.entity.OrderItemAddOn;
import com.cafepos.domain.entity.Payment;
import com.cafepos.dto.response.OrderItemAddOnResponse;
import com.cafepos.dto.response.OrderItemResponse;
import com.cafepos.dto.response.OrderResponse;
import com.cafepos.dto.response.OrderSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class OrderMapper {

    private final PaymentMapper paymentMapper;

    public OrderMapper(PaymentMapper paymentMapper) {
        this.paymentMapper = paymentMapper;
    }

    /** payment may be null (order not paid). */
    public OrderResponse toResponse(Order order, String cashierName, Payment payment) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getCashier().getId(),
                cashierName,
                order.getItems().stream().map(this::toItemResponse).toList(),
                order.getSubtotal(),
                order.getDiscountType(),
                order.getDiscountValue(),
                order.getDiscountAmount(),
                order.getTotal(),
                order.getCreatedAt(),
                payment == null ? null : paymentMapper.toResponse(payment, order));
    }

    public OrderSummaryResponse toSummary(Order order, String cashierName) {
        int quantity = order.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
        return new OrderSummaryResponse(order.getId(), order.getOrderNumber(), order.getStatus(), cashierName,
                quantity, order.getTotal(), order.getCreatedAt());
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getAddOns().stream()
                        .map(a -> new OrderItemAddOnResponse(a.getAddOn().getId(), a.getAddOn().getName(), a.getPrice()))
                        .sorted(Comparator.comparing(OrderItemAddOnResponse::name))
                        .toList(),
                item.lineTotal());
    }
}
