package com.smartcampus.erp.notification;

import java.time.LocalDateTime;

public record Notification(
        String id,
        String recipientUserId,
        String title,
        String message,
        String category,
        String referenceId,
        boolean read,
        LocalDateTime createdAt) {
}
