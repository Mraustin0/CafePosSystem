package com.cafepos.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error body for every API error.
 * fieldErrors is only filled for validation failures (field name -> message).
 */
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, Map.of());
    }
}
