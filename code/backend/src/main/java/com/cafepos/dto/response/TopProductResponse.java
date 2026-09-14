package com.cafepos.dto.response;

import java.math.BigDecimal;

public record TopProductResponse(Long productId, String productName, long quantitySold, BigDecimal revenue) {
}
