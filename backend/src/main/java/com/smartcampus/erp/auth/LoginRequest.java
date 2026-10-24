package com.smartcampus.erp.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Select your role.") String role,
        @NotBlank(message = "Enter your login ID or email.") String loginId,
        @NotBlank(message = "Enter your password.") String password) {
}
