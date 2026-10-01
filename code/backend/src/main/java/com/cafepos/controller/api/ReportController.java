package com.cafepos.controller.api;

import com.cafepos.dto.response.CashierSalesResponse;
import com.cafepos.dto.response.PaymentMethodSalesResponse;
import com.cafepos.dto.response.SalesSummaryResponse;
import com.cafepos.dto.response.TopProductResponse;
import com.cafepos.service.ReportService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * F-35 – F-38. Admin only. from/to are inclusive dates in Thai time and refer to when the order was paid;
 * only paid orders count. from after to -> 400.
 */
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales-summary")
    public SalesSummaryResponse salesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.salesSummary(from, to);
    }

    /** Revenue includes add-ons, before the bill-level discount. Ordered by quantity sold, then revenue. */
    @GetMapping("/top-products")
    public List<TopProductResponse> topProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit) {
        return reportService.topProducts(from, to, limit);
    }

    @GetMapping("/sales-by-cashier")
    public List<CashierSalesResponse> salesByCashier(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.salesByCashier(from, to);
    }

    @GetMapping("/sales-by-payment-method")
    public List<PaymentMethodSalesResponse> salesByPaymentMethod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.salesByPaymentMethod(from, to);
    }
}
