package com.cafepos.repository;

import com.cafepos.domain.entity.UserProfile;
import com.cafepos.domain.enums.Role;
import org.springframework.data.jpa.domain.Specification;

/** Optional filters for the user list. A null argument means "no filter". */
public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<UserProfile> filter(Role role, Boolean active) {
        Specification<UserProfile> spec = Specification.unrestricted();
        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("role"), role));
        }
        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("active"), active));
        }
        return spec;
    }
}
