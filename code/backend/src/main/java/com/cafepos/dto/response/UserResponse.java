package com.cafepos.dto.response;

import com.cafepos.domain.enums.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        Role role,
        boolean active,
        String fullName,
        String phone,
        String email,
        Instant createdAt) {
}
