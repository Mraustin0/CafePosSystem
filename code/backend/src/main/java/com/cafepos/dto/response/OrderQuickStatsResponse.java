package com.cafepos.dto.response;

import java.math.BigDecimal;

/**
 * Today's at-a-glance figures for a POS top bar / dashboard tile.
 * - orderCount: count of PAID orders today
 * - netSales: sum of PAID order totals today (post-discount)
 * - avgOrderValue: netSales / orderCount, HALF_UP to 2 decimals; zero when no orders
 * - pendingCount: PENDING orders still open — surfaces stuck orders needing cancel/complete
 * Cashiers see only their own; admins see all.
 */
public record OrderQuickStatsResponse(
        long orderCount,
        BigDecimal netSales,
        BigDecimal avgOrderValue,
        long pendingCount) {
}
