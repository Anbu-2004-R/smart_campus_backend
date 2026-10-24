package com.smartcampus.erp.user;

import java.time.LocalDateTime;

/**
 * Internal authentication projection. Never returned directly from a controller.
 */
public record UserAccount(
        String id,
        String loginId,
        String email,
        String passwordHash,
        String role,
        String status,
        LocalDateTime createdAt,
        LocalDateTime lastLogin,
        String avatarUrl) {
}
