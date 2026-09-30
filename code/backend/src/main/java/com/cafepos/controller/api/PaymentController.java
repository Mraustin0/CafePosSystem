package com.cafepos.controller.api;

import com.cafepos.common.CurrentUser;
import com.cafepos.dto.request.PaymentRequest;
import com.cafepos.dto.response.PaymentResponse;
import com.cafepos.service.PaymentService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/** F-32 – F-34. Payment is a sub-resource of an order (one payment per order). */
@RestController
@RequestMapping("/api/v1/orders/{orderId}/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Order must be PENDING (paid or cancelled -> 409). CASH: amountReceived >= total, change is returned;
     * QR_CODE / CARD: amountReceived must equal the total (otherwise 400).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse pay(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                               @PathVariable Long orderId, @Valid @RequestBody PaymentRequest request) {
        return paymentService.pay(orderId, request, CurrentUser.from(jwt));
    }

    /** 404 if the order is not paid yet. */
    @GetMapping
    public PaymentResponse findByOrder(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long orderId) {
        return paymentService.findByOrder(orderId, CurrentUser.from(jwt));
    }
}
