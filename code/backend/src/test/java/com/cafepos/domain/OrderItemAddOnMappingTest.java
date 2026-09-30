package com.cafepos.domain;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.domain.entity.OrderItem;
import com.cafepos.domain.entity.OrderItemAddOn;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.groups.Tuple.tuple;

/** V3 table order_item_add_ons <-> OrderItem.addOns, against the migrated schema and seed data. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // keep H2 in PostgreSQL mode + Flyway
class OrderItemAddOnMappingTest {

    @Autowired
    private EntityManager em;

    @Test
    void savesAndReloadsChosenAddOnsWithPriceSnapshot() {
        OrderItem latte = seedItem("ORD-DEMO-0005");
        latte.getAddOns().add(new OrderItemAddOn(addOn("Oat Milk"), new BigDecimal("20.00")));
        latte.getAddOns().add(new OrderItemAddOn(addOn("Extra Shot"), new BigDecimal("15.00")));
        em.flush();
        em.clear();

        OrderItem reloaded = em.find(OrderItem.class, latte.getId());
        assertThat(reloaded.getAddOns())
                .extracting(a -> a.getAddOn().getName(), OrderItemAddOn::getPrice)
                .containsExactlyInAnyOrder(
                        tuple("Oat Milk", new BigDecimal("20.00")),
                        tuple("Extra Shot", new BigDecimal("15.00")));
    }

    @Test
    void sameAddOnTwiceOnOneLine_isRejectedByPrimaryKey() {
        OrderItem latte = seedItem("ORD-DEMO-0005");
        AddOn oatMilk = addOn("Oat Milk");
        latte.getAddOns().add(new OrderItemAddOn(oatMilk, new BigDecimal("20.00")));
        latte.getAddOns().add(new OrderItemAddOn(oatMilk, new BigDecimal("20.00")));

        assertThatThrownBy(() -> em.flush()).isInstanceOf(RuntimeException.class);
    }

    private OrderItem seedItem(String orderNumber) {
        return em.createQuery("select i from OrderItem i where i.order.orderNumber = :n", OrderItem.class)
                .setParameter("n", orderNumber).getSingleResult();
    }

    private AddOn addOn(String name) {
        return em.createQuery("select a from AddOn a where a.name = :n", AddOn.class)
                .setParameter("n", name).getSingleResult();
    }
}
