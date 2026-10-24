package com.smartcampus.erp.audit;

import java.time.LocalDateTime;

public record AuditLog(
        String id,
        String actorUserId,
        String actorName,
        String actorRole,
        String action,
        String entityType,
        String entityId,
        String details,
        LocalDateTime timestamp,
        String ipAddress) {
}
