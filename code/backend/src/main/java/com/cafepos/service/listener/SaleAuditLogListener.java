package com.cafepos.service.listener;

import com.cafepos.domain.event.OrderPaidEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Observer: writes one audit line per completed sale (visible in Render logs).
 * AFTER_COMMIT (the default) means it only runs if the payment was really saved — never for a rolled-back one.
 */
@Component
public class SaleAuditLogListener {

    private static final Logger log = LoggerFactory.getLogger(SaleAuditLogListener.class);

    @TransactionalEventListener
    public void onOrderPaid(OrderPaidEvent event) {
        log.info("SALE order={} cashier={} method={} total={} change={} paidAt={}",
                event.orderNumber(), event.cashierId(), event.method(), event.total(), event.change(), event.paidAt());
    }
}
