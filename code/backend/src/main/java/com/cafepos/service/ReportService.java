package com.cafepos.service;

import com.cafepos.dto.response.CashierSalesResponse;
import com.cafepos.dto.response.CategorySalesResponse;
import com.cafepos.dto.response.DaySalesResponse;
import com.cafepos.dto.response.PaymentMethodSalesResponse;
import com.cafepos.dto.response.SalesSummaryResponse;
import com.cafepos.dto.response.TopProductResponse;

import java.time.LocalDate;
import java.util.List;

/** from/to are inclusive shop dates (Asia/Bangkok) of the payment. from after to -> 400. */
public interface ReportService {

    SalesSummaryResponse salesSummary(LocalDate from, LocalDate to);

    /** Ordered by quantity sold, then revenue. Revenue includes add-ons, before the bill-level discount. */
    List<TopProductResponse> topProducts(LocalDate from, LocalDate to, int limit);

    List<CashierSalesResponse> salesByCashier(LocalDate from, LocalDate to);

    List<PaymentMethodSalesResponse> salesByPaymentMethod(LocalDate from, LocalDate to);

    /** Net sales per shop-day across the range; zero-sales days are included for stable chart x-axis. */
    List<DaySalesResponse> salesByDay(LocalDate from, LocalDate to);

    /** Revenue per product category (incl. add-ons), with percent share of total. Ordered by revenue DESC. */
    List<CategorySalesResponse> salesByCategory(LocalDate from, LocalDate to);
}
