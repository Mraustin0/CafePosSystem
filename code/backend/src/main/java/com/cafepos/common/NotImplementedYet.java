package com.cafepos.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Temporary: endpoints whose contract is published in Swagger but whose logic is not built yet answer 501.
 * Delete this class once every controller calls a real service.
 */
public final class NotImplementedYet {

    private NotImplementedYet() {
    }

    public static ResponseStatusException error() {
        return new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Not implemented yet");
    }
}
