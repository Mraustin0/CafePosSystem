package com.cafepos.repository;

import com.cafepos.domain.entity.Product;
import org.springframework.data.jpa.domain.Specification;

/** Optional filters for the product list. A null argument means "no filter". */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> filter(Long categoryId, String search, Boolean active) {
        Specification<Product> spec = Specification.unrestricted();
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + escapeLike(search.trim().toLowerCase()) + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern, '\\'));
        }
        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }
        return spec;
    }

    // Treat % and _ typed by the user as literal characters, not wildcards.
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
