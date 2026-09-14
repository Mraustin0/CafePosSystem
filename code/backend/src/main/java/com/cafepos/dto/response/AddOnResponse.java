package com.cafepos.dto.response;

import java.math.BigDecimal;

public record AddOnResponse(Long id, String name, BigDecimal price, boolean active) {
}
