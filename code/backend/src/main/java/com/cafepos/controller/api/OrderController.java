package com.cafepos.controller.api;

import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.dto.request.ApplyDiscountRequest;
import com.cafepos.dto.request.OrderItemsRequest;
import com.cafepos.dto.response.OrderResponse;
import com.cafepos.dto.response.OrderSummaryResponse;
import com.cafepos.dto.response.PageResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import static com.cafepos.common.NotImplementedYet.error;

/** F-25 – F-31 */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderItemsRequest request) {
        throw error();
    }

    /** Cashier sees only own orders; Admin can filter by cashierId. */
    @GetMapping
    public PageResponse<OrderSummaryResponse> findAll(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long cashierId,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        throw error();
    }

    @GetMapping("/{id}")
    public OrderResponse findById(@PathVariable Long id) {
        throw error();
    }

    /** Replaces all items. PENDING only, otherwise 409. */
    @PutMapping("/{id}/items")
    public OrderResponse replaceItems(@PathVariable Long id, @Valid @RequestBody OrderItemsRequest request) {
        throw error();
    }

    /** PENDING only, otherwise 409. */
    @PutMapping("/{id}/discount")
    public OrderResponse applyDiscount(@PathVariable Long id, @Valid @RequestBody ApplyDiscountRequest request) {
        throw error();
    }

    /** PENDING -> CANCELLED, otherwise 409. */
    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        throw error();
    }
}
