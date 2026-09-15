package com.cafepos.repository;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    /** Admins see every order, cashiers only their own; anything else is treated as not found. */
    default Optional<Order> findVisibleById(Long id, CurrentUser actor) {
        return findById(id).filter(o -> actor.admin() || o.getCashier().getId().equals(actor.id()));
    }
}
