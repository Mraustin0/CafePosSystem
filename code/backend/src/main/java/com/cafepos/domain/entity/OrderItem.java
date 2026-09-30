package com.cafepos.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    // Price snapshot at order time, not a live link to Product.price.
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // Value objects owned by this line: saved and deleted together with it, no separate repository.
    @ElementCollection
    @CollectionTable(name = "order_item_add_ons", joinColumns = @JoinColumn(name = "order_item_id"))
    private List<OrderItemAddOn> addOns = new ArrayList<>();

    /** quantity x (unit price + chosen add-on prices), all from order-time snapshots. */
    public BigDecimal lineTotal() {
        BigDecimal addOnTotal = addOns.stream().map(OrderItemAddOn::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        return unitPrice.add(addOnTotal).multiply(BigDecimal.valueOf(quantity));
    }
}
