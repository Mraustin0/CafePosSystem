package com.cafepos.controller.api;

import com.cafepos.domain.enums.Role;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.UserResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers controller binding + validation for the admin endpoints (findAll / findById / create).
 * /me, /me/profile, /me/password, update, updateStatus require @AuthenticationPrincipal Jwt →
 * see UserApiIntegrationTest (TODO) for those paths with real security context.
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private UserResponse sample(Long id, String username, Role role) {
        return new UserResponse(id, username, role, true, username.toUpperCase(), null, username + "@x.com", Instant.now());
    }

    @Test
    void findAll_bindsRoleAndActiveFilters() throws Exception {
        when(userService.findAll(eq(Role.CASHIER), eq(true), any()))
                .thenReturn(new PageResponse<>(List.of(sample(2L, "cashier1", Role.CASHIER)), 0, 20, 1, 1));

        mockMvc.perform(get("/api/v1/users").param("role", "CASHIER").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("cashier1"));
    }

    @Test
    void findById_returns200_whenExists() throws Exception {
        when(userService.findById(1L)).thenReturn(sample(1L, "admin", Role.ADMIN));

        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void findById_returns404_whenMissing() throws Exception {
        when(userService.findById(99L)).thenThrow(new ResourceNotFoundException("User", 99L));

        mockMvc.perform(get("/api/v1/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_returns201_withLocationHeader() throws Exception {
        when(userService.create(any())).thenReturn(sample(42L, "new.user", Role.CASHIER));

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"new.user","password":"password01","role":"CASHIER",
                                 "fullName":"New User","phone":"0812345678","email":"n@x.com"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42));
    }

    @Test
    void create_duplicateUsername_returns409() throws Exception {
        when(userService.create(any())).thenThrow(new ConflictException("username already exists"));

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"dup","password":"password01","role":"CASHIER","fullName":"Dup User"}"""))
                .andExpect(status().isConflict());
    }

    @Test
    void create_missingRequiredFields_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"x@x.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.username").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists())
                .andExpect(jsonPath("$.fieldErrors.role").exists())
                .andExpect(jsonPath("$.fieldErrors.fullName").exists());
    }

    @Test
    void create_passwordTooShort_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"u","password":"short","role":"CASHIER","fullName":"U"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void create_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"u","password":"password01","role":"CASHIER",
                                 "fullName":"U","email":"not-an-email"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }
}
