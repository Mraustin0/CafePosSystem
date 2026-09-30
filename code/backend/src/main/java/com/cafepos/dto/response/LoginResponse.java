package com.cafepos.dto.response;

/** accessToken is a JWT — send it as "Authorization: Bearer {accessToken}". expiresIn is in seconds. */
public record LoginResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {
}
