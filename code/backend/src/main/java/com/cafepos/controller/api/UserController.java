package com.cafepos.controller.api;

import com.cafepos.domain.enums.Role;
import com.cafepos.dto.request.*;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.UserResponse;
import com.cafepos.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ----- current user (F-03 – F-05) -----

    @GetMapping("/me")
    public UserResponse me(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return userService.findById(userId(jwt));
    }

    @PutMapping("/me/profile")
    public UserResponse updateMyProfile(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(userId(jwt), request);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                                 @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userId(jwt), request);
        return ResponseEntity.noContent().build();
    }

    // ----- admin (F-06 – F-09) -----

    /** sort accepts user fields with the "user." prefix, e.g. sort=user.username or sort=user.createdAt,desc; or fullName. */
    @GetMapping
    public PageResponse<UserResponse> findAll(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20, sort = "user.username") Pageable pageable) {
        return userService.findAll(role, active, pageable);
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    /** 409 if an admin tries to change their own role. */
    @PutMapping("/{id}")
    public UserResponse update(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                               @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request, userId(jwt));
    }

    /** 409 if an admin tries to deactivate their own account. */
    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
                                     @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return userService.updateStatus(id, request.active(), userId(jwt));
    }

    private static Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
