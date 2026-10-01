package com.cafepos.exception;

/** Maps to 400 Bad Request — input passed @Valid but breaks a business rule (e.g. discount above subtotal). */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
