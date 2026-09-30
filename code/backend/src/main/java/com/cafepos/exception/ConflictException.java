package com.cafepos.exception;

/** Maps to 409 Conflict — duplicates or actions blocked by existing data. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
