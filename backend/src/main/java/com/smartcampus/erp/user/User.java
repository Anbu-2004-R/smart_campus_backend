package com.smartcampus.erp.user;

import java.time.LocalDateTime;

public record User(
        String id,
        String loginId,
        String email,
        String role,
        String status,
        LocalDateTime createdAt,
        LocalDateTime lastLogin,
        String avatarUrl) {

    public static User from(UserAccount account) {
        return new User(
                account.id(),
                account.loginId(),
                account.email(),
                account.role(),
                account.status(),
                account.createdAt(),
                account.lastLogin(),
                account.avatarUrl());
    }
}
