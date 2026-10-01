package com.cafepos.controller.api;

import com.cafepos.common.ShopTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Seed data (V2) paid 3, 2 and 1 days ago. Other test classes share this database and create orders paid today,
 * so the range stops at yesterday to keep the numbers exact:
 * <pre>
 * ORD-DEMO-0001  cashier1  CASH     subtotal 165.00  discount  0.00  total 165.00  Latte x2 (120) + Brownie (45)
 * ORD-DEMO-0002  cashier1  QR_CODE  subtotal 105.00  discount 10.50  total  94.50  Americano (50) + Croissant (55)
 * ORD-DEMO-0003  cashier2  CARD     subtotal 195.00  discount 20.00  total 175.00  Matcha Latte x3 (195)
 * </pre>
 */
@SpringBootTest
@AutoConfigureMockMvc
class ReportApiIntegrationTest {

    private static final RequestPostProcessor ADMIN = jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));

    private final LocalDate today = LocalDate.now(ShopTime.ZONE);
    private final String range = "from=" + today.minusDays(3) + "&to=" + today.minusDays(1);

    @Autowired
    private MockMvc mockMvc;

    @Test
    void salesSummary_countsPaidOrdersInRange() throws Exception {
        report("/sales-summary?" + range)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCount").value(3))
                .andExpect(jsonPath("$.grossSales").value(465.00))
                .andExpect(jsonPath("$.totalDiscount").value(30.50))
                .andExpect(jsonPath("$.netSales").value(434.50));
    }

    @Test
    void salesSummary_emptyRange_returnsZeros() throws Exception {
        report("/sales-summary?from=2000-01-01&to=2000-01-31")
                .andExpect(jsonPath("$.orderCount").value(0))
                .andExpect(jsonPath("$.netSales").value(0.00));
    }

    @Test
    void topProducts_orderedByQuantityThenRevenue_andLimited() throws Exception {
        report("/top-products?" + range + "&limit=4")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].productName", contains("Matcha Latte", "Latte", "Croissant", "Americano")))
                .andExpect(jsonPath("$[0].quantitySold").value(3))
                .andExpect(jsonPath("$[0].revenue").value(195.00));
    }

    @Test
    void salesByCashier_sumsTotalsAfterDiscount() throws Exception {
        report("/sales-by-cashier?" + range)
                .andExpect(jsonPath("$[*].cashierName", contains("Cashier One", "Cashier Two")))
                .andExpect(jsonPath("$[0].orderCount").value(2))
                .andExpect(jsonPath("$[0].netSales").value(259.50))
                .andExpect(jsonPath("$[1].netSales").value(175.00));
    }

    @Test
    void salesByPaymentMethod_usesOrderTotalNotCashReceived() throws Exception {
        // cash received for ORD-DEMO-0001 was 200.00, but the sale is 165.00
        report("/sales-by-payment-method?" + range)
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].method", contains("CARD", "CASH", "QR_CODE")))
                .andExpect(jsonPath("$[1].amount").value(165.00));
    }

    @Test
    void invalidRanges_return400() throws Exception {
        report("/sales-summary?from=2026-02-01&to=2026-01-01")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("from (2026-02-01) must not be after to (2026-01-01)"));
        report("/top-products?" + range + "&limit=0").andExpect(status().isBadRequest());
        report("/sales-by-cashier?from=2026-01-01").andExpect(status().isBadRequest());
    }

    private ResultActions report(String path) throws Exception {
        return mockMvc.perform(get("/api/v1/reports" + path).with(ADMIN));
    }
}
