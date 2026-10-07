package com.cafepos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Admin-side password reset — no current password needed. Admin cannot reset own via this endpoint. */
public record ResetPasswordRequest(
        @NotBlank @Size(min = 8, max = 72, message = "newPassword must be 8-72 characters") String newPassword) {
}
