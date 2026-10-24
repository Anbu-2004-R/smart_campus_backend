package com.smartcampus.erp.attendance;

public record AttendanceRecord(
        String id,
        String sessionId,
        String studentId,
        String status,
        String remarks) {
}
