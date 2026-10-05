package com.cafepos.service.impl;

import com.cafepos.common.ShopTime;
import com.cafepos.dto.response.CashierSalesResponse;
import com.cafepos.dto.response.CategorySalesResponse;
import com.cafepos.dto.response.DaySalesResponse;
import com.cafepos.dto.response.PaymentMethodSalesResponse;
import com.cafepos.dto.response.SalesSummaryResponse;
import com.cafepos.dto.response.TopProductResponse;
import com.cafepos.exception.BadRequestException;
import com.cafepos.repository.ReportRepository;
import com.cafepos.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final ReportRepository reportRepository;

    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public SalesSummaryResponse salesSummary(LocalDate from, LocalDate to) {
        ReportRepository.SalesTotals t = reportRepository.salesTotals(start(from, to), end(to));
        return new SalesSummaryResponse(from, to, orZero(t.getOrderCount()),
                orZero(t.getGrossSales()), orZero(t.getTotalDiscount()), orZero(t.getNetSales()));
    }

    @Override
    public List<TopProductResponse> topProducts(LocalDate from, LocalDate to, int limit) {
        Instant start = start(from, to);
        Instant end = end(to);
        Map<Long, BigDecimal> addOnRevenue = reportRepository.productAddOnRevenue(start, end).stream()
                .collect(Collectors.toMap(ReportRepository.ProductRevenue::getProductId, r -> orZero(r.getRevenue())));

        return reportRepository.productSales(start, end).stream()
                .map(r -> new TopProductResponse(r.getProductId(), r.getProductName(), orZero(r.getQuantity()),
                        orZero(r.getRevenue()).add(addOnRevenue.getOrDefault(r.getProductId(), ZERO))))
                .sorted(Comparator.comparingLong(TopProductResponse::quantitySold).reversed()
                        .thenComparing(TopProductResponse::revenue, Comparator.reverseOrder())
                        .thenComparing(TopProductResponse::productName))
                .limit(limit)
                .toList();
    }

    @Override
    public List<CashierSalesResponse> salesByCashier(LocalDate from, LocalDate to) {
        return reportRepository.salesByCashier(start(from, to), end(to)).stream()
                .map(r -> new CashierSalesResponse(r.getCashierId(), r.getCashierName(),
                        orZero(r.getOrderCount()), orZero(r.getNetSales())))
                .toList();
    }

    @Override
    public List<PaymentMethodSalesResponse> salesByPaymentMethod(LocalDate from, LocalDate to) {
        return reportRepository.salesByPaymentMethod(start(from, to), end(to)).stream()
                .map(r -> new PaymentMethodSalesResponse(r.getMethod(), orZero(r.getOrderCount()), orZero(r.getAmount())))
                .toList();
    }

    @Override
    public List<DaySalesResponse> salesByDay(LocalDate from, LocalDate to) {
        Instant start = start(from, to);
        Instant end = end(to);
        // Group totals by shop-day in Java to stay timezone-safe without hand-written SQL date_trunc.
        Map<LocalDate, BigDecimal> byDay = reportRepository.paymentsInRange(start, end).stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPaidAt().atZone(ShopTime.ZONE).toLocalDate(),
                        Collectors.reducing(ZERO, p -> orZero(p.getTotal()), BigDecimal::add)));
        // Fill zero-sales days so the chart's x-axis is stable regardless of actual data gaps.
        List<DaySalesResponse> result = new ArrayList<>();
        LocalDate d = from;
        while (!d.isAfter(to)) {
            result.add(new DaySalesResponse(d, byDay.getOrDefault(d, ZERO)));
            d = d.plusDays(1);
        }
        return result;
    }

    @Override
    public List<CategorySalesResponse> salesByCategory(LocalDate from, LocalDate to) {
        Instant start = start(from, to);
        Instant end = end(to);
        Map<Long, BigDecimal> addOn = reportRepository.categoryAddOnRevenue(start, end).stream()
                .collect(Collectors.toMap(ReportRepository.CategoryRevenue::getCategoryId, r -> orZero(r.getRevenue())));
        List<ReportRepository.CategorySales> raw = reportRepository.salesByCategory(start, end);
        List<CategorySalesResponse> withRevenue = raw.stream()
                .map(r -> new CategorySalesResponse(
                        r.getCategoryId(), r.getCategoryName(),
                        orZero(r.getRevenue()).add(addOn.getOrDefault(r.getCategoryId(), ZERO)),
                        ZERO))
                .toList();
        BigDecimal total = withRevenue.stream().map(CategorySalesResponse::revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return withRevenue.stream()
                .map(r -> new CategorySalesResponse(r.categoryId(), r.categoryName(), r.revenue(),
                        total.signum() == 0 ? ZERO
                                : r.revenue().multiply(HUNDRED).divide(total, 2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(CategorySalesResponse::revenue, Comparator.reverseOrder()))
                .toList();
    }

    private static Instant start(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new BadRequestException("from (" + from + ") must not be after to (" + to + ")");
        }
        return ShopTime.startOfDay(from);
    }

    private static Instant end(LocalDate to) {
        return ShopTime.startOfDay(to.plusDays(1));
    }

    private static long orZero(Long value) {
        return value == null ? 0 : value;
    }

    private static BigDecimal orZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }
}
