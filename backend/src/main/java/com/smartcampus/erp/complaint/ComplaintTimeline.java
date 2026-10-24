package com.smartcampus.erp.complaint;

import java.time.LocalDateTime;

public record ComplaintTimeline(
        String id,
        String complaintId,
        String status,
        LocalDateTime timestamp,
        String changedBy,
        String notes) {
}
