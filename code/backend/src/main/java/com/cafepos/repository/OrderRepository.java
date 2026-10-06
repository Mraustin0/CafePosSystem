package com.cafepos.repository;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    /** Admins see every order, cashiers only their own; anything else is treated as not found. */
    default Optional<Order> findVisibleById(Long id, CurrentUser actor) {
        return findById(id).filter(o -> actor.admin() || o.getCashier().getId().equals(actor.id()));
    }

    // BE-05: hard-delete history guards. If any order already references this product/add-on,
    // the admin has to soft-delete (PATCH status) to preserve the audit trail of past bills.
    @Query("select count(i) > 0 from Order o join o.items i where i.product.id = :productId")
    boolean existsOrderItemByProductId(@Param("productId") Long productId);

    @Query("select count(a) > 0 from Order o join o.items i join i.addOns a where a.addOn.id = :addOnId")
    boolean existsOrderItemByAddOnId(@Param("addOnId") Long addOnId);
}
