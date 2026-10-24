package com.smartcampus.erp.user;

import java.time.LocalDateTime;

public record InviteResponse(
        User user,
        String activationToken,
        LocalDateTime expiresAt) {
}
