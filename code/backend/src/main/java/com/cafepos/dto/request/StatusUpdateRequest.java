package com.cafepos.dto.request;

import jakarta.validation.constraints.NotNull;

/** Used by PATCH /{id}/status on users, products and add-ons. */
public record StatusUpdateRequest(@NotNull(message = "active is required") Boolean active) {
}
