package com.cafepos.dto.response;

import java.math.BigDecimal;

/**
 * Revenue grouped by product category. revenue includes add-ons, before the bill-level discount.
 * percent is this category's revenue / total revenue × 100 (0 when there are no sales).
 * Ordered by revenue DESC.
 */
public record CategorySalesResponse(
        Long categoryId,
        String categoryName,
        BigDecimal revenue,
        BigDecimal percent) {
}
