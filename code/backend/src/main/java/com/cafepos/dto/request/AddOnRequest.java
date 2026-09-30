package com.cafepos.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AddOnRequest(
        @NotBlank @Size(max = 50) String name,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal price) {
}
