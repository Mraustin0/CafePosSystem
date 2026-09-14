package com.cafepos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Only PAID orders are counted. */
public record SalesSummaryResponse(
        LocalDate from,
        LocalDate to,
        long orderCount,
        BigDecimal grossSales,
        BigDecimal totalDiscount,
        BigDecimal netSales) {
}
