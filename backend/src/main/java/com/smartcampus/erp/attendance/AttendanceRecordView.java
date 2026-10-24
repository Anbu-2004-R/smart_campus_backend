package com.smartcampus.erp.attendance;

public record AttendanceRecordView(
        String id,
        String studentId,
        String registerNumber,
        String studentName,
        String status,
        String remarks) {
}
