package com.cafepos.controller.api;

import com.cafepos.dto.request.PaymentRequest;
import com.cafepos.dto.response.PaymentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import static com.cafepos.common.NotImplementedYet.error;

/** F-32 – F-34. Payment is a sub-resource of an order (one payment per order). */
@RestController
@RequestMapping("/api/v1/orders/{orderId}/payment")
public class PaymentController {

    /** Order must be PENDING; already paid -> 409; amountReceived < total -> 400. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse pay(@PathVariable Long orderId, @Valid @RequestBody PaymentRequest request) {
        throw error();
    }

    @GetMapping
    public PaymentResponse findByOrder(@PathVariable Long orderId) {
        throw error();
    }
}
