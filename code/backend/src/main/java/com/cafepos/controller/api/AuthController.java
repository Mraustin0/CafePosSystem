package com.cafepos.controller.api;

import com.cafepos.dto.request.LoginRequest;
import com.cafepos.dto.response.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.cafepos.common.NotImplementedYet.error;

/** F-01. Logout (F-02) is client-side: discard the token. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        throw error();
    }
}
