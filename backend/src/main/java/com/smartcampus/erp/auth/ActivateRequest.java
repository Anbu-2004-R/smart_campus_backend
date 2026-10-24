package com.smartcampus.erp.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivateRequest(
        @NotBlank(message = "Activation token is required.") String token,
        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters.") String password) {
}
