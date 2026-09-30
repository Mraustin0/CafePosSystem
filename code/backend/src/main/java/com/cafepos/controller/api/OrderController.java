package com.cafepos.controller.api;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.dto.request.ApplyDiscountRequest;
import com.cafepos.dto.request.OrderItemsRequest;
import com.cafepos.dto.response.OrderResponse;
import com.cafepos.dto.response.OrderSummaryResponse;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.service.OrderService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;

/** F-25 – F-31. A cashier only sees their own orders (others answer 404); an admin sees all. */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Creates a PENDING order for the logged-in cashier. Inactive product or add-on not allowed for it -> 400. */
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                                @Valid @RequestBody OrderItemsRequest request) {
        OrderResponse created = orderService.create(request, CurrentUser.from(jwt));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    /** from/to are inclusive dates in Thai time. cashierId is ignored for cashiers. sort: createdAt, total, orderNumber. */
    @GetMapping
    public PageResponse<OrderSummaryResponse> findAll(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long cashierId,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findAll(status, from, to, cashierId, pageable, CurrentUser.from(jwt));
    }

    @GetMapping("/{id}")
    public OrderResponse findById(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return orderService.findById(id, CurrentUser.from(jwt));
    }

    /** Replaces all items and removes the discount (apply it again). PENDING only, otherwise 409. */
    @PutMapping("/{id}/items")
    public OrderResponse replaceItems(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                      @PathVariable Long id, @Valid @RequestBody OrderItemsRequest request) {
        return orderService.replaceItems(id, request, CurrentUser.from(jwt));
    }

    /** PENDING only, otherwise 409. Percent above 100 or amount above subtotal -> 400. */
    @PutMapping("/{id}/discount")
    public OrderResponse applyDiscount(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long id, @Valid @RequestBody ApplyDiscountRequest request) {
        return orderService.applyDiscount(id, request, CurrentUser.from(jwt));
    }

    /** PENDING -> CANCELLED, otherwise 409. */
    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return orderService.cancel(id, CurrentUser.from(jwt));
    }
}
