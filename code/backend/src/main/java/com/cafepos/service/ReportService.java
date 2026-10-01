package com.cafepos.service;

import com.cafepos.dto.response.CashierSalesResponse;
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
}
