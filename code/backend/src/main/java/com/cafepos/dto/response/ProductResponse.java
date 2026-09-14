package com.cafepos.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        BigDecimal price,
        String imageUrl,
        boolean active,
        CategoryResponse category,
        List<AddOnResponse> addOns) {
}
