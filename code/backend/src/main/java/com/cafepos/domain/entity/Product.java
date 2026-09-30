package com.cafepos.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // LAZY: product lists don't always need the category row.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Soft delete: products referenced by past orders must stay in the table.
    @Column(nullable = false)
    private boolean active = true;

    // Many-to-Many: which add-ons can be chosen for this product. No cascade — add-ons are managed on their own.
    @ManyToMany
    @JoinTable(
            name = "product_add_ons",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "add_on_id"))
    private Set<AddOn> addOns = new HashSet<>();
}
