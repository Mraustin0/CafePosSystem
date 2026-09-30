package com.cafepos.repository;

import com.cafepos.domain.entity.Payment;
import com.cafepos.domain.enums.PaymentMethod;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Read-only sales aggregates. Every query starts from Payment: a payment exists only for PAID orders, and a sale
 * belongs to the day it was paid (paidAt), not the day the bill was opened. Range is [start, end).
 * Sums are null when nothing matches — the service turns them into 0.
 */
public interface ReportRepository extends Repository<Payment, Long> {

    interface SalesTotals {
        Long getOrderCount();
        BigDecimal getGrossSales();
        BigDecimal getTotalDiscount();
        BigDecimal getNetSales();
    }

    @Query("""
            select count(o) as orderCount, sum(o.subtotal) as grossSales,
                   sum(o.discountAmount) as totalDiscount, sum(o.total) as netSales
            from Payment p join p.order o
            where p.paidAt >= :start and p.paidAt < :end""")
    SalesTotals salesTotals(Instant start, Instant end);

    interface ProductSales {
        Long getProductId();
        String getProductName();
        Long getQuantity();
        BigDecimal getRevenue();
    }

    /** Revenue here is quantity x unit price only; add-ons come from {@link #productAddOnRevenue}. */
    @Query("""
            select pr.id as productId, pr.name as productName,
                   sum(i.quantity) as quantity, sum(i.quantity * i.unitPrice) as revenue
            from Payment p join p.order o join o.items i join i.product pr
            where p.paidAt >= :start and p.paidAt < :end
            group by pr.id, pr.name""")
    List<ProductSales> productSales(Instant start, Instant end);

    interface ProductRevenue {
        Long getProductId();
        BigDecimal getRevenue();
    }

    // Separate query: joining add-ons into productSales would repeat an item once per add-on and inflate its quantity.
    @Query("""
            select pr.id as productId, sum(i.quantity * a.price) as revenue
            from Payment p join p.order o join o.items i join i.addOns a join i.product pr
            where p.paidAt >= :start and p.paidAt < :end
            group by pr.id""")
    List<ProductRevenue> productAddOnRevenue(Instant start, Instant end);

    interface CashierSales {
        Long getCashierId();
        String getCashierName();
        Long getOrderCount();
        BigDecimal getNetSales();
    }

    @Query("""
            select c.id as cashierId, up.fullName as cashierName, count(o) as orderCount, sum(o.total) as netSales
            from Payment p join p.order o join o.cashier c join UserProfile up on up.user = c
            where p.paidAt >= :start and p.paidAt < :end
            group by c.id, up.fullName
            order by sum(o.total) desc""")
    List<CashierSales> salesByCashier(Instant start, Instant end);

    interface MethodSales {
        PaymentMethod getMethod();
        Long getOrderCount();
        BigDecimal getAmount();
    }

    /** amount = order totals, not cash received (received includes change handed back). */
    @Query("""
            select p.method as method, count(o) as orderCount, sum(o.total) as amount
            from Payment p join p.order o
            where p.paidAt >= :start and p.paidAt < :end
            group by p.method
            order by sum(o.total) desc""")
    List<MethodSales> salesByPaymentMethod(Instant start, Instant end);
}
