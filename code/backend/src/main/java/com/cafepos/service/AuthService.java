package com.cafepos.service;

import com.cafepos.dto.request.LoginRequest;
import com.cafepos.dto.response.LoginResponse;

public interface AuthService {

    /** @throws org.springframework.security.authentication.BadCredentialsException wrong username/password or inactive user */
    LoginResponse login(LoginRequest request);
}
