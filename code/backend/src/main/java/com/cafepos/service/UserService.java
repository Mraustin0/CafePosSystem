package com.cafepos.service;

import com.cafepos.domain.enums.Role;
import com.cafepos.dto.request.*;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

/** actorId = id of the logged-in user making the request. */
public interface UserService {

    UserResponse findById(Long id);

    UserResponse updateProfile(Long userId, ProfileUpdateRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    PageResponse<UserResponse> findAll(Role role, Boolean active, Pageable pageable);

    UserResponse create(CreateUserRequest request);

    UserResponse update(Long id, UpdateUserRequest request, Long actorId);

    UserResponse updateStatus(Long id, boolean active, Long actorId);
}
