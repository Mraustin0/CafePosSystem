package com.cafepos.service.impl;

import com.cafepos.common.ShopTime;
import com.cafepos.dto.response.CashierSalesResponse;
import com.cafepos.dto.response.PaymentMethodSalesResponse;
import com.cafepos.dto.response.SalesSummaryResponse;
import com.cafepos.dto.response.TopProductResponse;
import com.cafepos.exception.BadRequestException;
import com.cafepos.repository.ReportRepository;
import com.cafepos.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);

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
