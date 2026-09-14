package com.cafepos.controller.api;

import com.cafepos.domain.enums.Role;
import com.cafepos.dto.request.*;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.UserResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.cafepos.common.NotImplementedYet.error;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    // ----- current user (F-03 – F-05) -----

    @GetMapping("/me")
    public UserResponse me() {
        throw error();
    }

    @PutMapping("/me/profile")
    public UserResponse updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        throw error();
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
        throw error();
    }

    // ----- admin (F-06 – F-09) -----

    @GetMapping
    public PageResponse<UserResponse> findAll(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20, sort = "username") Pageable pageable) {
        throw error();
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {
        throw error();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        throw error();
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        throw error();
    }

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        throw error();
    }
}
