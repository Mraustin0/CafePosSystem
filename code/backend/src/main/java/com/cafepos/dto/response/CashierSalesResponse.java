package com.cafepos.dto.response;

import java.math.BigDecimal;

public record CashierSalesResponse(Long cashierId, String cashierName, long orderCount, BigDecimal netSales) {
}
