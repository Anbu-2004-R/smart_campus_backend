package com.smartcampus.erp.exam;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MarksCorrection(
        String id,
        String examId,
        String subjectId,
        String subjectCode,
        String studentId,
        String studentName,
        String registerNumber,
        String facultyId,
        String facultyName,
        BigDecimal oldMarks,
        BigDecimal newMarks,
        String oldStatus,
        String newStatus,
        String reason,
        String status,
        LocalDateTime submittedAt,
        String reviewedByAdminId,
        LocalDateTime reviewedAt,
        String reviewNotes) {
}
