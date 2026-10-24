package com.smartcampus.erp.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CorrectionRequest(
        String id,
        String studentId,
        String studentName,
        String registerNumber,
        String sessionId,
        String subjectId,
        String subjectCode,
        String subjectName,
        LocalDate sessionDate,
        String originalStatus,
        String requestedStatus,
        String reason,
        String evidenceNote,
        String status,
        boolean eligibleForFaculty,
        LocalDateTime submittedAt,
        String reviewedBy,
        String reviewerRole,
        LocalDateTime reviewedAt,
        String reviewRemarks) {
}
