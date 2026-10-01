package com.cafepos.service.impl;

import com.cafepos.common.ShopTime;
import com.cafepos.dto.response.TopProductResponse;
import com.cafepos.repository.ReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    private static final LocalDate DAY = LocalDate.of(2026, 9, 15);

    @Mock
    private ReportRepository reportRepository;

    @Test
    void topProducts_addsAddOnRevenue_andRanksByQuantityThenRevenue() {
        Instant start = ShopTime.startOfDay(DAY);
        Instant end = ShopTime.startOfDay(DAY.plusDays(1));
        when(reportRepository.productSales(start, end)).thenReturn(List.of(
                new Sales(1L, "Espresso", 2L, new BigDecimal("90.00")),
                new Sales(3L, "Latte", 2L, new BigDecimal("120.00")),
                new Sales(7L, "Croissant", 5L, new BigDecimal("275.00"))));
        when(reportRepository.productAddOnRevenue(start, end)).thenReturn(List.of(
                new Revenue(1L, new BigDecimal("40.00")))); // Espresso 90 + 40 = 130 > Latte 120

        List<TopProductResponse> top = new ReportServiceImpl(reportRepository).topProducts(DAY, DAY, 2);

        assertThat(top).extracting(TopProductResponse::productName).containsExactly("Croissant", "Espresso");
        assertThat(top.get(1).revenue()).isEqualByComparingTo("130.00");
    }

    @Test
    void shopDay_startsAtMidnightThaiTime() {
        assertThat(ShopTime.startOfDay(DAY)).isEqualTo(Instant.parse("2026-09-14T17:00:00Z"));
    }

    private record Sales(Long getProductId, String getProductName, Long getQuantity, BigDecimal getRevenue)
            implements ReportRepository.ProductSales {
    }

    private record Revenue(Long getProductId, BigDecimal getRevenue) implements ReportRepository.ProductRevenue {
    }
}
