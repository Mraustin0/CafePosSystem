package com.cafepos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Net sales (post-discount) grouped by shop-day (Asia/Bangkok) within a date range.
 * Days with zero sales are included — the UI can render a flat chart segment instead of a gap.
 */
public record DaySalesResponse(LocalDate date, BigDecimal netSales) {
}
