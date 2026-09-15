package com.cafepos.common;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/** The logged-in user as services need it, read from the JWT (sub = user id, roles claim). */
public record CurrentUser(Long id, boolean admin) {

    public static CurrentUser from(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        return new CurrentUser(Long.valueOf(jwt.getSubject()), roles != null && roles.contains("ADMIN"));
    }
}
