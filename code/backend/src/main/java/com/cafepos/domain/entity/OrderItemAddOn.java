package com.cafepos.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** A row of order_item_add_ons: which add-on a line got and what it cost at order time. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class OrderItemAddOn {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "add_on_id", nullable = false)
    private AddOn addOn;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public OrderItemAddOn(AddOn addOn, BigDecimal price) {
        this.addOn = addOn;
        this.price = price;
    }
}
