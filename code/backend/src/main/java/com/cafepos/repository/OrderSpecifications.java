package com.cafepos.repository;

import com.cafepos.common.ShopTime;
import com.cafepos.domain.entity.Order;
import com.cafepos.domain.enums.OrderStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;

/** Optional filters for the order list. A null argument means "no filter". from/to are inclusive shop dates. */
public final class OrderSpecifications {

    private OrderSpecifications() {
    }

    public static Specification<Order> filter(OrderStatus status, LocalDate from, LocalDate to, Long cashierId) {
        Specification<Order> spec = Specification.unrestricted();
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (from != null) {
            Instant start = ShopTime.startOfDay(from);
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), start));
        }
        if (to != null) {
            Instant end = ShopTime.startOfDay(to.plusDays(1));
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdAt"), end));
        }
        if (cashierId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("cashier").get("id"), cashierId));
        }
        return spec;
    }
}
