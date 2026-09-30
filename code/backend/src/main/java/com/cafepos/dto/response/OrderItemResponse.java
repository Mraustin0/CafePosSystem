package com.cafepos.dto.response;

import java.math.BigDecimal;
import java.util.List;

/** lineTotal = quantity x (unitPrice + sum of addOns[].price). Prices are snapshots from order time. */
public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        List<OrderItemAddOnResponse> addOns,
        BigDecimal lineTotal) {
}
