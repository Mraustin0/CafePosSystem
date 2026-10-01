package com.cafepos.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Set;

/** addOnIds replaces the whole add-on list of the product (empty set = no add-ons). */
public record ProductRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal price,
        @Size(max = 500) String imageUrl,
        Set<Long> addOnIds) {
}
