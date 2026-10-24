package com.smartcampus.erp.auth;

import java.time.LocalDateTime;

public record AccountToken(
        String id,
        String userId,
        String token,
        String type,
        LocalDateTime expiresAt,
        LocalDateTime usedAt) {
}
