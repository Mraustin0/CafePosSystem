package com.cafepos.service;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.dto.request.ApplyDiscountRequest;
import com.cafepos.dto.request.OrderItemsRequest;
import com.cafepos.dto.response.OrderResponse;
import com.cafepos.dto.response.OrderSummaryResponse;
import com.cafepos.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

/**
 * A cashier only sees and changes their own orders (others answer 404); an admin sees all.
 */
public interface OrderService {

    OrderResponse create(OrderItemsRequest request, CurrentUser actor);

    PageResponse<OrderSummaryResponse> findAll(OrderStatus status, LocalDate from, LocalDate to, Long cashierId,
                                               Pageable pageable, CurrentUser actor);

    OrderResponse findById(Long id, CurrentUser actor);

    /**
     * Replaces every item and recalculates the saved discount for the new subtotal. PENDING only.
     * A fixed-amount discount larger than the new subtotal rejects the change (400) — nothing is modified.
     */
    OrderResponse replaceItems(Long id, OrderItemsRequest request, CurrentUser actor);

    OrderResponse applyDiscount(Long id, ApplyDiscountRequest request, CurrentUser actor);

    OrderResponse cancel(Long id, CurrentUser actor);
}
